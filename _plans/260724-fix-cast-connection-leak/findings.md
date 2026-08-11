# Cast Connection Leak: Diagnosis and Fix

Why `scripts/frontend/cast.py` in the maestro repo (`~/Repositories/maestro`) timed out on every cast to the three Nest displays, and the fix that replaced catt with direct pychromecast. The code fix is implemented and live-verified but not yet committed or deployed. Remediation of the running deployment and the `kill-shell` justfile bug are handled separately by the user (see Related Issues).

## Symptom

Every `cast_to_displays()` cron run (every 10 minutes) logged `Timed out while attempting to cast` for all three displays. Underneath, pychromecast logged `Failed to connect to service HostServiceInfo(host='192.168.0.125', port=8009), retrying in 5.0s`.

## Root Cause

`call_cast_command` ran `execute_cast` in a `ThreadPoolExecutor` with a 60s result timeout. On timeout, `executor.shutdown(wait=False, cancel_futures=True)` abandoned the worker thread but could not stop it. The abandoned thread:

1. Kept running `catt.controllers.setup_cast`, whose underlying pychromecast socket client retries the connection indefinitely.
2. Eventually connected when a slot freed up on the display, completed setup, and then held the connection forever. Nothing ever called `disconnect()`.

Chromecast devices cap concurrent sender connections per client IP. All container traffic NATs to the mac mini's LAN IP, so the accumulated zombie connections exhausted the displays' slots for the mini specifically. Every fresh cast attempt then had its TLS handshake dropped (TCP connect succeeds, ClientHello gets EOF), hung in pychromecast's retry loop past the 60s timeout, and leaked another zombie. The cycle was self-sustaining and survived container restarts.

Evidence gathered 2026-07-24 from production: 1,650 threads and 96 ESTABLISHED connections to port 8009 in the gunicorn worker after 47h uptime (~2 leaked threads per failed cast); TLS handshake to displays failed from the mini's IP but succeeded from a different client IP with identical library versions, confirming per-source-IP rejection.

## Key Protocol Discovery: the Already-Casting State

Live testing surfaced a second, older defect that shaped the fix. When DashCast is already running with a page loaded (the steady state whenever the dashboard is up):

- The device **ignores LAUNCH requests for an app that is already running**. `force_launch=True` in pychromecast only controls whether the LAUNCH message is sent; the protocol message has no force field, and the receiver responds with the existing session unchanged. `status_text` never becomes "Application ready".
- The DashCast receiver **stops listening on its namespace once it navigates** to the target page (`urn:x-cast:com.madmod.dashcast` disappears from the session's namespaces), so `load_url` messages cannot reach it either.

catt's `setup_cast(prep="app")` waits unboundedly for "Application ready" and therefore **hung forever in exactly this state**. This is the pre-timeout-wrapper hang (before maestro commit `bbe2b33`) that motivated the executor timeout in the first place. Historically, casts only genuinely succeeded when a display had dropped to idle/backdrop; every run against an already-casting display hung or timed out invisibly while the dashboard stayed up (HA's cast page plays keep-alive dummy media). The healthy steady-state behavior was always, effectively, "do nothing if already casting."

## The Fix (implemented in cast.py)

catt is replaced with direct pychromecast (`pychromecast>=14,<15` in pyproject.toml; catt and its yt-dlp transitive dep removed). `execute_cast` now:

1. `get_device_info(ip, timeout=10)` for uuid/model/name (bounded HTTP)
2. `get_chromecast_from_host(host, tries=1, timeout=15)` — with bounded tries, a failed connection makes the socket client's worker thread exit instead of retrying forever, and `cast.wait(timeout=15)` raises `RequestTimeout`
3. **Early return if `cast.app_id == APP_DASHCAST`** — the dashboard is already up, and per the discovery above the session can neither be relaunched nor messaged. If the session dies, the display falls back to idle and the next cron run re-casts.
4. Otherwise: register `pychromecast.controllers.dashcast.DashCastController`, `start_app(APP_DASHCAST, force_launch=True)`, wait (bounded 15s) for cast status `status_text == "Application ready"` (DashCast reports "Application is starting" first and rejects URLs until ready), then `load_url(CAST_URL, force=True)`. With the app running, the URL message sends synchronously; the receiver never acknowledges it, so there is nothing to wait on.
5. `finally: cast.disconnect(timeout=10)` on every path — disconnect is what stops the socket client thread and releases the display's per-client connection slot.

The `ThreadPoolExecutor` + timeout wrapper is deleted: every step is individually bounded, so the wrapper (and its inherent thread-abandonment problem) has no remaining purpose. The Redis lock (`exit_if_owned=True`), per-display serial loop, and 90s sleep are unchanged.

## Verification (2026-07-24, office display 192.168.0.125 from the MacBook)

- Full-cast branch: idle display → dashboard appeared, visually confirmed, zero lingering threads after disconnect.
- Early-return branch: active DashCast session recognized and logged, zero lingering threads.
- Failure branch: unreachable host raises after the bounded timeout, no retry loop, zero lingering threads.
- `uv run ruff check .`, `uv run ruff format .`, `uv run mypy .` (strict, pychromecast ships `py.typed`), `uv run pytest` all pass. The one failing test (`test_bathroom_floor.py::test_check_floor_temp`, int/float mismatch) pre-exists on clean `main` and is unrelated.

No unit tests were added: the cast path talks to real network hardware and the meaningful behavior (protocol sequencing, thread cleanup) is not protectable by mocks.

## Deployment Note

The new code cannot rescue a display that is still rejecting the mini's IP. Production remediation must happen first: kill the dangling `flask shell` container and restart the maestro service to release the held connections; power-cycle displays only if handshakes still fail afterward.

## Related Issues (user is handling)

1. Production remediation, as above.
2. `just kill-shell` has never worked: it greps `docker ps` default output where the command column is truncated (`"uv run --no-dev fla…"`), so `grep "flask shell"` never matches. Needs `docker ps --no-trunc` or a compose-label filter. This is why the dangling shell survived the Jul 22 deploy.
