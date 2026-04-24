---
name: authoring-commands
description: Process for writing effective OpenCode command files — design principles, facilitation, validation
---

# Command Authoring

How to design and write effective OpenCode commands. Load this skill when facilitating command creation with the user.

Also load the `documentation` skill — it provides complementary writing principles for documentation work.

---

## What Commands Are

Commands are **session initializers with intent**. They lay the groundwork for a session's structure �� what the agent knows, how it behaves, and what kind of collaboration to have with the user.

A command is not just a prompt. It encodes:

- **Context setup** — what skills to load, what state to check, what mental model the agent needs before acting
- **Agent role** — how the agent should position itself (facilitator, executor, reviewer, etc.)
- **Collaboration model** — whether the session is guided and interactive or autonomous and reporting-back
- **Conditional logic** — how to adapt based on what already exists (files, state, prior work)

**Commands in the framework sit alongside skills and agent definitions.** Each serves a distinct purpose:
- **Agent definitions** shape *who the agent is* — persistent identity, capabilities, invocation rules
- **Skills** provide *knowledge and principles* — loaded on demand to inform thinking
- **Commands** trigger *specific processes* — a repeatable entry point into a well-structured session

---

## Design Principles

A command shapes the decision-making environment for a session — it is not a script the agent follows. 

A command that says "step 1: load skill X, step 2: read file Y, step 3: ask the user Z" produces rigid, mechanical sessions that break when conditions vary. A command that establishes the right mental model ("load X for context, check what already exists, collaborate with the user on direction") lets the agent adapt to the actual situation while staying aligned with the intent. 

Design for the frame, not the steps.

### Front-load context

Load skills and establish the agent's mental model before doing any work. A command that jumps straight into action without setting up the right context produces worse results.

```markdown
Load the `workflow-architecture` skill for full framework context.
```

This isn't ceremony — it's the difference between an agent that understands the broader system and one that operates in a vacuum.

### Position the agent's role explicitly

Don't assume the agent knows how to approach the work. State the collaboration model directly.

```markdown
Your role is facilitator and co-author, not interviewer.
```

```markdown
Present recommendations as a starting point for collaboration with the user.
```

Without explicit role positioning, agents default to generic helpful-assistant behavior. Commands should shape *how* the agent engages.

### Branch on state

Good commands adapt to what exists rather than blindly executing the same flow. Check for prior work, existing files, or current state and adjust accordingly.

This makes commands resilient and reusable across different starting conditions.

### Collaborative by default

Commands in this framework set up working sessions with the user — not autonomous runs. The user is the Navigator; the command should structure the collaboration, not replace it.

This means:
- Presenting plans before executing
- Checking in at decision points
- Leaving room for the user to shape direction

A command that runs to completion without user input is appropriate only for truly mechanical tasks.

---

## Anti-Patterns

- **The raw prompt.** A command that's just a sentence or two with no context setup, no role positioning, no structure. These produce inconsistent results because the agent has no framework for the work.
- **The autonomous runner.** A command that executes a multi-step process without checkpoints. The user loses visibility and control. Reserve autonomous execution for simple, mechanical operations.
- **The kitchen sink.** A command that tries to handle multiple workflows or too many conditional branches. If the command needs extensive branching, consider whether it should be two commands.
- **The duplicator.** A command that restates knowledge that belongs in a skill or agent definition. Commands orchestrate — they reference skills for knowledge and agent definitions for identity. They shouldn't duplicate either.
- **The rigid script.** A command that prescribes every step without room for the agent to adapt to the user's actual needs. Good commands provide structure and principles; they don't micromanage every interaction.

---

## The Authoring Process

When helping a user create a new command, facilitate — don't interrogate. The goal is to extract the *shape of the session* the command should create.

### Understand the intent

Start by understanding what process the command triggers:

- **What does a successful session look like?** What has the user accomplished by the end?
- **What setup does the agent need?** Skills, file checks, state awareness?
- **How interactive is the process?** Fully collaborative, mostly autonomous with checkpoints, or fire-and-forget?

These questions aren't a checklist — let the conversation flow naturally. The answers shape every design decision downstream.

### Identify the session structure

Work out the command's skeleton:

- **Context setup** — what skills need loading, what state needs checking
- **Conditional branches** — does the command need to adapt based on what exists?
- **Collaboration points** — where does the user need to provide input or make decisions?
- **Completion criteria** — how does the session end? What artifacts or outcomes mark success?

Push back if the user describes a process that's too broad ("it should handle all project setup") or too narrow ("it should run this exact sequence of commands"). Good commands are specific enough to be useful but flexible enough to accommodate variation.

### Draft and validate

Write the command file and review it with the user. Validate against:

- **Cold-start test:** Could an agent execute this command correctly on first use without additional context?
- **Reuse test:** Would this command produce good results across different starting conditions, or is it brittle to one specific scenario?
- **Scope test:** Does the command stay focused on one intent, or does it sprawl?
- **Role test:** Is the agent's role and collaboration model clear from the command text?

### Post-creation updates

After the command is finalized, update framework references:

- Hub AGENTS.md (`~/.opencode/AGENTS.md`) — commands table, if one exists
- Workflow-architecture skill — command inventory
- Any other context docs that reference available commands

---

## Platform Reference

OpenCode commands are markdown files in `~/.opencode/commands/` (global) or `.opencode/commands/` (per-project). The filename becomes the command name.

### Frontmatter options

| Field | Required | Purpose |
|-------|----------|---------|
| `description` | Recommended | Shown in the TUI when browsing commands |
| `agent` | No | Which agent executes the command (defaults to current) |
| `subtask` | No | Force subagent invocation (`true`/`false`) |
| `model` | No | Override the default model for this command |

### Prompt features

| Syntax | Purpose | Example |
|--------|---------|---------|
| `$ARGUMENTS` | All arguments passed after the command name | `/cmd foo bar` → `$ARGUMENTS` = `foo bar` |
| `$1`, `$2`, `$3`... | Positional arguments | `/cmd foo bar` → `$1` = `foo`, `$2` = `bar` |
| `` !`command` `` | Inject shell command output into the prompt | `` !`git log --oneline -5` `` |
| `@path/to/file` | Include file contents in the prompt | `@src/index.ts` |
