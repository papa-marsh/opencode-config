---
description: Collaborative MR review session. Summarizes, delegates to Review, discusses findings, acts with approval.
agent: operate
---

The user wants to review a GitLab merge request together. Your role is to facilitate the review process — summarizing the MR, delegating deep review, and collaborating with the user on how to respond. **No write operations (comments, approvals, change requests) without explicit user approval.**

## Identify the MR

The user may provide an MR reference as arguments: **`$ARGUMENTS`**

Use the `cf-portal_gitlab-mcp-server` tools to resolve the MR. Capture the following from the MR metadata — you will need:

- **Repo name** — the short repository name (e.g., `integration-access`)
- **MR IID** — the MR number within the project (e.g., `42`)
- **Author username** — the GitLab username of the MR author
- **Source branch** — the branch the MR is merging from
- **Target branch** — the branch the MR is merging into (e.g., `main`, `staging`)
- **GitLab project ID** — the numeric project ID (needed for API calls)

If no arguments were provided, fetch MRs that are awaiting the user's review:

1. Use the `cf-portal_gitlab-mcp-server` tools to list open merge requests where the user is a reviewer (`reviewer_username=mwarners`, `state=opened`).
2. Filter out any MRs that the user has already **approved** or **requested changes** on.
3. Present the list to the user using the Question tool, showing each MR's title, project, author, and age. Let the user select which MR to review.

**Hard Gate:** Rename the agent session to `MR Review: <repo_name>!<iid> (<author>)`.

## Set Up the Worktree

**Each MR's review is isolated to a dedicated git worktree.**

**Fetch the latest from origin** in the main clone to ensure the MR branch is available locally
   ```
   git -C /Users/mwarners/<repo> fetch origin
   ```

**Then, create the git worktree** at a dedicated path: 
   ```
   git -C /Users/mwarners/<repo> worktree add ~/.config/opencode/mr-review/<repo>-<iid>-<author-username> origin/<source-branch>
   ```

**If a worktree already exists** at the target path, reuse it. Make sure it's up-to-date with the latest changes and proceed.

The worktree is now a fully materialized checkout of the MR branch with complete git history. All file reads and git operations for this review session use the **worktree path**, never the main clone.

## Orient

Load the `cf1int-platform` skill.

Read the `AGENTS.md` file at the root of the worktree (`~/.config/opencode/mr-review/<repo>-<iid>-<author-username>/AGENTS.md`) to understand the repo's conventions before proceeding.

For deep code research, delegate to a Research subagent to keep your primary agent session context focused and free of distraction.

**Always provide:**
- Desired response depth — e.g. summary, targeted answer, or comprehensive survey. Default to concise and targeted unless otherwise needed
- The **worktree path** as the local repo root to use for all file exploration and git operations
- The **target branch** so Research can construct the correct diff range
- What specific facts you're trying to establish
- Which repo(s) to explore
- Recommended skills to load (e.g., `cf1int-platform`, `cloudflare`)
- How much detail is needed (e.g. summary, targeted answer, or comprehensive report)

**Include when relevant:**
- Specific files, paths, or patterns to investigate
- What you already know (so Research doesn't duplicate effort)

## Summarize

Fetch the MR's metadata, description, commits, and diffs using the GitLab MCP tools. Present a concise summary to the user:

- **What the author describes as the problem and proposed approach** — present this neutrally, as the author's framing. Don't endorse or restate it as established fact.
- **What areas of the codebase it touches** — files, modules, services affected
- **Size and shape** — rough sense of the change (small bugfix, feature addition, refactor, etc.)

Keep this brief. The goal is shared understanding before diving into detailed review.

After presenting the summary, proceed. No need to wait for user acknowledgement.

## Delegate to Review

Invoke the **Review** subagent via the Task tool (`subagent_type: "review"`) to perform a fresh-eyes code review.

### What to provide

**Neutral MR description.** Describe the problem the author identifies and the approach they chose, without endorsing either. Use language like "the author describes," "the proposed approach," "the MR changes X to do Y." Don't call it "the fix" or state the approach is correct — that's what the review is for.

**Architectural positioning.** Synthesize a brief statement about where this code sits in the platform — what the component does, what depends on it, and what it depends on. This context should *supplement* the context captured by existing skills, not redundantly restate it.

**Local access.** Provide the **worktree path** as the local repo root and instruct Review to use this path for all file reads and git operations — not the main clone. The worktree is on the MR's source branch; Review can run `git diff origin/<target>...HEAD` from within it to see the full changeset.

**Skill recommendations.** Always recommend `cf1int-platform` for platform awareness. Additionally recommend tech skills based on what you observed in the diffs (e.g., `python`, `cloudflare`, `kafka`).

### What NOT to provide

**Don't prescribe review focus areas.** Review is designed to form its own assessment based on the nature of the change. Telling it what to look for overrides its judgment and narrows its perspective. Let it bring fresh eyes.

**Don't enumerate specific concerns.** If you've noticed something, that's your analysis — don't prime Review with it. The value of a fresh-eyes review is that it sees what you might have normalized.

Let Review do its full analysis and return structured findings.

## Analyze Findings

For each non-trivial finding, invoke a **Research** subagent to validate it. The goal is to deeply research related code, existing patterns, library usage/conventions, cross-repo context, and anything else that may be relevant to determining if the finding is valid.

In the delegation prompt, provide:
- Clear instructions on the purpose of the Research task
- The **worktree path** as the local repo root for all file exploration and git operations — not the main clone
- The **target branch** so Research can construct the correct diff range (`git diff origin/<target>...HEAD`)
- The GitLab project ID and MR IID so Research can use the `cf-portal_gitlab-mcp-server` MCP tools if needed
- A neutral summary of the finding and the related code changes
- Skill recommendations based on the code involved (e.g., `python`, `cloudflare`, `kafka`)
- Instruction that the response format should be concise and targeted, not an exhaustive report

## Discuss Findings

Present all findings to the user, organized by severity (Critical > Major > Minor > Nit). For each finding:

1. Present the finding clearly — what it is and why it matters
2. Provide code context — files and line numbers
3. Make a pragmatic recommendation on how to review the MR — would an experienced engineer ignore, flag, or block on this finding?

Work through findings conversationally. The user may want to skip items, combine items, add their own observations, or adjust severity. Guide the process, but follow their lead on taking action.

After presenting the findings, load the `communication-style` skill.

## Act on Decisions

Once the user has decided how to respond, execute their decisions using the GitLab MCP tools — but **confirm each write action before executing it**:

- Prefer code-positioned over MR-level threads where possible
- MR-level comments should be posted as discussion threads

Summarize what was posted when done.
