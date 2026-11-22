---
name: platform
description: Atlas of platform context - system architecture, services, repositories, design principles, and how the pieces fit together
session: ses_e3a0132c8ffe9Q1lsM9l9kwg6q
---

# Platform

High-level map of the homelab and development environment. Load this skill when you need to orient to what exists, where it lives, how things connect, or how to deploy something. Inner workings of each repo belong in that repo's AGENTS.md; this skill covers the cross-cutting view.

---

## Where You and the User Are

OpenCode sessions normally run on the Mac mini, with the user connecting from a separate device through SSH or the web interface. Laptop-local sessions are also possible. Verify your execution host (`hostname`, `$HOME`, working directory) rather than assuming.

---

## Infrastructure

### Mac Mini (central development and home server)

Hosts OpenCode, the long-running Docker services (Maestro, Meeshbot), and the Home Assistant VM. The user's laptop SSH config defines two hosts:

- `mini` (user `marshall`): connects to `192.168.0.139` on the home network, or through Cloudflare Tunnel at `ssh.marshallwarners.com` when the mini isn't reachable locally. `cloudflared` must be installed and authenticated on the laptop.
- `hass` (user `homeassistant`): connects to the Home Assistant VM at `192.168.0.145`, directly at home and through `mini` when away.

Use `ssh mini` or `ssh hass` from the laptop; VS Code Remote SSH uses the same host names. `marshallwarners.com` is the primary domain, managed through Cloudflare.

OpenCode starts at boot and owns the shared sessions and tool execution used by remote CLI and web clients. Its configuration is the `github.com/papa-marsh/opencode-config` repo at `~/.config/opencode`; sessions and credentials remain local to the server. Use the OpenCode skill for product configuration and troubleshooting.

### Home Assistant VM

Runs Home Assistant OS under QEMU on the Apple Silicon Mac mini. QEMU uses hardware virtualization and bridges the VM directly to the physical Ethernet interface, so the VM behaves as a standalone LAN device and receives multicast traffic used for device discovery.

