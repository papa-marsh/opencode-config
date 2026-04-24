---
name: python
description: Team Python conventions — typing, async, data modeling, code style. Complements repo-specific AGENTS.md.
---

# Python Conventions

How this team writes Python. Load this when working in any Python repo. Repo-specific patterns (project structure, test framework, package manager, architectural layers) live in each repo's AGENTS.md — read those too.

---

## Typing Discipline

Type hints are not optional. Mypy runs in strict mode across all repos.

**Hard rules:**
- Type hints on every function signature — arguments and return types, including `-> None`
- `str | None` over `Optional[str]` — modern union syntax everywhere
- `collections.abc` imports over `typing` equivalents: `Sequence`, `Callable`, `Mapping`, `AsyncIterator`, not `typing.Sequence`, etc.
- `StrEnum` for string-valued enums (not plain strings, not `Enum` with string values)
- `TypedDict` with `NotRequired` for structured dictionaries — not `dict[str, Any]`
- `TYPE_CHECKING` guard for import-only types to avoid circular imports

**Patterns you'll see and should follow:**
- Type aliases for complex signatures: `RetryableApiExceptionStrategyT = tuple[str, str, int, list[float]]`
- `@typing.override` on method overrides
- `Any` used pragmatically for vendor API responses — don't fight it, but don't spread it
- Generic classes with type parameters for type-safe specialization (e.g., `Crawler[AnthropicProvider]`)

**Mypy strictness:** All `disallow_untyped_*` flags are on. Tests may be excluded from mypy in some repos, but production code is always checked.

---

## Data Modeling

**Pydantic is the data modeling tool.** Use it for validated structured data — API payloads, configuration, workflow parameters, normalized domain objects.

- `dataclass` is for simple internal structs without validation (error types, runner configs, registry entries). Use `frozen=True` and `KW_ONLY` where appropriate.
- Plain `dict` is almost never the right choice for structured data. Reach for `TypedDict` (for unvalidated dict shapes) or Pydantic (for validated data) instead.

**Check which Pydantic version the repo uses before writing code.** Some repos use Pydantic v2 natively, others use the v1 compatibility layer. The repo's existing imports tell you which — match them, don't mix.

---

## Async Patterns

The team writes async-first Python for I/O-bound work. Sync code is fine for CLI scripts, management commands, and Django views that haven't migrated.

**Conventions:**
- `asyncio.Lock` for shared mutable state in async contexts
- `asynccontextmanager` for resource lifecycle management — acquire in `yield`, clean up after
- `async with` and `AsyncExitStack` for composing multiple async lifecycles
- `sync_to_async` wrappers when calling blocking code (Django ORM) from async contexts
- `run_in_executor` for CPU-bound or blocking library calls inside async code

**Avoid:**
- Fire-and-forget tasks without error handling
- Blocking calls in async functions without `run_in_executor`

---

## Code Style

**Ruff is the linter and formatter.** Line length is 120. Don't fight it — no manual formatting, no overrides.

**Key rules enforced across repos:**
- `T20` — no `print()` statements. Use the repo's logging framework.
- `S` (bandit) — security checks are on. No hardcoded secrets, no `shell=True` without justification.
- `UP` (pyupgrade) — use modern Python syntax. f-strings over `.format()`, `|` unions over `Union`, etc.
- `B` (bugbear) — catches common bugs. Mutable default arguments, bare `except`, etc.
- `PTH` — `pathlib.Path` over `os.path`.
- `I` (isort) — import ordering is automated. Don't hand-sort.

**Comments:** Terse. Explain unusual behavior and complex logic. Don't narrate what the code does — it should be self-evident from types and names. No docstring boilerplate on trivial methods.

**Naming:** `PascalCase` for classes. `snake_case` for everything else. `UPPER_SNAKE_CASE` for constants.

---

## Error Handling

Two patterns exist across the team's repos:

1. **Exception hierarchies** — custom exception classes with enum-based reason codes, `raise ... from` for chaining. Used in older codebases.
2. **Errors as values** — service functions return `Result | Error` union types, callers use `match` statements to handle. Used in newer codebases.

Both are valid. **Match what the repo already does.** Don't introduce errors-as-values into a codebase using exception hierarchies, or vice versa.

Regardless of pattern:
- Always chain exceptions: `raise XError(...) from original_exception`
- Never bare `except:` — always catch specific types
- Log errors with structured context (IDs, operation names), not just the message

---

## Logging

All repos use structured logging — key-value pairs, not format strings.

```python
# Yes
log.info("initialization complete", integration_id=integration.id, vendor=vendor.name)

# No
log.info(f"initialization complete for {integration.id}")
```

**The specific logging library varies by repo** (structlog, loguru). Use whatever the repo uses. The principle is universal: structured fields that are machine-parseable and searchable in Elasticsearch/Kibana.

Bind context early (integration ID, organization ID) so downstream log calls carry it automatically.

---

## Dependencies and Packaging

**Check the repo's tooling before running commands.** The team uses different package managers across repos. Look for:
- `pdm.lock` → PDM (`pdm install`, `pdm run`)
- `uv.lock` → uv (`uv sync`, `uv run`)

Don't guess. Read the lockfile and `pyproject.toml`.

All repos use `pyproject.toml` (PEP 621). No `setup.py`, no `requirements.txt` as source of truth.

---

## Testing Conventions

**The test framework varies by repo** — some use pytest, others Django's unittest. Read the repo AGENTS.md and match existing patterns.

**Universal testing conventions:**
- **polyfactory** for generating test data from Pydantic models — terse factory classes, not hand-built fixture data
- **Mocking at boundaries** — mock external services (HTTP, databases, message queues), not internal functions
- Coverage is tracked. Don't write tests that exercise code paths without asserting meaningful behavior.
- Test files live near the code they test, not in a separate top-level `tests/` tree (though organization varies — check the repo)

---

## Security

- Secrets come from Vault (`hvac` client) or environment variables at runtime. Never hardcoded.
- All external HTTP communication over HTTPS.
- Input validation via Pydantic — don't trust raw dicts from external sources.
- FedRAMP awareness: some repos have `IS_FEDRAMP` flags that gate behavior. Don't remove or bypass these guards.
