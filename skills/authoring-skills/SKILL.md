---
name: authoring-skills
description: Process for building effective SKILL.md files — from purpose through research, structuring, and validation
---

# Skill Authoring

How to build a good agentic skill definition.

Also load the `documentation` skill — it provides complementary writing principles for documentation work.

---

## File Conventions

- **Location:** `~/.opencode/skills/<name>/SKILL.md`
- **Discovery:** Filesystem-based. A directory containing a SKILL.md is automatically surfaced in the Skill tool's available list.
- **Frontmatter:** YAML with `name` (matches directory name) and `description` (concise, under 120 characters).

---

## The Authoring Process

### 1. Define the Purpose

Before writing anything, answer three questions:

- **What question does this skill answer?** A good skill is organized around a single clear question. "How does this system's data flow work?" or "How do I write tests that match this codebase's patterns?" — not "everything about X."
- **Who loads it and when?** What situation triggers an agent to reach for this skill? That situation defines what the agent needs *right now* — which is the content that matters most.
- **What changes after loading?** An agent that loads this skill should be able to do something they couldn't do before — make correct architectural decisions, follow the right patterns, avoid known pitfalls. If you can't articulate what changes, the skill doesn't have a clear purpose yet.

### 2. Research and Extract

The most common failure in skill authoring is filling pages with knowledge the agent already has. The valuable content is what the agent *can't figure out on its own* — the specific, contextual knowledge that lives in people's heads, in codebase conventions, or in hard-won experience.

**Identify source material:**
- For system/architecture skills: existing documentation, AGENTS.md files, actual code structure, team knowledge
- For process/task skills: existing artifacts that demonstrate the process done well, recurring patterns across successful instances
- For technology skills: the codebase itself — how *this team* uses the technology, not how the technology works in general

**Extract, don't summarize.** The goal is to transfer specific knowledge, not produce a summary of generally available information. Ask: "Could an agent figure this out by reading docs or exploring the codebase?" If yes, it probably doesn't belong in the skill. If no — because it requires experience, cross-cutting context, or judgment that isn't written down anywhere — that's skill content.

**Distinguish specific from generic.** "Use dependency injection" is generic advice. "Services in `src/services/` receive their dependencies via constructor injection; the DI container is configured in `src/container.ts` and tests override bindings in `test/helpers/setup.ts`" is specific knowledge that helps an agent act correctly in this codebase.

### 3. Structure for Agent Consumption

The audience is AI agents. They process the entire skill on load and need to internalize it quickly and act on it correctly.

**The fundamental goal** is to shape *how the agent thinks about the domain* — not to prescribe what it should do.

A skill that says "always use constructor injection" covers that one decision. A skill that explains the repo's DI pattern — how dependencies flow, where the container is configured, why tests override bindings — equips the agent to make correct decisions about dependency management in situations the author never anticipated. 

Create understanding to reason from, not rules to follow.

**Structural conventions:**
- YAML frontmatter, then an H1 title with a one-line description of what the skill is and when to load it
- Major sections separated by horizontal rules (`---`)
- H2 for major sections, H3 for subsections

**Writing for agents:**
- **Direct statements over hedged language.** "The DO is the source of truth" over "Generally speaking, the Durable Object tends to be used as the primary data store."
- **Bullets and tables over dense paragraphs.** Structured content is faster to scan and easier to reference during work.
- **Concrete examples over abstract descriptions.** Real file paths, real patterns, real commands. "The code follows clean architecture" teaches nothing. A specific example of how a request flows through layers teaches everything.
- **Explicit constraints over implied conventions.** State rules directly rather than relying on the agent to infer them from examples.
- **"Why" alongside "what."** An agent that understands *why* a pattern exists extends it correctly in novel situations. One that only knows the pattern follows it mechanically.

### 4. Decide What to Include and Exclude

**Every line in a skill should earn its place** by helping an agent make a correct decision. This is the hardest part of authoring — the signal-to-noise judgment.

**Include:**
- Knowledge that shapes how an agent *thinks about* the domain — the context that, once internalized, guides downstream decisions
- Specific patterns, conventions, and constraints that aren't discoverable from code alone
- Non-obvious relationships, gotchas, and things that would surprise someone encountering the system for the first time
- Concrete examples that ground abstract concepts

**Exclude:**
- Generic knowledge the agent already has (language features, common patterns, tool documentation)
- Detailed file inventories that go stale on the next commit — prefer conceptual descriptions of organization
- Content that duplicates what's available in other context layers (repo AGENTS.md, other skills)
- Historical context about how things used to work — describe the current state as if it were always this way

**Uneven depth is natural.** Some sections will be rich because that's where the valuable knowledge lives. Others will be sparse because there isn't much to say. Don't pad sparse sections to match rich ones. Skills grow through use as real tasks reveal what's missing.

### 5. Validate

A skill is good if someone can use it without needing additional context to act correctly. Test this:

- **The cold-start test.** Could an agent loading this skill for the first time orient quickly and start making correct decisions? Or would they need to go read other files first to make sense of it?
- **The action test.** After reading each section, is there something the agent can now *do* that they couldn't before? Sections that are informational but not actionable are candidates for cutting.
- **The staleness test.** Will this content still be accurate after the next few changes to the system? If a section would go stale quickly, rewrite it at a more stable level of abstraction.
- **The duplication test.** Is any content here better served by another context layer — a repo AGENTS.md, a different skill, inline code comments? Each layer should carry distinct content.

---

## Quality Principles

1. **Accuracy over completeness.** A wrong claim causes wrong behavior. A missing section just means the agent asks or infers. Never pad with unverified content.

2. **Actionable over informational.** Every section should help an agent *do something* — make a decision, follow a pattern, avoid a mistake. Context that doesn't lead to action is noise.

3. **Stability over specificity.** Write descriptions that remain true as things evolve. "One controller per vendor in `src/controllers/`" survives adding a new vendor. A literal file listing does not.

4. **Thin-but-correct over padded-but-generic.** Uneven depth is natural — some sections will be rich, others sparse. Skills grow through use as real tasks reveal what's missing. A thin skill with accurate content is immediately useful. A padded skill with generic content teaches nothing.

5. **Agent audience.** The reader is an AI agent, not a human. Optimize for fast orientation and correct behavior — direct statements, structured content, concrete examples.

---

## Anti-Patterns

- **The generic best-practices dump.** A skill that reads like a tutorial for a technology. "Use type hints in Python" is not skill content — it's advice any agent already follows. The skill should capture what's specific to *this* context.
- **The tool inventory.** A skill that lists every available tool and its parameters. Skills teach workflows and judgment, not API surfaces.
- **The padded skill.** Filling space to feel comprehensive. If the skill is complete at 60 lines, it's 60 lines. Padding dilutes signal.
- **The stale file tree.** Detailed file listings that go stale on the next commit. Prefer conceptual descriptions of code organization over literal inventories.
- **The island skill.** A skill that duplicates content from other context layers instead of complementing them. Each layer in the context architecture should carry distinct content.