- **Address:** `http://192.168.0.145` (port 80, not HA's usual 8123). Use the explicit IP rather than `homeassistant.local`.
- **Remote access:** Home Assistant Cloud (Nabu Casa).
- **VM state:** `~/Services/home-assistant/` on the Mac mini
- **Service:** system LaunchDaemon `com.marshallwarners.home-assistant`
- **Live config:** `/config` (resolves to `/homeassistant`) through the Advanced SSH & Web Terminal add-on.
- **Shell access:** `ssh -t homeassistant@192.168.0.145 'cd /config && exec "${SHELL:-/bin/bash}" -l'` on port 22.
- **Credentials:** `HOME_ASSISTANT_SSH_USERNAME` and `HOME_ASSISTANT_SSH_PASSWORD` in `~/.config/opencode/.env` on the mini to authenticate to the VM. Key-based SSH from the mini also works. Do not print credentials or put passwords in command arguments; use `expect` for automated password entry.
- **File access:** Connect VS Code Remote SSH to the `hass` host from the laptop and open `/config`. The add-on's `ssh.allow_tcp_forwarding` option permits the tunnel VS Code needs. Do not assume Samba is installed.
- **Permissions:** HA configuration files are root-owned; the SSH user has passwordless sudo. Agents can edit through `sudo -n`. Check repository ownership before running Git, and use `sudo -n git -C /config ...` for a root-owned repository. SSH connectivity alone does not grant VS Code write access. Do not change HA file ownership or globally disable Git ownership checks to work around permissions.

The Raspberry Pi at `192.168.0.107` that previously ran Home Assistant is powered off and plays no part in the system.

### Cloudflare

Used for cloud-hosted services and domain infrastructure:
- **`marshallwarners.com`**: Primary domain used for CF Worker routing and the SSH/OpenCode tunnel hostnames to the Mac mini
- **Workers**: Serverless edge functions deployed with `wrangler deploy`
- **D1 / R2**: SQLite-at-edge and object storage, with no active consumers
- **Cloudflare Tunnel / Access**: Provides authenticated remote access to the mini's SSH at `ssh.marshallwarners.com` and OpenCode web interface at `opencode.marshallwarners.com`.

---

## Repositories

Application repositories conventionally live in `~/Repositories`; check for the clone on the execution host. The Home Assistant repository lives inside the HAOS VM at `/config`; the OpenCode config repo lives at `~/.config/opencode`.

### hass-maestro (library)

**What:** Strongly-typed Python automation framework for Home Assistant, packaged as an installable library (import name `maestro`). Connects to HA via WebSocket and REST. Python 3.14+, Flask, SQLAlchemy, Redis, APScheduler, structlog, uv. All initialization is constructor-driven (`MaestroApp`); no import-time side effects. Public repo: `github.com/papa-marsh/hass-maestro`. Published to PyPI as `hass-maestro`; releases are cut by pushing a `v*` git tag, which triggers a GitHub Actions workflow that publishes via PyPI trusted publishing (OIDC, no tokens). CI (ruff, mypy, pytest) runs on GitHub Actions.

**Repo:** `~/Repositories/hass-maestro`

**Details:** `hass-maestro/AGENTS.md`

---

### maestro (application)

**What:** Personal Home Assistant automations built on hass-maestro; the deployed service. `app.py` constructs the `MaestroApp` from env vars; gunicorn serves `app:app` in Docker on the mac mini (compose stack: maestro + redis + postgres). `.env` points `HOME_ASSISTANT_URL` at the VM (`http://192.168.0.145:80`). The library dependency resolves from PyPI, pinned in `uv.lock`. Generated `registry/` modules and `scripts/config/` secrets are gitignored; do not assume they exist in every clone.

**Repo:** `~/Repositories/maestro` (public: `github.com/papa-marsh/maestro`)

**Deploy:** On the mini, `cd ~/Repositories/maestro && just pull-deploy`; SSH in first if executing elsewhere. To pick up new library releases, use the `/upgrade-maestro` command (bumps and tags a hass-maestro release, re-locks the dependency, and deploys).

**Details:** `maestro/AGENTS.md`

---

### home-assistant

**What:** The Home Assistant VM's live `/config` directory as a Git repository: `configuration.yaml`, YAML-mode Lovelace dashboards (`ui-cast.yaml` and `ui-mobile.yaml`, which compose card files under `lovelace/`), themes, scripts, and the sidebar panels.

**Repo:** The working copy is live at `/config` inside the VM, on `main`, tracking `github.com/papa-marsh/home-assistant`. There is no separate local clone; edits made in `/config` are live once HA reloads, and are then committed and pushed from the VM. Check `git status` before editing, since the user may have uncommitted work there.

**Access:** SSH or VS Code Remote SSH through the VM's Advanced SSH & Web Terminal add-on, as described above. Git is bundled with the add-on. Keep secrets, `.storage/`, databases, logs, and other runtime data out of commits; inspect staged contents before publishing.

---

### meeshbot

**What:** GroupMe bot that receives webhook events, persists messages, dispatches slash commands, and generates LLM-driven chat replies via Anthropic Claude. Runs in Docker on the mac mini. Python 3.14+, FastAPI, uvicorn, Oxyde ORM, APScheduler, structlog, uv.

**Repo:** `~/Repositories/meeshbot`

**Deploy:** On the mini, `cd ~/Repositories/meeshbot && just pull-deploy`; SSH in first if executing elsewhere.

**Details:** `meeshbot/AGENTS.md`

---

### http-receiver

**What:** Cloudflare Worker that logs authenticated HTTP requests. It is a debug utility for inspecting webhook payloads, not a production integration. TypeScript, Cloudflare Workers runtime.

**Repo:** `~/Repositories/http-receiver`

**Deploy:** `wrangler deploy` from the repo root

---

### rhythm

**What:** Native iOS app for recurring tasks. "Cadences" generate their next occurrence, called a "beat," on completion; a grace-period model decides when beats surface, fire notifications, and badge the icon. SwiftUI + SwiftData, synced to the user's private CloudKit database (`iCloud.marshallwarners.RhythmData`). Published on the App Store. Apple's stack is the whole backend, with no server component.

**Repo:** `~/Repositories/rhythm` (Xcode project under `Rhythm/`; the original design spec lives in `design_handoff_rhythm/` as read-only reference)

**Deploy:** On a Mac with Xcode and signing access: Archive → distribute through App Store Connect (TestFlight, then release). Build/test against an iOS simulator via `xcodebuild` (commands in the repo's AGENTS.md); verify those tools exist on the execution host. CloudKit schema changes must be additive. Deploy the CloudKit schema to production through the CloudKit Console before shipping a build that uses it.

**Details:** `rhythm/AGENTS.md`

---

### oxyde

**What:** A fork of the [Oxyde ORM](https://github.com/mr-fatalyst/oxyde), a Django-style async ORM with a Rust core and Python bindings used by meeshbot. The upstream maintainer is responsive to PRs; simple fixes can be made and pushed through this fork.

**Repo:** `~/Repositories/oxyde`

---

## How Services Fit Together

```
Home Assistant (QEMU VM on mac mini, 192.168.0.145:80)
    │  bridged LAN identity; remote access via Nabu Casa
    │
    │  WebSocket + REST API
    ▼
Maestro (mac mini, Docker)
    └─ maestro app, built on the hass-maestro library

GroupMe ──webhook──▶ Meeshbot (mac mini, Docker)

Cloudflare Workers (edge)
  └─ http-receiver (debug utility)
  └─ marshallwarners.com (domain + SSH/OpenCode tunnel to mac mini)

Laptop CLI (SSH) / remote browser (Cloudflare Access + pairing)
    └─ OpenCode (Mac mini, shared server) → mini files, tools, sessions, credentials

iPhone ──iCloud──▶ Rhythm (App Store app; CloudKit private DB is its only backend)
```

Maestro is the automation brain and a producer of dashboard content: it listens to events from the Home Assistant VM, runs user-defined trigger scripts, controls devices, and publishes entity state and attributes through HA's REST API. Lovelace consumes these attributes, so a feature displayed in Home Assistant can be implemented in Maestro. For generated card content, trace the displayed entity attributes to their producer before selecting a repository. Dashboard layout and styling live in the `home-assistant` repo, while card content comes from Maestro. Meeshbot and Maestro are independent services that do not communicate directly. Rhythm is fully standalone in the Apple ecosystem and touches no homelab infrastructure.

---

## Deployment Cheat Sheet

| Service | Where | How |
|---|---|---|
| OpenCode | Mac mini | Remote SSH CLI or Access-protected web client |
| Maestro | Mac mini | `cd ~/Repositories/maestro && just pull-deploy`; SSH only from another host |
| Meeshbot | Mac mini | `cd ~/Repositories/meeshbot && just pull-deploy`; SSH only from another host |
| Home Assistant config | QEMU VM on Mac mini | SSH as `homeassistant` → edit `/config` (sudo where ownership requires it) → reload HA → commit and push from the VM. VS Code Remote SSH for browsing/editing with appropriate permissions. |
| Cloudflare Workers | Cloudflare edge | `wrangler deploy` from repo root |
| Rhythm | App Store | Development Mac with Xcode/signing: Archive → App Store Connect (TestFlight → release) |
