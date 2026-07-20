---
description: "Deploy a new version of the `hass-maestro` PyPI package; then upgrade the `hass-maestro` dependency in the `maestro` repo and redeploy."
agent: go
---

Release a new version of the `hass-maestro` library to PyPI, then upgrade the `maestro` application to consume it and redeploy.

Load the `platform` skill first for repo and infrastructure context.

This is a mechanical, run-to-completion operation: do not pause for confirmation between steps. Abort and escalate to the user the moment anything fails or looks unexpected (dirty tree, CI failure, version mismatch, deploy errors). Never force-push or amend to recover.

**Version bump:** `$ARGUMENTS` may specify a bump type (`minor`, `major`) or an explicit version (e.g. `0.2.0`). Default: patch bump unless otherwise specified.

## Preflight

In both `~/Repositories/hass-maestro` and `~/Repositories/maestro`: fetch, then verify the tree is clean, on `main`, and not behind origin. Abort otherwise.

## 1. Release hass-maestro

In `~/Repositories/hass-maestro`:

1. Bump the version: `uv version --bump patch` (or `uv version <X.Y.Z>` for an explicit version). This updates `pyproject.toml` and `uv.lock`.
2. Commit both files with message `vX.Y.Z` (the new version, e.g. `v0.1.3`).
3. Create the matching tag and push both: `git push origin main vX.Y.Z`. The tag push is what triggers the Release workflow (CI, build, PyPI trusted publishing); the workflow fails if the tag doesn't match the pyproject version.
4. Watch the Release workflow to completion (`gh run list` / `gh run watch`). If it fails, stop and escalate with the failure details.

## 2. Upgrade maestro

In `~/Repositories/maestro`:

1. Run `uv lock --upgrade-package hass-maestro` and verify `uv.lock` now pins the new version. PyPI indexing can lag the workflow by a little; if the old version persists, wait ~15s and retry a few times before escalating.
2. Commit `uv.lock` with message `Upgrade hass-maestro to vX.Y.Z`.
3. Push.

## 3. Deploy

SSH into the mac mini and deploy:

```bash
ssh ssh.marshallwarners.com "cd ~/Repositories/maestro && just pull-deploy"
```

The recipe tails logs after starting the stack; confirm the container comes up cleanly with no startup errors.

## Report

Summarize the run: old and new version, release workflow result, lock update, and deploy outcome.
