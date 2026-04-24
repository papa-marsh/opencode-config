---
name: authoring-agents-md
description: Principles and patterns for creating effective AGENTS.md files in repositories
---

# AGENTS.md Authoring

Principles for creating AGENTS.md files that make agents effective in a codebase.

Also load the `documentation` skill — it provides complementary writing principles for documentation work.

---

## The Core Question

When writing an AGENTS.md, ask: **"If I invoked an agent to work in this repo, what context would it need to make correct decisions from the start?"**

The goal is not to describe the behavior you want — it's to create the conditions where the agent naturally arrives at correct behavior. 

An AGENTS.md that says "always write to the DO, never write to D1" covers that one decision. An AGENTS.md that explains the data ownership model — the DO is authoritative, D1 holds read-only projections, and *why* — equips the agent to make correct data-flow decisions in situations the author never spelled out.

Architectural understanding first, because it shapes every downstream decision.

The audience is AI agents, not humans. Optimize for fast orientation and correct behavior. Every line should earn its place by helping an agent understand the system, navigate the codebase, or follow the right patterns.

---

## Impact Tiers

Weight content by its impact on agent decision-making. The most valuable context is the kind that shapes *how an agent thinks about the system* — the context that, once internalized, guides every decision downstream.

### Tier 1: Architectural Understanding (highest impact)

This is the most important content in the file. An agent that correctly understands the architecture will make sound structural decisions throughout its work.

**What belongs here:**
- What the system does and **why** it's built this way — not just the "what," but the reasoning behind key design decisions
- Data ownership and flow — what's authoritative, what's derived, what's a projection
- Key abstractions and their relationships — the mental model an experienced engineer holds when working in the repo
- Non-obvious architectural constraints — things that would surprise someone working in the repo for the first time
- Complex processing pipelines or invocation chains — if a request flows through multiple layers with specific ordering/middleware, document the chain

**Example:**
> "Each integration is a Durable Object instance — the authoritative store for all integration data. D1 holds a read-only projection for aggregated queries. Operations needing current state always go to the DO, never D1."

An agent with this context understands the data ownership model and will correctly direct reads and writes from the start.

### Tier 2: Navigation and Extension Patterns (high impact)

How an agent finds what it needs and knows what to create when extending the system.

**What belongs here:**
- Conceptual code organization — what lives where, organized by functional area. Describe what each area *does* rather than listing every file.
- The "anatomy of a unit" — when adding a new vendor, endpoint, integration, or feature, what files need to exist, what do they extend, and how are they wired in. This is the highest-leverage content for feature work.
- Cross-service contracts and boundaries — message schemas, API contracts, shared types that affect other systems. An agent modifying these needs to know the blast radius extends beyond the repo.
- Key entry points — where does execution start? What are the main handlers, routes, or consumers?

**Example:** "`src/controllers/` — One file per vendor extending `BaseWebhookController`. Handles webhook lifecycle: subscription validation, raw payload write to R2, notification parsing. New vendors need a controller, a transformer in `src/transformers/`, and registration in `src/registry.ts`."

Prefer this kind of conceptual description over literal file trees, which go stale quickly and bury signal in noise.

### Tier 3: Conventions and Operations (supporting context)

Objective facts and patterns that give the agent a complete operational picture. These tend to be concise — a few lines each — and are valuable precisely because they're quick to state and remove guesswork.

**What belongs here:**
- Operational environment — primary git branch, how to activate a virtualenv, runtime version constraints (e.g., "TypeScript 5.4, strict mode"), relevant environment variables
- Commands — build, lint, test, format, deploy. Verify against actual config. Include warnings where relevant (e.g., "do not run deploy manually").
- Code conventions — formatting, naming, import style. Reference the config file rather than restating its contents. Focus on conventions that *aren't* enforced by tooling.
- Testing patterns — framework, structure, mocking approach. Lead with what's architecturally important (e.g., "tests run in Workers runtime, not Node") before listing style conventions.
- Error handling patterns — custom exceptions, error boundaries, logging conventions.

These items are individually small but collectively establish the operational baseline. Include them — just ensure they don't crowd out Tier 1 and 2 content.

---

## Writing for Agent Consumption

AGENTS.md is consumed by AI agents during orientation. These formatting preferences help agents internalize context effectively:

- **Prefer direct statements.** "The DO is the source of truth" communicates more efficiently than "Generally speaking, the Durable Object tends to be used as the primary data store."
- **Prefer bullets and tables for structured information.** Dense paragraphs can bury signal. Structured content is easier for an agent to scan and reference.
- **Prefer concrete examples.** Real file paths, real patterns, real commands. Abstract descriptions ("the code follows clean architecture principles") are less actionable than specific ones.
- **Prefer explicit over implied conventions.** Stating constraints directly is more reliable than relying on an agent to infer rules from examples.
- **Include "why" alongside "what" where possible.** An agent that understands *why* a pattern exists will extend it correctly in novel situations. One that only knows the pattern exists may follow it mechanically.

---

## Principles

1. **Accuracy over completeness.** A wrong claim is worse than a missing one. An agent that trusts AGENTS.md and acts on incorrect information will produce incorrect code. Verify every claim against the actual codebase.

2. **Conceptual understanding over exhaustive listing.** The goal is for an agent to understand *how the repo works* well enough to navigate and contribute — not to have a reference manual for every file.

3. **Stability over specificity.** Prefer descriptions that remain true as the repo evolves. "One controller per vendor in `src/controllers/`" stays accurate when a new vendor is added. A literal file listing does not.

4. **Actionable over informational.** Every section should help an agent *do something* — find the right file, follow the right pattern, run the right command, avoid the wrong change.

---

## Anti-Patterns

- **The file tree dump.** Listing every file looks thorough but tells an agent nothing about *what matters* or *how things connect*. It goes stale immediately and buries signal in noise.
- **The style guide that crowds out architecture.** 40 lines on naming conventions and 3 lines on data flow. The agent will format its code beautifully while writing to the wrong data store.
- **The abstract overview.** "This service handles data processing using modern best practices." An agent learns nothing actionable from this. Be specific: what data, from where, processed how, delivered to whom.
- **Vestigial language.** AGENTS.md should describe the system as it exists now, as if there were no prior state. "The system does X, not Y" when Y no longer exists introduces distracting history that doesn't help an agent operate in the current codebase. Evolutionary context belongs in commits and PR descriptions.
- **Assumed context.** Writing as if the reader already knows the system. AGENTS.md should make sense to an agent encountering the repo for the first time — because every agent invocation is effectively a first encounter.
