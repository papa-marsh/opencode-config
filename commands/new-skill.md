---
description: Collaborative skill authoring. Extract tacit knowledge, draft and validate a SKILL.md.
---

Load the `authoring-skills` skill for authoring principles and validation criteria. Read `~/.opencode/context/code-workflow-context` and `~/.opencode/context/code-workflow-meta` for CODE workflow framework context — skill types, context architecture, where skills fit.

The user wants to author a skill named: **$ARGUMENTS**

If a name was provided above, check if `~/.opencode/skills/$1/SKILL.md` already exists. If it does, this is a **revision** — read the existing skill, orient on what's there, and ask the user what they want to change. If it doesn't exist, proceed with new skill authoring using `$1` as the skill directory name.

If no name was provided (i.e. `$ARGUMENTS` is empty or literal), ask the user what skill they want to create.

Guide the user through collaboratively authoring a new skill. The user is the primary knowledge source — most valuable skill content is tacit knowledge that lives in their head (how the team uses a technology, why conventions exist, what the gotchas are). Your role is facilitator and co-author, not interviewer.

## Establish Purpose

Work through these questions with the user. Don't treat them as a checklist — have a conversation that naturally surfaces the answers:

1. **What question does this skill answer?** A good skill is organized around a single clear question.
2. **Who loads it and when?** What agent, in what situation, reaches for this skill?
3. **What changes after loading?** What can an agent do after loading this that it couldn't before?

Classify the skill type (Domain, Tech, Task, Meta) — this shapes what content matters and how much upfront research is useful.

## Collaborative Knowledge Extraction

This is the core of the process. Draw out the user's knowledge through genuine conversation:

- **Ask probing questions** — each answer should shape the next question. Push past surface-level descriptions to the specific, contextual knowledge that makes this skill valuable.
- **Reflect back** what you're hearing to confirm understanding and surface implicit assumptions the user may not realize they're making.
- **Challenge completeness** — "What would someone get wrong if they only knew this?" / "What's obvious to you but wouldn't be to someone encountering this fresh?"
- **Filter ruthlessly** — apply the "could an agent figure this out on its own?" test from authoring-skills. If yes, it doesn't belong. The skill should capture what's specific to this context, not restate generally available knowledge.
- **Research on demand** — when the user references a codebase, system, or convention, go look at it to build shared understanding and ask better follow-up questions. For tech/domain skills, exploring relevant repos and systems can ground the conversation. For task/meta skills, lean more on the user's process knowledge.

The conversation should feel like pair-authoring, not Q&A.

## Draft and Validate

Write a draft SKILL.md directly to `~/.opencode/skills/<name>/SKILL.md`. Follow the structural conventions from authoring-skills (YAML frontmatter, H1 title, H2 sections separated by `---`).

Run the draft through validation with the user:

- **Cold-start test:** Could an agent loading this orient and act correctly?
- **Action test:** Does each section enable something new?
- **Staleness test:** Will this survive upcoming changes?
- **Duplication test:** Is anything better served by another context layer?

Refine collaboratively until the user is satisfied.

## Update Framework References

**After the skill is created**, update all relevant framework references:

- Hub AGENTS.md (`~/.opencode/AGENTS.md`) — available skills table
- Workflow-architecture skill (`~/.opencode/skills/workflow-architecture/SKILL.md`) — skill inventory
- Subagent definitions that may need to invoke the skill (`~/.opencode/agents`)
- Any other context docs that reference the skill catalog
