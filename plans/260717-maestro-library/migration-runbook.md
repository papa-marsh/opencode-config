# Mac Mini Migration Runbook

Cutover from the old monolithic maestro deployment (`~/Repositories/maestro`) to the new maestro-scripts app on the mac mini. The new app depends on the hass-maestro library from GitHub (pinned by commit in `uv.lock`).

## Pre-flight

Both repos are pushed and validated:

- `github.com/papa-marsh/hass-maestro` (public, library, commit `a088b20c` pinned in the lock)
- `github.com/papa-marsh/maestro-scripts` main @ `19b4fba`

The Docker image was built and boot-tested locally on 2026-07-17. Three gitignored asset groups must be placed manually on the mini; they are NOT in git:

| Asset | Source of truth | Destination on mini |
|---|---|---|
| `.env` | old deployment: `~/Repositories/maestro/.env` | `~/Repositories/maestro-scripts/.env` |
| `scripts/config/secrets.py`, `zones.py` | local Mac: `~/Repositories/maestro-scripts/scripts/config/` | same path on mini |
| `registry/*.py` | local Mac: `~/Repositories/maestro-scripts/registry/` (imports already rewritten; do NOT use the mini's old generated copies) | same path on mini |

## Steps

```bash
# 1. From the local Mac: clone on the mini
ssh ssh.<owned_domain>.com
cd ~/Repositories && git clone git@github.com:papa-marsh/maestro-scripts.git
exit

# 2. From the local Mac: copy gitignored assets
cd ~/Repositories/maestro-scripts
scp registry/*.py ssh.<owned_domain>.com:Repositories/maestro-scripts/registry/
scp scripts/config/secrets.py scripts/config/zones.py ssh.<owned_domain>.com:Repositories/maestro-scripts/scripts/config/

# 3. On the mini: carry over env and cut over
ssh ssh.<owned_domain>.com
cp ~/Repositories/maestro/.env ~/Repositories/maestro-scripts/.env
cd ~/Repositories/maestro && docker compose down
cd ~/Repositories/maestro-scripts && just deploy
```

The `.env` works unchanged: `app.py` reads the same variable names the old `maestro/config.py` did. `MAESTRO_BACKGROUND_SERVICES` is new and optional (defaults to enabled; `just shell`/`just prune` set it to false per-invocation).

## Verification

- Logs show `WebSocket authenticated successfully` and `Script loading completed loaded=44 errors=0` (all 44 modules load once Redis is reachable)
- `Maestro app fully initialized`
- Redis keys appear under the `maestro:` prefix: `docker exec redis redis-cli --scan --pattern 'maestro:*' | head`
- A state-change automation fires (flip a switch, check logs)
- Cron/sun jobs registered: startup log line `Jobs scheduled`

## Expected migration effects

- **State cache**: old unprefixed `STATE:` keys are ignored; cache repopulates via cache-through reads and websocket events. Old keys expire on their own (1-week TTL).
- **Scheduled one-off jobs**: the APScheduler job store moved to `maestro:apscheduler.*` keys, so any pending delayed jobs from the old deployment are dropped. Debounce-style jobs will re-arm on their next trigger.
- **Postgres**: untouched. Same compose volume names (`postgres_data`, `redis_data`), same network, so existing data mounts into the new stack.
- **`REGISTERED:` keys**: re-created lazily under the prefix; harmless.

## Rollback

The old deployment is intact at `~/Repositories/maestro` (image, compose file, .env). To roll back: `docker compose down` in maestro-scripts, `docker compose up -d --build` in the old repo. The old code ignores prefixed keys the same way the new code ignores unprefixed ones.

## After soak

- Retire the old repo on the mini (`~/Repositories/maestro`) once confident; the mini also no longer needs `~/Repositories/maestro/scripts`
- Update the `platform` skill (`~/.config/opencode/skills/platform/SKILL.md`): maestro section should point at the two new repos, new deploy path `~/Repositories/maestro-scripts`, and note that hass-maestro is the library
- Library upgrades ship by pushing to hass-maestro main, then `just upgrade-maestro` in maestro-scripts (re-locks the pinned commit and redeploys)
