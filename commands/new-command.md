---
description: Collaborative command authoring. Design session structure, draft and validate a command file.
---

Load the `authoring-commands` skill for authoring principles and validation criteria. Read `~/.config/opencode/context/code-workflow-context` and `~/.config/opencode/context/code-workflow-meta` for CODE workflow framework context — command inventory, context architecture, where commands fit.

The user wants to author a command named: **$ARGUMENTS**

If a name was provided above, check if `~/.config/opencode/commands/$1.md` already exists. If it does, this is a **revision** — read the existing command, orient on what's there, and ask the user what they want to change. If it doesn't exist, proceed with new command authoring using `$1` as the filename (without `.md`).

If no name was provided (i.e. `$ARGUMENTS` is empty or literal), ask the user what command they want to create.

Guide the user through collaboratively authoring a new command. Your role is facilitator and co-author, not interviewer.

## Establish Intent

Work through these with the user conversationally — don't treat them as a checklist:

1. **What does a successful session look like?** What has the user accomplished when the command's session ends?
2. **What setup does the agent need?** Skills to load, state to check, files to read?
3. **How interactive is the process?** Fully collaborative, mostly autonomous with checkpoints, or fire-and-forget?
4. **What's the agent's role?** Facilitator, executor, reviewer, something else?

These answers shape the command's structure — context setup, collaboration model, conditional logic.

## Design Session Structure

Work out the command's skeleton with the user:

- **Context setup** — what skills need loading, what state needs checking
- **Conditional branches** — should the command adapt based on what already exists?
- **Collaboration points** — where does the user need to weigh in?
- **Completion criteria** — what artifacts or outcomes mark success?

Push back if the scope is too broad (should be two commands) or too narrow (should be a skill or just a prompt).

## Draft and Validate

Write the command file directly to `~/.config/opencode/commands/<name>.md`. Follow platform conventions (YAML frontmatter with description, clear prompt structure).

Run the draft through validation with the user:

- **Cold-start test:** Could an agent execute this command correctly on first use?
- **Reuse test:** Would this produce good results across different starting conditions?
- **Scope test:** Does it stay focused on one intent?
- **Role test:** Is the agent's role and collaboration model clear?

Refine collaboratively until the user is satisfied.
