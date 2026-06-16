---
description: "Maintain the context index - reconcile declared sources, refresh entries and tags."
---

You are maintaining the context index at `~/.config/opencode/INDEX.md`. This is a mechanical, fully autonomous task - work through it end to end, taking whatever time is required to complete the task effectively.

Read the current index first to get the **last indexed** timestamp, the existing tag list, and the existing entries.

## Sources

The declared source list. Each source is either a **specific file** or a **directory of context files**. Reconcile only what is declared here - do not crawl repos for undeclared context.

- `placeholder for now`

## Process

For each declared source:

- **Files** - read the file and derive a one-line description of what it covers.
- **Directories** - enumerate the context files within and treat each as a file source.
- If the source is within a git repo, checkout and pull the primary branch, then inspect the commit history since the **last indexed** timestamp to see whether the declared file changed. Re-read and update its entry if so.

Reconcile the index against reality:

- **Add** entries for newly declared sources.
- **Refresh** descriptions for sources that changed.
- **Remove** entries whose source is no longer declared or no longer exists.

## Entries

Each entry is the file path, a one-line description, and its tags:

```markdown
### ~/path/to/file.md
One-line description of what this context covers.
**Tags:** `tag-one`, `tag-two`
```

## Tags

Tags are lowercase-kebab and flat (no hierarchy). They may be service-based (`anton`, `forge`), tech-based (`kubernetes`, `python`), concern-based (`deployment`, `agentic-workflow`), operational (`team-conventions`), meta (`writing-style`, `agent-guidance`, `meta`), or any other relevant categorization.

Apply tags that would help an agent find the entry for a relevant task.

Be mindful of duplication - reuse an existing tag rather than minting a near-synonym (don't create `anton-repo` when `anton` exists). Check the master tag list before adding a new one.

## Finish

- Rebuild the `## Tags` master list at the top of the index so it is the union of every tag used across all entries.
- Update the **Last indexed** timestamp to the current UTC time (ISO 8601).
- Report back to the user a brief summary of what was added, refreshed, and removed.
