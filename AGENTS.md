**Collaboration**

- The user is a staff software engineer in the tech industry with extensive AI experience. This is his homelab environment.
- In modern software development, agents author code, not humans. Don't assume that the user is (or needs to be) familiar with granular details about the code.
- Lean toward higher level terms in your communication with the user rather than focusing on deeper implementation mechanics or repo-specific jargon.
- When you run into something unexpected or ambiguous, escalate to the user - don't silently work around it or make assumptions.

## Operational Rules

- While and after making changes, make sure to update and relevant documentation (`README.md`, `AGENTS.md`, skills, etc).
- Always follow the patterns, conventions, and style of an existing codebase when extending it.
- If a review raises major concerns that would substantially increase the task scope to address, check in with the user before proceeding.
- Be pragmatic about diminishing returns. Addressing a vanishingly rare edge case is likely not worth the liability of the additional code to fix it.

## Workflow

- Always start new sessions by loading the `platform` skill for repo awareness and environment context.
- Always read a repo's `README` and `AGENTS.md` (or equivalent) before reading or writing.
- Maintain awareness of what skills exist and when to load them when relevant to the task at hand.
- Always load the `authoring-context` skill before creating or extending documentation (e.g. README) or context artifacts (e.g. SKILL.md, AGENTS.md, commands, agents).
- Any plan (including `plan.md`) should be complete enough to make implementation mostly trivial and eliminate any surprised or hidden assumptions that could appear during implementation.

## Task Folders

- Subdirectories in `~/.config/opencode/plans` are used to persist artifacts; create or read them where appropriate.
- Folder naming must always follow this format, timestamped to the folder's creation date: `YYMMDD-high-level-title`.
- Where sensible, (e.g. after planning or implementing a substantial body of work), you may suggest that an artifact be created and persisted to the task folder.
- Task folder artifacts should target an agent audience unless otherwise specified.
- All markdown files generated in the `~/.config/opencode` repo must include `session: <opencode_session_id>` in the frontmatter (`printenv OPENCODE_SESSION_ID`).
- Unless otherwise specified, task folder artifacts should be treated as having an agent audience. Be comprehensive and don't spare details that a future agent may benefit from.

## Documentation

- Documentation should describe **how the system works now**. Not what changed. Not why it changed. Not what it used to be.
- When updating existing docs, **rewrite the relevant sections** to reflect current reality. Don't append "Update: we changed X to Y."
- Do not include references to discarded design decisions. "This feature does X rather than Y" only adds confusion if Y is irrelevant to the current design.
- If a feature was completely reworked, the documentation should describe it as it now exists, not as a changelog relative to the old implementation
- Not every code change warrants a documentation update. Document what matters. Skip what doesn't. "No updates needed" is a valid and expected outcome.
- Don't over-document — verbose documentation gets ignored. Concise and accurate beats comprehensive and unread.
- Pre-existing documentation and artifacts are not law. Treat them as an author's best effort at the time, not scripture.
- Documentation is a *starting point*, not absolute truth. **Always** verify in the actual code.
- Don't use em dashes.
- When authoring markdown, don't manage line width with newlines; let text wrap naturally.

## Code Comments

- Comments should never explain *what* the code does; the code itself should do that.
- Comments may explain *why* something is done a certain way **only if not intuitively clear**.
- Comments must *earn their place*. Add them only when strictly necessary.
- Code and comments must read as timeless descriptions. Do not add references to the planning phase.
- No "point in time" or vestigial language (e.g. "currently 3 tools defined", "the code does X now instead of Y")
- Comments and docs should describe functionality, not history/state. Documentation shouldn't need to change unless the underlying functionality changes. 
