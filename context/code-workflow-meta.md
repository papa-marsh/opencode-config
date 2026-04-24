# CODE Workflow Architecture

This skill describes the CODE workflow framework — file inventory, agent topology, artifact flow, and evolution principles. It is a **map**, not a copy. Read individual files for their full contents.

---

## Design Intent

The framework implements Tiago Forte's **CODE** (Capture, Organize, Distill, Express) adapted for turn-based, human-guided software engineering.

**Core model:** The human is the **Navigator** (providing anchors and discernment). The AI is the **Engine** (handling structural heavy lifting and synthesis). The user drives phase transitions by switching between primary agents.

**Two modes of work:**
- **Expansion** (Capture + Organize) — widen the aperture, gather signal, build structure
- **Convergence** (Distill + Express) — collapse the waveform, filter, decide, ship

**Key properties:**
- The user orchestrates by switching between primary agents. Phase transitions are human decisions.
- Primary agents are the user's interface — one per CODE phase. They load hub AGENTS.md context automatically.
- Subagents are invocable tools — they receive only what the invoking agent provides in the prompt. No session context, no hub AGENTS.md.
- Planning artifacts on disk persist between ephemeral sessions.
- The non-linear loop allows methodical backtracking when later phases reveal problems.

---

## File Inventory

### Agent Definitions (`~/.opencode/agents/`)

**CODE primary agents** (user-facing, one per CODE phase):

| File | Agent | Mode | Phase | Can Invoke |
|------|-------|------|-------|------------|
| `capture.md` | Capture | primary | Expansion 1 | Research, Jira |
| `organize.md` | Organize | primary | Expansion 2 | Research, Architect, Model |
| `distill.md` | Distill | primary | Convergence 1 | Research, Review, Debug |
| `express.md` | Express | primary | Convergence 2 | Research, Implement, Review, Jira |

**Subagents** (invocable tools, no session context):

| File | Agent | Role | Can Invoke |
|------|-------|------|------------|
| `research.md` | Research | Read-only codebase exploration. Returns findings. | None |
| `implement.md` | Implement | Code execution — features, fixes, refactoring. Self-reviews. | Research, Review, Model |
| `review.md` | Review | Fresh-eyes code review. Severity-tiered findings. Read-only. | Research |
| `architect.md` | Architect | System-level design. Proposals for approval. | Research |
| `model.md` | Model | Data modeling. Concrete illustrative schemas. | Research |

