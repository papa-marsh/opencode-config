---
name: documentation
description: Principles for writing and maintaining documentation - AGENTS.md files, READMEs, code comments, etc
---

# Documentation

Principles and judgment framework for writing and updating documentation. Load this skill when creating or updating standalone documentation - AGENTS.md files, READMEs, code comments, etc

---

## Core Principle: Current state, not chnage history

Documentation describes **how the system works now**. Not what changed. Not what changed. Not what it used to be. Avoid vestigial language.

- Documentation is a living artifact that evolves over time to reflect current reality, not an append-only changelog.
- When updating existing docs, **rewrite the relevant sections to reflect current reality**. Don't append "Update: We changed X to Y".
- Do not include references to discarded design decisions. "This feature does X rather than Y" only adds confusion if Y is irrelevant to the current design.
- If a feature was completely reworked, the documentation should describe it as it now exists, not as a changelog relative to the old implementation.
- Historical context belongs in commit messages, PR descriptions, and planning artifacts. Living documentation is a snapshot of the present.
- The reader should never need to understand the history of changes to understand the current system.

---

## Pragmatic Judgement

Not every code change warrants a documentation update. Before writing anything, ask: does this change affect how someone would understand or use this system?

- A bug fixed that corrects an off-by-one error but doesn't change any interface or behavior? Nothing to document.
- A new API point, a new service, changed architectural pattern, a new convention? Probably warrants documentation.

Document what matters. What doesn't. "No updates needed" is a valid and expected outcome.

---

## Writing Principles

- **Write for the reader** who needs to understand or use the system. Not the person who made the change.
- **Be precise and concrete** - file paths, service names, actual patterns, real examples.
- **Match existing tone and style** in the repo's documentation. Don't introduce a different voice.
- **Don't over-document** - verbose documentation gets ignored. Concise and accurate beats comprehensive and unread.

---

## Scope

This skill covers all documentation – AGENTS.md files, READMEs, design docs, code comments, etc.

While code comments and docstrings are part of code changes, they should still follow these principles unless otherwise contradicted by the repo's existing patterns, AGENTS.md, or relevant tech skills. These take precedence.
