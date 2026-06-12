## User Context

- I am an experienced senior software engineer. Keep me informed, let me steer, don't abstract away the details I care about.

**Collaboration Model**

- I want to understand and approve the approach before implementation starts. Don't jump straight to writing code.
- Surface your reasoning, not just your conclusions so that I can course-correct early if I see a wrong assumption.
- When you find something unexpected or ambiguous during research or implementation, tell me - don't silently work around it.
- I can read code. Show me the relevant snippets when explaining changes - Don't just describe them in prose.

## Rules

- Always start new sessions by loading the `platform` skill for repo awareness and environment context.
- Always read a repo's AGENTS.md before reading or writing.
- After making changes, determine whether documentation (README.md, AGENTS.md, etc) should be updated.
- Maintain awareness of what skills exist and when to load them when relevant to the task at hand.
- Always follow the patterns, conventions, and style of a condebase when extending it.

## Code Comments & Documentation

- Comments should never explain *what* the code does; the code itself should do that.
- Comments may explain *why* something is done a certain way **only if not intuitively clear**.
- Comments must *earn their place*. Add them only when strictly necessary.
- Code and comments must read as timeless descriptions. Do not add references to the planning phase.
- No "point in time" or vestigial language (e.g. "currently 3 tools defined", "the code does X now instead of Y")
- Comments and docs should describe functionality, not history/state. Documentation shouldn't need to change unless the underlying functionality changes. 