**Key topology rules:**
- Primary agents invoke subagents via the Task tool. Subagents report back to the invoking primary agent.
- Research is a universal leaf node — invocable by everyone, invokes no agents.
- Jira is a leaf node — invocable by Capture, Express, and Operate. Invokes no agents.
- Implement can additionally invoke Review (mandatory self-review) and Model (mid-task data modeling).
- Express can optionally invoke Review as a quality gate on completed units.
- Subagents never invoke primary agents or other work-level subagents (except Implement's special permissions).

### Hub Configuration (`~/.opencode/AGENTS.md`)

Loaded into every primary agent session started from `~/`. Contains:
- Framework overview (CODE phases, two modes)
- Planning artifact conventions (task folder naming, standard files)
- Git conventions (staging branch, feature branch naming, Jira ticket)
- Subagent invocation protocol (what context to pass)
- Context architecture (four layers)
- Cross-session continuity (planning artifacts as persistence layer, orientation protocol)
- Non-linear loop protocol (reverse-priority queue, cost model)
- Available skills reference

### Global Preferences (`~/.config/opencode/AGENTS.md`)

Loaded automatically by the platform on every session. Personal preferences that apply universally.

### Skills (`~/.opencode/skills/`)

Loadable knowledge modules. Any agent can load skills via the Skill tool.

| Skill | Type | Purpose |
|-------|------|---------|
| `platform` | Domain | Team platform context: services, architecture, repos, design principles |
| `authoring-agents-md` | Task | Principles for creating effective AGENTS.md files |
| `authoring-commands` | Task | Process for writing effective OpenCode command files |
| `authoring-skills` | Task | Process for building effective SKILL.md files |
| `documentation` | Task | Principles for writing and updating documentation |
| `cloudflare` | Tech | Workers, Durable Objects, D1, KV, R2 |
| `python` | Tech | Language patterns, async, typing, testing |
| `typescript` | Tech | TypeScript conventions — type patterns, Zod usage, error handling, imports, async |
| `unit-testing` | Task | Philosophy and judgment framework for writing tests that protect real functionality |

**Skill types:**
- **Domain** — team and system context. Primary agents may load directly.
- **Tech** — platform and language patterns. Loaded by subagents during execution; recommended by primary agents in delegations.
- **Task** — guidance for specific task types. Loaded when a matching task is identified.
- **Meta** — about the framework itself. Loaded for retrospectives and meta conversations.

### Context References

Context artifacts for specific topics that can be read and referenced as needed. 

| Reference | Purpose |
|-------|------|---------|
| `code-workflow-context` | Baseline instructional context for agents that operate as a part of the CODE agentic workflow |
| `code-workflow-meta` | Meta guidance related to the design intent and evoluntionary principles of the CODE workflow |

### Platform Configuration (`~/.opencode/opencode.json`)

Permission model:
- All tools allowed by default
- Git writes (commit, push, merge, rebase) require approval
- `rm -rf` denied, force push denied
- External directory access allowed except `~/.ssh/`

### Planning Artifacts (`~/.config/opencode/plans/`)

Each task gets a folder: `YYMMDD-<description>`

Standard files:
- `goal.md` (Capture) — crystallized intent
- `anchor.md` (Capture) — ground truths and constraints
- `plan.md` (Organize) — structural scaffolding
- `summary.md` (Express) — what was done, decisions, follow-ups

Additional ad-hoc artifacts may be written to the same folder.

---

## The CODE Flow

```
  EXPANSION                          CONVERGENCE
  ─────────                          ───────────
  Capture ──→ Organize ──→ Distill ──→ Express
  (Ground      (Structure)   (Filter)    (Artifacts)
   Truth)
       ↑           ↑           ↑
       └───────────┴───────────┘
           Non-Linear Loop
        (backtrack as needed)
```

**Artifact flow:**
1. Capture: `goal.md` → `anchor.md`
2. Organize: `plan.md` (+ design artifacts from Architect/Model)
3. Distill: Refines `plan.md` (no new artifacts)
4. Express: Production artifacts + `summary.md`

**Phase transitions** are driven by the user switching primary agents.

---

## Evolution Principles

The framework improves through use. When patterns, friction, or gaps are observed:

1. **Identify** — what happened, what should be different
2. **Classify** — what kind of change, where it belongs (see below)
3. **Propose** — present to user with reasoning
4. **Approve** — user approves all framework changes. No autonomous modification.

### Where Changes Belong

| What Changed | Where It Goes |
|-------------|---------------|
| New reusable knowledge about a technology or platform | New or updated **tech skill** |
| New understanding of team architecture or system relationships | Updated **domain skill** (`cf1int-platform`) |
| New task-type workflow that should be repeatable | New **task skill** |
| Behavioral change to how an agent operates | Updated **agent definition** (`~/.opencode/agents/`) |
| New workflow convention or cross-agent pattern | Updated **hub AGENTS.md** (`~/.opencode/AGENTS.md`) |
| New repo-specific patterns or conventions | Updated **repo AGENTS.md** (in the repo) |
| New slash command for a recurring workflow | New **command** (`~/.opencode/commands/`) |
| Personal preference that should apply everywhere | Updated **global preferences** (`~/.config/opencode/AGENTS.md`) |

The key test: **will this knowledge be useful across multiple sessions and contexts?** If yes, it belongs in the framework. If it's specific to one task, it belongs in a planning artifact.

### Skill vs. Subagent

When a capability gap is identified, classify it:

- **Subagent** — the gap is a distinct *workflow* that needs delegation. It has its own investigation cycle and return report.
- **Skill** — the gap is specialized *knowledge* that improves an existing agent's execution within its current workflow.

**The test:** Does resolving this gap require a new agent to *do work and report back*, or an existing agent to *think in a certain way about the work it's expected to do*?

### The Authoring Principle

Every context document in this framework — agent definitions, skills, AGENTS.md files, commands — works the same way: **you are shaping the decision-making environment an LLM operates in, not describing desired output.** The behavior you want is emergent from the framing, not prescribed by it.

This distinction matters because:
- **Prescriptive instructions** ("always do X, never do Y") are brittle. They cover the cases the author anticipated and fail silently on everything else.
- **Well-framed context** ("here's how this system works, here's what matters, here's why") equips the agent to make correct decisions in situations beyond what the author imagined.

The practical implication: when authoring or evolving any framework artifact, optimize for *shaping how the agent thinks about the problem* over *specifying what the agent should do*. The right mental model generalizes; a list of instructions does not.
