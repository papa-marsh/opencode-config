---
name: authoring-context
description: Principles for authoring context artifacts (READMEs, AGENTS.md files, skill/command/agent definitions). ALWAYS load before creating or modifying any documentation or context artifact.
---

# Authoring Context

Principles for writing the artifacts that shape agent behavior and document systems — AGENTS.md files, skills, commands, READMEs, design docs. Documentation *is* agent context: the same principles govern all of it.

---

## Principles

- **Current state, not change history.** Context describes how the system works *now*. When updating, rewrite sections to reflect current reality — don't append "Update: we changed X to Y." No vestigial language ("X rather than Y" when Y no longer exists). Historical context belongs in commits and PR descriptions. The reader should never need the history of changes to understand the current system.

- **Understanding over rules.** The goal is to shape *how the agent thinks about the domain*, not to prescribe individual decisions. "Always write to the DB, never to Redis" covers one decision. Explaining the data ownership model — the DB is authoritative, Redis is a read-only projection, and why — equips the agent for situations the author never anticipated.

- **Accuracy over completeness.** A wrong claim causes wrong behavior; a missing one just means the agent asks or infers. Never pad with unverified content.

- **Stability over specificity.** Prefer descriptions that remain true as things evolve. "One controller per vendor in `src/controllers/`" survives adding a vendor; a literal file listing does not.

- **Thin-but-correct over padded-but-generic.** Uneven depth is natural — rich where the valuable knowledge lives, sparse where there isn't much to say. Artifacts grow through use as real tasks reveal what's missing.

---

## Writing Style

The audience is AI agents. Optimize for fast orientation and correct behavior:

- **Direct statements over hedged language.** "The DO is the source of truth," not "the Durable Object tends to be used as the primary store."
- **Bullets and tables over dense paragraphs.** Structured content is faster to scan and reference.
- **Concrete examples over abstract descriptions.** Real file paths, real patterns, real commands. "Follows clean architecture" teaches nothing.
- **"Why" alongside "what."** An agent that understands why a pattern exists extends it correctly in novel situations; one that only knows the pattern follows it mechanically.

---

## What to Include and Exclude

Every line must earn its place. The valuable content is what the agent *can't figure out on its own* — knowledge that lives in people's heads, codebase conventions, or hard-won experience.

**Include:**
- Knowledge that shapes how an agent thinks about the domain
- Specific patterns, conventions, and constraints not discoverable from code alone
- Non-obvious relationships, gotchas, and surprises for a first encounter
- Concrete examples that ground abstract concepts

**Exclude:**
- Generic knowledge the agent already has (language features, common patterns, tool docs)
- File inventories that go stale on the next commit — prefer conceptual descriptions of organization
- Content that duplicates other context layers (repo AGENTS.md, other skills) — each layer carries distinct content
- History of how things used to work

---

## AGENTS.md Files

The core question: **"If I invoked an agent to work in this repo, what context would it need to make correct decisions from the start?"**

Weight content by impact on agent decision-making, in three tiers:

**Tier 1 — Architectural understanding (highest impact).** What the system does and *why* it's built this way; data ownership and flow (what's authoritative, what's derived); key abstractions and their relationships; non-obvious constraints; complex processing pipelines. An agent that internalizes the architecture makes sound structural decisions everywhere downstream.

**Tier 2 — Navigation and extension patterns.** Conceptual code organization (what each area *does*, not a file tree); the "anatomy of a unit" — when adding a vendor/endpoint/feature, what files must exist, what they extend, how they're wired in (the highest-leverage content for feature work); cross-service contracts whose blast radius extends beyond the repo; key entry points.

**Tier 3 — Conventions and operations.** Environment (branch, runtime versions, env vars), verified commands (build/lint/test/deploy), conventions *not* enforced by tooling, testing and error-handling patterns. Individually small, collectively the operational baseline — include them, but don't let them crowd out Tiers 1 and 2.

Write for an agent encountering the repo for the first time — every invocation is a first encounter.

---

## Skills

Before writing, answer three questions:

- **What question does this skill answer?** One clear question — "how do I write tests matching this codebase's patterns?" — not "everything about X."
- **Who loads it and when?** The triggering situation defines what the agent needs most.
- **What changes after loading?** If you can't articulate what the agent can newly do, the skill lacks a purpose.

**Extract, don't summarize.** Research the actual source material — codebases, successful artifacts, team knowledge — and transfer the specific knowledge, not a summary of generally available information. "Use dependency injection" is generic; "services in `src/services/` receive dependencies via constructor injection, configured in `src/container.ts`" is skill content.

The `description` frontmatter determines whether the skill ever gets loaded: cover what it does *and* when to trigger it, front-loading concrete keywords.

For file locations and frontmatter mechanics, load `customize-opencode`.

---

## Commands

Commands are **session initializers with intent** — they shape what the agent knows, how it positions itself, and what kind of collaboration the session has. They sit alongside the other definition types: agent definitions shape *who the agent is*, skills provide *knowledge*, commands trigger *specific processes*. Commands orchestrate; they reference skills rather than duplicating them.

**Design the frame, not the steps.** "Step 1: load X, step 2: read Y, step 3: ask Z" produces rigid sessions that break when conditions vary. Establish the mental model and let the agent adapt:

- **Front-load context** — load skills and establish the mental model before any work happens.
- **Position the agent's role explicitly** — "facilitator and co-author, not interviewer." Without this, agents default to generic assistant behavior.
- **Branch on state** — check what already exists (files, prior work) and adapt, rather than assuming one starting condition.
- **Collaborative by default** — present plans before executing, check in at decision points. Run-to-completion is only for truly mechanical tasks.

Validate a command against four tests: **cold-start** (executable correctly on first use?), **reuse** (good results across varied starting conditions?), **scope** (one intent, not a sprawl?), **role** (is the collaboration model clear?).

After creating a command, update framework references (hub AGENTS.md command tables, context artifacts).

For file locations, frontmatter fields, and prompt features, load `customize-opencode`.

---

## Anti-Patterns

- **The file tree dump.** Looks thorough, tells the agent nothing about what matters, goes stale immediately.
- **The generic best-practices dump.** Reads like a technology tutorial. Doesn't capture what's specific to *this* context.
- **The style guide that crowds out architecture.** 40 lines on naming, 3 on data flow — the agent formats beautifully while writing to the wrong store.
- **The abstract overview.** "Handles data processing using modern best practices." Be specific: what data, from where, processed how.
- **The padded artifact.** If it's complete at 60 lines, it's 60 lines. Padding dilutes signal.
- **The island.** Duplicates content from other context layers instead of complementing them.
- **The rigid script** (commands). Prescribes every step with no room to adapt. Provide structure and principles, not micromanagement.
