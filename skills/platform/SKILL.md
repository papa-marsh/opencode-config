---
name: platform
description: Atlas of platform context - system architecture, services, repositories, design principles, and how the pieces fit together
---

# Platform

High-level map of the homelab and development environment. Load this skill when you need to orient to what exists, where it lives, how things connect, or how to deploy something. Inner workings of each repo belong in that repo's AGENTS.md; this skill covers the cross-cutting view.

---

## Infrastructure

### Mac Mini (local home server)

Hosts the long-running Docker services (Maestro, Meeshbot) and the Home Assistant migration VM. SSH is available via Cloudflare Tunnel:

```bash
ssh ssh.<owned_domain>.com   # user: marshall
```

The SSH config uses `cloudflared access ssh` as a ProxyCommand. `cloudflared` must be installed and authenticated locally. `<owned_domain>.com` is the primary domain, managed through Cloudflare.

To deploy services: SSH in, navigate to the repo, run `just pull-deploy`.

### Home Assistant VM (migration target)

Runs a fresh Home Assistant OS instance under QEMU on the Apple Silicon Mac mini. QEMU uses hardware virtualization and bridges the VM directly to the physical Ethernet interface, so the VM behaves as a standalone LAN device and receives multicast traffic used for device discovery.

- **Address:** `http://192.168.0.145:8123`
- **VM state:** `~/Services/home-assistant/` on the Mac mini
- **Service:** system LaunchDaemon `com.marshallwarners.home-assistant`
- **Live config:** `/config` inside HAOS, versioned at `github.com/papa-marsh/home-assistant`
- **Shell access:** `hass-ssh` alias connects to the Terminal & SSH add-on and opens `/config`
- **File access:** mount `smb://192.168.0.145/config` from Finder

The VM is not production. The Raspberry Pi remains the live Home Assistant instance while integrations, configuration, and automations move incrementally to the VM. Do not treat VM state as authoritative until cutover.

### Raspberry Pi (live Home Assistant)

Runs Home Assistant OS at `http://192.168.0.107:8123` on the local network. For file editing, mount the Pi through Samba, open the `config/` folder in VS Code, and use VS Code's Git integration to pull and push. There is no SSH workflow for the Pi.

### Cloudflare

Used for cloud-hosted services and domain infrastructure:
- **`<owned_domain>.com`**: Primary domain used for CF Worker routing and the SSH tunnel hostname to the Mac mini
- **Workers**: Serverless edge functions deployed with `wrangler deploy`
- **D1 / R2**: SQLite-at-edge and object storage, with no active consumers
- **Cloudflare Tunnel**: Exposes the Mac mini SSH over the public internet under `ssh.<owned_domain>.com`

---

## Repositories

Application repositories live in `~/Repositories` unless a section names another location. The migration VM's Home Assistant repository lives inside HAOS at `/config`.

### hass-maestro (library)

**What:** Strongly-typed Python automation framework for Home Assistant, packaged as an installable library (import name `maestro`). Connects to HA via WebSocket and REST. Python 3.14+, Flask, SQLAlchemy, Redis, APScheduler, structlog, uv. All initialization is constructor-driven (`MaestroApp`); no import-time side effects. Public repo: `github.com/papa-marsh/hass-maestro`. Published to PyPI as `hass-maestro`; releases are cut by pushing a `v*` git tag, which triggers a GitHub Actions workflow that publishes via PyPI trusted publishing (OIDC, no tokens). CI (ruff, mypy, pytest) runs on GitHub Actions.

**Repo:** `~/Repositories/hass-maestro`

**Details:** `hass-maestro/AGENTS.md`

---

### maestro (application)

**What:** Personal Home Assistant automations built on hass-maestro; the deployed service. `app.py` constructs the `MaestroApp` from env vars; gunicorn serves `app:app` in Docker on the mac mini (compose stack: maestro + redis + postgres). The library dependency resolves from PyPI, pinned in `uv.lock`. Generated `registry/` modules and `scripts/config/` secrets are gitignored (present on the mini and the local Mac, not in git).

**Repo:** `~/Repositories/maestro` (public: `github.com/papa-marsh/maestro`)

**Deploy:** SSH into mac mini → `cd ~/Repositories/maestro && just pull-deploy`. To pick up new library releases, use the `/upgrade-maestro` command (bumps and tags a hass-maestro release, re-locks the dependency, and deploys).

