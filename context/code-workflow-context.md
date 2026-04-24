# CODE Workflow

**Critical: The CODE framework underpins the entire agentic workflow. All agents must be aware of their specific role within the broader workflow architecture. Use the following description for level-setting and grounding.**

Human-guided engineering using the CODE framework: **Capture, Organize, Distill, Express.**

The user is the **Navigator** — providing anchors of intent and discernment of quality. The AI is the **Engine** — handling structural heavy lifting and high-volume synthesis. Work flows through four phases across two modes:

- **Expansion Mode** (Capture + Organize): Widen the aperture. Gather signal, build structure.
- **Convergence Mode** (Distill + Express): Collapse the waveform. Filter, decide, ship.

The user drives phase transitions by switching between primary agents.

---

## The Four Phases

### Phase 1: Capture (Expansion)

The entry point. Clarifies intent and establishes ground truth — the facts, constraints, and environment realities that downstream phases cannot violate.

- **Produces:** `goal.md` (crystallized intent) and `anchor.md` (ground truths and constraints)
- **Invokes:** Research
- **Key discipline:** Separate facts from opinions. Anchors are evidence-backed, not speculative.

### Phase 2: Organize (Expansion)

Takes ground truth and builds structural scaffolding — architecture, plans, outlines, option matrices, task breakdowns. Still in Expansion Mode: remain open to new connections.

- **Produces:** `plan.md` (structural scaffolding)
- **Invokes:** Research, Architect, Model
- **Key discipline:** Structure the problem before solving it. Collaborate with the user on the plan.

### Phase 3: Distill (Convergence)

The gear shift. Expansion is over — stop exploring, start deciding. Stress-tests the plan through rigorous discernment: Devil's Advocate, Hallucination Audit, Persona Lens, and other toolkit techniques.

- **Produces:** Refined `plan.md` (no new artifacts — refinement of existing work)
- **Invokes:** Research, Review, Debug
- **Key discipline:** Test, don't validate. Surface counterarguments. Reject plausibility in favor of reality.

### Phase 4: Express (Convergence)

Turns the distilled plan into production artifacts — code, documentation, tests. Delegates execution to subagents and reviews each unit with the user before proceeding.

- **Produces:** Production artifacts + `summary.md`
- **Invokes:** Research, Implement
- **Key discipline:** Section-by-section review. Micro-audits at every step. Ownership sign-off.

---

## Planning Artifacts

All planning and design artifacts live in `~/.config/opencode/plans/<task-folder>/`.

**Task folder naming:** `YYMMDD-<description>` (e.g., `260224-add-rate-limiting-to-ia`, `260218-etl-kafka-migration`)

**Standard artifacts:**

| File | Produced By | Purpose |
|------|------------|---------|
| `goal.md` | Capture | Crystallized intent, scope, constraints, success criteria |
| `anchor.md` | Capture | Ground truths, facts, constraints the solution must respect |
| `plan.md` | Organize | Structural scaffolding — architecture, task breakdown, sequencing |
| `summary.md` | Express | What was accomplished, decisions, files changed, follow-ups |

Architect and Model subagents may write additional design artifacts to the same folder when invoked.

---

## Subagent Invocation Protocol

Subagents receive **only** what is passed in the invocation prompt. They have no session context, no access to planning artifacts unless given paths, and no knowledge of the current workflow state. But keep context focused; too much noise can reduce signal. 

**Include in subagent invocations:**
- Task description with clear acceptance criteria
- Relevant repo(s)
- Active branch name (if work involves git)
- Artifact directory path (if subagent needs to read or write artifacts)
- Recommended skills to load
- Desired response depth — e.g. summary, targeted answer, or comprehensive survey. Default to concise and targeted unless otherwise needed.

**Include when relevant:**
- Planning context — constraints from anchor.md, decisions from plan.md
- What came before — WIP summary if building on previous work in the same session
- Recommended research areas — specific things the subagent should explore

**Pass references, not contents.** 
- Primary agents provide subagents with file paths, class/function names, and pattern descriptions — not the contents of those things
- This applies equally to task artifacts (plan.md, anchor.md) and to source code — point the subagent at the file, don't re-explain it
- Acquire **only** the context needed to delegate effectively
- Subagents can and should be instructed to read source files themselves
- This keeps primary agents' context window focused on orchestration (plan alignment, acceptance criteria, sequencing) 

---

## Context Architecture

| Layer | Location | When Loaded |
|-------|----------|-------------|
| Personal preferences | `~/.config/opencode/AGENTS.md` | Every session, automatically |
| Cross-cutting knowledge | `~/.config/opencode/skills/` | On-demand when relevant |
| Repo-specific patterns | `AGENTS.md` in each repo root | During orientation |
| Situational context | `~/.config/opencode/context/` | When instructed |

---

## Cross-Session Continuity

Planning artifacts are the persistence layer between ephemeral sessions. When resuming a task in a new session:

1. Prompt the user to provide the artifact directory path, if not provided.
2. The agent reads all artifacts to orient (`goal.md`, `anchor.md`, `plan.md`, any design artifacts).
3. If context feels incomplete — ask the user. They may have session-specific context (where work left off, what's changed, decisions made outside the artifacts) that isn't captured in the files.

---

## Non-Linear Loop

Movement through CODE phases is not always linear. When a later phase reveals a problem, step backward **methodically** — only as far as necessary.

**Reverse-priority queue** (from any phase, work backward):

1. **Logic wrong → stay in current phase or step to Distill.** Data and structure are fine; reasoning needs refinement. Low cost.
2. **Structure wrong → step back to Organize.** Crosses the boundary from Convergence to Expansion. Fix the structural flaw and return. Medium cost.
3. **Facts wrong → step back to Capture.** Underlying ground truth is incorrect or missing. Highest cost.

**Cost model:**
- **Same-mode** backtrack (e.g., Express → Distill, Organize → Capture): Sharpening. Low cost, high value.
- **Cross-boundary** backtrack (e.g., Distill → Organize, Express → Capture): Re-opening scope. Dip back only long enough to fix the flaw, then return to Convergence.

---

## Available Skills

| Skill | Type | Purpose |
|-------|------|---------|
| `platform` | Domain | Team platform context: services, architecture, repos, design principles |
| `python` | Tech | Language patterns, async, typing, testing |
| `typescript` | Tech | TypeScript conventions — type patterns, Zod usage, error handling, imports, async |
| `unit-testing` | Task | Philosophy and judgment framework for writing tests that protect real functionality |
| `documentation` | Task | Principles for writing and updating documentation |

**Loading guidance:**
- Primary agents load **domain skills** for planning context
- Primary agents recommend **domain and tech skills** in subagent delegations
- Subagents load recommended skills and any additional skills they need
