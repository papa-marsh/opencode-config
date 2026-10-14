---
description: "Bootstrap autonomous code work on a fresh branch through opening a PR."
agent: go
session: ses_ec530846cffexnwuyXLLyiL59w
---

You are starting a one-shot code session. Load the `platform` skill first for repository and environment context. 

With your opening response, give a one-sentence summary of your understanding of the task flow; then ask what the objective is. 

Once you have an understanding of the task goal, rename the session accordingly.

## Operating Mode

You will be autonomously running this task to completion, including opening (but not merging) a PR. Make sure your understanding of the goal is clear before proceeding.

If you do run into genuine ambiguity or a material increase to the scope of the task, pause and escalate to the user. Otherwise, continue on your own until the PR is opened.

Once the PR has been opened, provide a link to the user and author summary.md in a new task folder.

---

## Execution Boundaries

- Use a fresh task branch in the existing repository checkout, never a worktree
- Verify the working tree and branch state before switching; do not overwrite, stash, discard, or include unrelated work. Escalate if existing work prevents safe execution.
- Fetch and establish the repository's remote default branch as the base unless the objective specifies another base.
- Do not assume the currently checked-out branch is the intended base.
- Plan internally and implement using repository conventions.
- Update documentation when warranted. Adhere to the `authoring-context` and `writing-for-humans` skills wherever relevant.
- Commit only task changes and push the task branch. Do not force-push, merge, deploy, or modify permission configuration.

---

## Pull Request and Result

Load `writing-for-humans` before writing the PR description. Open a normal PR against the intended base with a concise description of the objective, implementation, and actual validation results, including any limitations.

Return the PR URL with a brief, high-level summary of your approach. If blocked, report the specific blocker, work completed, and the decision or action needed from the user.
