---
description: Bootstrap a code review session by passing a branch, GitHub PR link, or reference. Evaluates the unit of code based on its own merit, the overall approach, and its interactions with the surrounding architectural landscape. Returns review-validated findings, tiered by severity.
---

We're going to review a unit of code locally. Your role is to facilitate a fresh-eyes code review driven from a local worktree. 

If a remote PR exists, it serves as read-only context enrichment, not a dependency. Its description and discussion are valuable orientation, so pull them opportunistically. 

Never post comments, approvals, or change requests. The output of the session is returning findings to the user.

## Identify the Code

The user has passed the following reference to the code under review: **`$ARGUMENTS`**. If no arguments were provided, stop immediately and prompt the user for more information.

Always start by loading the `platform` skill. Local repo clones are located at `~/Repositories/<repo>`. 

## Determine the Comparison Range

The target is the repo's **primary branch**, auto-detected - never assumed. From the main local clone:

1. **Fetch and prune**: `git -C ~/Repositories/<repo> fetch --prune origin`
2. **Detect the primary branch**: `git -C ~/Repositories/<repo> remote show origin | sed -n 's/.*HEAD branch: //p'`

The review compares the source branch against `origin/<primary>` using merge-base (three-dot) semantics: `git diff origin/<primary>...<source-branch>`.

## Pull Request Context

If relevant, check whether the source branch has an open PR and fetch it as **read-only** context: `gh pr view <source-branch> --json title,body,author,comments,reviews`. Run `gh` commands from the clone's working directory to auto-resolve the repo from the local remote.

If a PR is found, the description frames the **author's stated intent** and the comments/reviews surface existing discussion; both can be useful orientation. 

**Treat the author's framing as their claim, not established fact**. The review evaluates the change on its own merits.

**Hard Gate:** Rename the agent session to `Review: <repo>/<branch> (@<author>)`.

## Set Up the Worktree

**Each review is isolated to a dedicated git worktree**, materializing a clean checkout of the source branch: `git -C ~/Repositories/<repo> worktree add ~/.config/opencode/reviews/YYMMDD-<repo>-<pr-id> <source-branch>`. If there is no PR, use the branch name with `/` replaced by `-`. If there is no branch, use a brief hyphen-separated title.

**If a worktree already exists** at the target path, reuse it - ensure it's on the source branch and up to date, then proceed.

All file reads and git operations for this review use the **worktree path**, never the main clone.

## Orient

Load the `platform` skill

Read the repo's `README.md` and `AGENTS.md` (or `CLAUDE.md`) at the root of the worktree to understand the repo's purpose and conventions.

For deep code research, delegate to a Research subagent to keep your primary session context focused.

**Always provide:**
- Desired response depth — Default to concise and targeted.
- The **worktree path** as the local repo root to use for all file exploration and git operations
- The **comparison base** (e.g. `origin/<primary>`) so Research can construct the correct diff range.
- What specific facts you're trying to establish
- Which repo(s) to explore
- Recommended skills to load (e.g., `platform`, `python`)

**Include when relevant:**
- Specific files, paths, or patterns to investigate
- What you already know (to avoid duplicating effort)

## Summarize

Generate a concise summary to the user of what the change is intended to do and how it's attempting to accomplish it. This is a high-level, plain-English overview that doesn't rely on repo knowledge to understand.

**Include:**
- **What the change does**. An observation of the author's intent based on the PR description and inference from the diff itself. Don't overstate certainty about the goal.
- **What areas of the service are affected**. High level components, not modules and code lines.
- **Size and shape**. Rough sense of the scope (e.g. targeted bugfix, new or extended feature, refactor)
- **Existing discussion**. Briefly note PR comments and reviews, if any exist.

Keep this brief. The goal is shared understanding about what the change is and does before a more detailed review. 

After presenting the summary, proceed. No need for user acknowledgement.

## Delegate to Review

Invoke the **Review** subagent via the Task tool (`subagent_type: "review"`) to perform a fresh-eyes code review.

### What to provide

**Neutral change description.** Describe what the change does, derived from the diff, commits, and PR description if one exists, without endorsing it. Use language like "the change does X to do Y" or "the author describes X". Don't call it "the fix" or assert that the approach is correct; that's what the review is for.

**Architectural positioning.** Synthesize a brief statement about where this code sits in the platform — what the component does, what depends on it, and what it depends on. This context should *supplement* the context captured by existing skills, not restate it.

**Local access.** Provide the **worktree path** as the local repo root and instruct Review to use it for all file reads and git operations — not the main clone. The worktree is on the source branch; Review can run `git diff origin/<primary>...HEAD` from within it to see the full changeset.

**Skill recommendations.** Recommend loading any important context that you've identified (in order of importance):
- The `platform` skill (always recommend)
- Relevant tech skills (e.g. `python`, `typescript`)
- Repo-level documentation and `AGENTS.md` files
- Context docs listed in `~/.config/opencode/index`

### What NOT to provide

**Don't prescribe review focus areas.** The Review subagent forms its own assessment based on the nature of the change. Telling it what to look for narrows its perspective.

**Don't enumerate specific concerns.** If you've noticed something, that's your analysis — don't prime Review with it. The value of a fresh-eyes review is that it sees what you might have normalized.

Let Review do its full analysis and return structured findings.

## Analyze Findings

For each non-trivial finding, invoke a **Research** subagent to validate it. The goal is to deeply research related code, existing patterns, library usage/conventions, cross-repo context, and anything else relevant to determining if the finding is valid.

In the delegation prompt, provide:
- Clear instructions on the purpose of the Research task
- The **worktree path** as the local repo root for all file exploration and git operations — not the main clone
- The **comparison base** (e.g. `origin/<primary>`) so Research can construct the correct diff range (`git diff origin/<primary>...HEAD`)
- A neutral summary of the finding and the related code changes
- Skill recommendations based on the code involved (e.g., `python`, `<some-repo-specific-skill>`)
- Instruction that the response format should be concise and targeted, not an exhaustive report

## Return Findings

Present all findings to the user, organized by severity (Critical > Major > Minor > Nit). 

**For each finding, present:**
1. A description in simple, high level terms
2. Brief code context with files and line numbers
3. The scope and impact
4. The effort investment to address it
