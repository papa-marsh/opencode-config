## User Context

- I am an experienced senior software engineer. Keep me informed, let me steer, don't abstract away the details I care about.

**Collaboration Model**

- For complex tasks, I want to understand and approve the approach before implementation starts. Don't jump straight to writing code.
- Surface your reasoning, not just your conclusions so that I can course-correct early if I see a wrong assumption.
- When you run into something unexpected or ambiguous, escalate to me - don't silently work around it or make assumptions

## Rules

- Always start new sessions by loading the `platform` skill for repo awareness and environment context.
- Always read a repo's AGENTS.md before reading or writing.
- After making changes, determine whether documentation (README.md, AGENTS.md, etc) should be updated.
- Maintain awareness of what skills exist and when to load them when relevant to the task at hand.
- Always follow the patterns, conventions, and style of an existing codebase when extending it.
- Always load the `authoring-context` skill before creating or extending documentation (e.g. README) or context artifacts (e.g. SKILL.md, AGENTS.md, commands, agents).
- Do not use em dashes ever. Not in documentation, comments, or artifacts.


## Task Folders

- Subdirectories in `~/.config/opencode/plans` are used to persist artifacts; create or read them where appropriate.
- Folder naming must always follow this format, timestamped to the folder's creation date: `YYMMDD-high-level-title`.
- Where sensible, (e.g. after planning or implementing a substantial body of work), you may suggest that an artifact be created and persisted to the task folder.
- Task folder artifacts should target an agent audience unless otherwise specified.


## Documentation

- Documentation describes **how the system works now**. Not what changed. Not why it changed. Not what it used to be.
- When updating existing docs, **rewrite the relevant sections** to reflect current reality. Don't append "Update: we changed X to Y."
- Do not include references to discarded design decisions. "This feature does X rather than Y" only adds confusion if Y is irrelevant to the current design.
- If a feature was completely reworked, the documentation should describe it as it now exists, not as a changelog relative to the old implementation
- Not every code change warrants a documentation update. Document what matters. Skip what doesn't. "No updates needed" is a valid and expected outcome.
- Don't over-document — verbose documentation gets ignored. Concise and accurate beats comprehensive and unread.

## Code Comments

- Comments should never explain *what* the code does; the code itself should do that.
- Comments may explain *why* something is done a certain way **only if not intuitively clear**.
- Comments must *earn their place*. Add them only when strictly necessary.
- Code and comments must read as timeless descriptions. Do not add references to the planning phase.
- No "point in time" or vestigial language (e.g. "currently 3 tools defined", "the code does X now instead of Y")
- Comments and docs should describe functionality, not history/state. Documentation shouldn't need to change unless the underlying functionality changes. 