**Details:** `maestro/AGENTS.md`

---

### home-assistant

**What:** The new Home Assistant VM's live `/config` directory as a Git repository. It starts from a fresh HAOS installation and receives configuration incrementally during migration from the Pi.

**Repo:** Live at `/config` inside the HAOS VM; public remote `github.com/papa-marsh/home-assistant`

**Access:** Run `hass-ssh` for a shell rooted at `/config`, or mount `smb://192.168.0.145/config` and open it in VS Code.

**Runtime status:** Migration target only. Changes do not affect the production Pi unless applied there separately.

---

### home-assistant-2.0

**What:** The Home Assistant `config/` directory as a Git repository. It contains `configuration.yaml`, automations, scenes, Lovelace UI configs, themes, and related configuration. Ruff and mypy are configured (`ruff.toml`, `mypy.ini`), applying to any Python in the config.

**Repo:** `~/Repositories/home-assistant-2.0` (local clone for editing)

**Deploy:** Mount the Pi via Samba → open `config/` in VS Code → git pull via VS Code UI. Changes take effect when HA reloads or restarts.

**Note:** The Pi's HA instance is the source of truth at runtime. The git repo is the version-controlled source; syncing them requires the Samba workflow above.

---

### meeshbot

**What:** GroupMe bot that receives webhook events, persists messages, dispatches slash commands, and generates LLM-driven chat replies via Anthropic Claude. Runs in Docker on the mac mini. Python 3.14+, FastAPI, uvicorn, Oxyde ORM, APScheduler, structlog, uv.

**Repo:** `~/Repositories/meeshbot`

**Deploy:** SSH into mac mini → `just pull-deploy`

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

**Deploy:** Xcode → Archive → distribute through App Store Connect (TestFlight, then release). Local dev: build/test against an iOS simulator via `xcodebuild` (commands in the repo's AGENTS.md). CloudKit schema changes must be additive. Deploy the CloudKit schema to production through the CloudKit Console before shipping a build that uses it.

**Details:** `rhythm/AGENTS.md`

---

### oxyde

**What:** A fork of the [Oxyde ORM](https://github.com/mr-fatalyst/oxyde), a Django-style async ORM with a Rust core and Python bindings used by meeshbot. The upstream maintainer is responsive to PRs; simple fixes can be made and pushed through this fork.

**Repo:** `~/Repositories/oxyde`

---

## How Services Fit Together

```
Home Assistant (Pi, production, 192.168.0.107:8123)
    │
    │  WebSocket + REST API
    ▼
Maestro (mac mini, Docker)
    └─ maestro app, built on the hass-maestro library

Home Assistant (QEMU VM, migration target, 192.168.0.145:8123)
    └─ fresh HAOS instance with its own bridged LAN identity

GroupMe ──webhook──▶ Meeshbot (mac mini, Docker)

Cloudflare Workers (edge)
  └─ http-receiver (debug utility)
  └─ <owned_domain>.com (domain + SSH tunnel to mac mini)

iPhone ──iCloud──▶ Rhythm (App Store app; CloudKit private DB is its only backend)
```

Maestro is the automation brain: it listens to events from the production Pi, runs user-defined trigger scripts, and calls back into the Pi to control devices. The QEMU VM remains independent during migration. Meeshbot and Maestro are independent services that do not communicate directly. Rhythm is fully standalone in the Apple ecosystem and touches no homelab infrastructure.

---

## Deployment Cheat Sheet

| Service | Where | How |
|---|---|---|
| Maestro | Mac mini | `ssh ssh.<owned_domain>.com` → `cd ~/Repositories/maestro && just pull-deploy` |
| Meeshbot | Mac mini | `ssh ssh.<owned_domain>.com` → `cd ~/Repositories/meeshbot && just pull-deploy` |
| Home Assistant config (production) | Pi | Finder Samba mount → VS Code git pull |
| Home Assistant config (migration target) | QEMU VM on Mac mini | `hass-ssh` or Finder Samba mount → edit `/config` and use Git |
| Cloudflare Workers | Cloudflare edge | `wrangler deploy` from repo root |
| Rhythm | App Store | Xcode Archive → App Store Connect (TestFlight → release) |
