---
name: platform
description: Atlas of platform context - system architecture, services, repositories, design principles, and how the pieces fit together
---

# Platform

High-level map of the homelab and development environment. Load this skill when you need to orient to what exists, where it lives, how things connect, or how to deploy something. Inner workings of each repo belong in that repo's AGENTS.md — this skill covers the cross-cutting view.

---

## Infrastructure

### Mac Mini (local home server)

Hosts the long-running Docker services (Maestro, Meeshbot). SSH is available via Cloudflare Tunnel:

```bash
ssh ssh.<owned_domain>.com   # user: marshall
```

The SSH config uses `cloudflared access ssh` as a ProxyCommand — `cloudflared` must be installed and authenticated locally. `<owned_domain>.com` is the primary domain, managed through Cloudflare.

To deploy services: SSH in, navigate to the repo, run `just pull-deploy`.

### Raspberry Pi (Home Assistant)

Runs Home Assistant OS at `http://192.168.0.107:8123` on the local network. Accessed for file editing via Samba — mount the Pi in Finder, open the `config/` folder in VSCode, and use VS Code's git integration to pull/push. There is no SSH workflow for the Pi.

### Cloudflare

Used for cloud-hosted services and domain infrastructure:
- **`<owned_domain>.com`** — primary domain; used for CF Worker routing and the SSH tunnel hostname to the mac mini
- **Workers** — serverless edge functions deployed with `wrangler deploy`
- **D1 / R2** — SQLite-at-edge and object storage; available and used historically, not currently active in any running project
- **Cloudflare Tunnel** — exposes the mac mini SSH over the public internet under `ssh.<owned_domain>.com`

---

## Repositories

All repos live in `~/Repositories`.

### maestro

**What:** Strongly-typed Python automation framework for Home Assistant. Connects to HA via WebSocket and REST. Runs in Docker on the mac mini. Python 3.14+, Flask, SQLAlchemy, Redis, APScheduler, structlog, uv.

**Repo:** `~/Repositories/maestro`

**Scripts subrepo:** `~/Repositories/maestro/scripts` — a separate nested git repo (gitignored by maestro) containing personal automation scripts. Loaded at runtime by the framework.

**Deploy:** SSH into mac mini → `just pull-deploy` (pulls both `maestro` and `maestro/scripts`, then rebuilds Docker)

**Details:** `maestro/AGENTS.md` and `maestro/scripts/AGENTS.md`

---

### home-assistant-2.0

**What:** The Home Assistant `config/` directory as a git repo. YAML-based — `configuration.yaml`, automations, scenes, Lovelace UI configs, themes, etc. Ruff and mypy are configured (`ruff.toml`, `mypy.ini`), applying to any Python in the config.

**Repo:** `~/Repositories/home-assistant-2.0` (local clone for editing)

**Deploy:** Mount the Pi via Samba → open `config/` in VSCode → git pull via VS Code UI. Changes take effect when HA reloads or restarts.

**Note:** The Pi's HA instance is the source of truth at runtime. The git repo is the version-controlled source; syncing them requires the Samba workflow above.

---

### meeshbot

**What:** GroupMe bot that receives webhook events, persists messages, and dispatches slash commands. Runs in Docker on the mac mini. Python 3.14+, FastAPI, uvicorn, Oxyde ORM, APScheduler, structlog, uv. Has an `anthropic` dependency for LLM features.

**Repo:** `~/Repositories/meeshbot`

**Deploy:** SSH into mac mini → `just pull-deploy`

**Details:** `meeshbot/AGENTS.md`

---

### rhythm

**What:** iOS cadence-based reminders app. Published to the App Store. Uses SwiftUI + SwiftData + CloudKit for local storage and multi-device sync via iCloud.

**Repo:** `~/Repositories/rhythm`

**Deploy:** Built and submitted via Xcode / App Store Connect. No server-side component — data lives in the user's private iCloud container.

**Note:** Fully vibe-coded. The README.md contains comprehensive technical documentation.

---

### http-receiver

**What:** Cloudflare Worker that logs authenticated HTTP requests. A debug/utility tool for inspecting webhook payloads — not a production integration. TypeScript, Cloudflare Workers runtime.

**Repo:** `~/Repositories/http-receiver`

**Deploy:** `wrangler deploy` from the repo root

---

### oxyde

**What:** A fork of the [Oxyde ORM](https://github.com/mr-fatalyst/oxyde) — a Django-style async ORM with a Rust core and Python bindings, used by meeshbot. The upstream maintainer is responsive to PRs; simple fixes can be made and pushed through this fork.

**Repo:** `~/Repositories/oxyde`

---

## How Services Fit Together

```
Home Assistant (Pi, 192.168.0.107:8123)
    │
    │  WebSocket + REST API
    ▼
Maestro (mac mini, Docker)
    └─ maestro/scripts (personal automations)

GroupMe ──webhook──▶ Meeshbot (mac mini, Docker)

Rhythm (iOS / iCloud) — standalone

Cloudflare Workers (edge)
  └─ http-receiver (debug utility)
  └─ <owned_domain>.com (domain + SSH tunnel to mac mini)
```

Maestro is the automation brain: it listens to HA events, runs user-defined trigger scripts, and calls back into HA to control devices. Meeshbot and Maestro are independent services — they don't communicate directly. Rhythm is entirely standalone — data lives in the user's private iCloud container with no server-side component.

---

## Deployment Cheat Sheet

| Service | Where | How |
|---|---|---|
| Maestro | Mac mini | `ssh ssh.<owned_domain>.com` → `cd ~/Repositories/maestro && just pull-deploy` |
| Meeshbot | Mac mini | `ssh ssh.<owned_domain>.com` → `cd ~/Repositories/meeshbot && just pull-deploy` |
| Home Assistant config | Pi | Finder Samba mount → VSCode git pull |
| Cloudflare Workers | Cloudflare edge | `wrangler deploy` from repo root |
| Rhythm | App Store | Xcode → Archive → App Store Connect |
