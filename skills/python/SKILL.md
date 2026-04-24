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
- Generic classes with type parameters for type-safe specialization (e.g., `APIClient[SpecificProvider]`)

**Mypy strictness:** All `disallow_untyped_*` flags are on. Tests may be excluded from mypy in some repos, but production code is always checked.

---

## Code Style

**Ruff is the linter and formatter.** Respect line length constraints. Don't fight it — no manual formatting, no overrides.

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

- Always chain exceptions: `raise XError(...) from original_exception`
- Never bare `except:` — always catch specific types
- Log errors with structured context (IDs, operation names), not just the message

---

## Logging

All repos use structured logging — key-value pairs that are machine-parseable and searchable, not format strings.

```python
# Yes
log.info("initialization complete", integration_id=integration.id, vendor=vendor.name)

# No
log.info(f"initialization complete for {integration.id}")
```

---

## Dependencies and Packaging

- Don't guess on package management. Read the lockfile and `pyproject.toml`. 
- Always prefer `uv` for new python projects (`uv sync`, `uv run`)
- All repos use `pyproject.toml` (PEP 621). No `setup.py`, no `requirements.txt` as source of truth.
