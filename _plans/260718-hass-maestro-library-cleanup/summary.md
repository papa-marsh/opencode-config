# hass-maestro Library Cleanup (2026-07-18)

Post-migration hardening of the hass-maestro library and the maestro consumer app, executed after the split from the old nested maestro/scripts repo layout. This document records the resulting state and the one outstanding operational step.

## Resulting state

### Public API contract (the governing principle)

Top-level importable = public; everything else is internal and `_`-prefixed. Consumers import only from:

- `maestro` -- `MaestroApp`, `get_app`, `get_config`, `db`, `__version__`
- `maestro.exceptions` -- full exception hierarchy (top-level module, moved out of utils)
- `maestro.domains` -- domain classes, `Entity`, `EntityAttribute`, state constants
- `maestro.integrations` -- `StateManager`, `RedisClient`, `HomeAssistantClient`, `EntityData`, `EntityId`, `Domain`, event dataclasses
- `maestro.triggers` -- trigger decorators, `HassEvent`, `MaestroEvent`, `SolarEvent`
- `maestro.registry` -- `RegistryManager`
- `maestro.utils` -- `Notif`, `JobScheduler`, `log`, date helpers, `IntervalSeconds`
- `maestro.testing` -- `MaestroTest`, `mt` fixture

There is no sanctioned deep-import exception anymore. Custom domain files import parents from `maestro.domains` (the old "deep import to avoid circular imports" rule was verified stale and removed). All domain modules are underscored (`domains/_climate.py` etc.); generated registry files import `EntityAttribute` from `maestro.domains`.

Internal library code imports directly from underscored modules (`from maestro.utils._logging import log`), never from package `__init__` files, to avoid cycles.

### Library packaging

- Wheel excludes `maestro/testing/tests` and `maestro/registry/README.md`
- `py.typed` ships; `__version__` read from package metadata
- PEP 639 license expression (`CC-BY-NC-4.0`), authors, classifiers, keywords, project URLs
- Not published to PyPI: the consumer resolves from GitHub via `[tool.uv.sources]`, commit-pinned in `uv.lock` (`just upgrade-maestro` re-locks)
- pytest plugin entry point is `maestro.testing._fixtures`
- CI: `.github/workflows/ci.yml` runs ruff check, ruff format --check, mypy, pytest
- Both repos route ruff/mypy/pytest caches into `.cache/`

### Known sharp edges

- `__all__` lists use the `ClassName.__name__` convention; string constants must be quoted literally or their *values* silently land in `__all__` (this bug was fixed once in `domains/__init__.py`)
- Registry generation is line-format-sensitive; `attr_import_string` in `registry/_registry_manager.py` and the parser must stay in sync
- The consumer app tracks `branch = "main"`, so any consumer-visible rename in the library must land with a coordinated consumer re-lock + import fix

## Production status

Deployed 2026-07-18. The one-time migration of the mac mini's gitignored `registry/*.py` files (old `maestro.domains.entity` deep import, 53 files) was applied via sed before the Docker build; files regenerate with the correct import from now on. Startup verified clean: DB init, custom domains import, script loading, trigger registration, websocket event processing, zero error-level logs.

## Commit map

- hass-maestro `2b3a0b0..4b1140e` (14 commits): exceptions move, registry export, cache dir, `__all__` fix, test relocation, wheel excludes, `__version__`, metadata, new exports, DJ rule drop, underscore rename (91 files), CI, docs
- maestro `382f5ca..70fb93c` (7 commits): staged cleanup, compose comment, cache dir, DJ rule drop, public-API adoption + re-lock, AGENTS.md update, Dockerfile fix (deploy failed on a COPY of the deleted conftest.py)
