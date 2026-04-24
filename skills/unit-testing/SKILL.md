---
name: unit-testing
description: Philosophy and judgment framework for writing tests that protect real functionality from regression
---

# Test Authoring

How to think about what to test, why, and at what level. Load this skill when writing tests or when reviewing test quality.

---

## Core Philosophy

Tests exist to protect real functionality from being silently broken by future changes. Every test should earn its place by guarding something that matters. A test suite is not a coverage report — it's a contract that says "these things work and will continue to work."

Before writing any test, understand the code's *intent*. Read the surrounding code. Understand the business logic. Identify what callers depend on. A test written without this understanding is guesswork — it may exercise code paths, but it doesn't protect anything meaningful.

---

## What to Test

### Test contracts, not implementations

A function's contract is what it promises to its callers — its inputs, outputs, side effects, and guarantees. Test that contract.

Do not test *how* the function fulfills the contract. If a function promises to return active users sorted by name, test that promise. Don't assert that it calls `.filter()` then `.sort()` internally — those are implementation details that may change without breaking anything. Tests coupled to implementation break on every refactor even when behavior is unchanged.

**The refactor test:** If you can refactor the internals of the code under test without changing its behavior, and the test breaks — the test is coupled to implementation, not contract.

### Test boundaries where things compose

The interfaces where modules, services, or components hand off to each other are where regressions bite hardest. A change on one side of a boundary can silently break the other. These composition points deserve testing attention because:

- They represent agreements between parts of the system
- Breakage here propagates — it's rarely isolated
- They're where assumptions diverge between authors

### Test what would hurt if it broke silently

Prioritize logic where subtle bugs are costly:

- **Data transformations** — where inputs are reshaped, filtered, or enriched. A subtle bug here corrupts downstream consumers.
- **Business rules** — the conditional logic that encodes domain decisions. Getting these wrong means the system does the wrong thing while looking like it works.
- **State transitions** — where entities move between states with rules about valid transitions. Invalid state is a class of bug that's hard to detect and hard to recover from.
- **Error handling paths** — not the happy path (that usually gets tested naturally), but the failure modes. How the system behaves when things go wrong is often undertested and high-impact.

### Skip what doesn't earn its place

Not everything needs a test. Trivial logic — simple getters, direct pass-throughs, mechanical delegation with no transformation — doesn't benefit from testing. A test that asserts a getter returns what was set teaches nothing and protects nothing. It exists only to inflate a coverage number.

**The value test:** If this test fails, would it reveal a real bug that matters? If the answer is "no, it would only mean someone changed a trivial detail," the test isn't earning its place.

---

## How to Scope Tests

There is no universal default for unit vs. integration vs. end-to-end. The right scope depends on what you're protecting.

**Use this framework to decide:**

- **What is the risk?** A pure function with clear inputs and outputs is well-served by a unit test. A multi-step workflow involving several components needs integration-level validation to catch the ways they might miscommunicate.
- **Where does confidence come from?** If testing a function in isolation gives you high confidence it works correctly in context, unit-test it. If the value is in how components interact, test the interaction.
- **What's the cost of the test?** Broader-scope tests are more expensive to write, slower to run, and harder to debug when they fail. Narrower-scope tests are cheaper but may miss integration issues. Choose the narrowest scope that gives real confidence for the risk involved.

When writing a new feature, think about scope from the outside in: What does this feature promise to its users or callers? Start from that contract and work inward to determine what level of testing validates it meaningfully.

---

## Tests and Future Development

A good test suite is a safety net, not a cage. Tests should protect against regression without constraining how the code evolves.

**Tests that need modification every time surrounding code changes are a problem.** They create drag on development and signal that the test is coupled to structure rather than behavior. When writing a test, consider: if a future developer refactors the internals of this code (without changing what it does), will this test still pass? If not, the test is too tightly coupled.

**Concrete signs of over-coupling:**
- Asserting on internal method calls or specific call sequences
- Testing private/internal APIs that aren't part of the public contract
- Asserting on exact error messages or log output when the behavior being tested is "it handles the error"
- Mocking so extensively that the test is really testing the mock setup, not the code

**The goal:** Tests that break tell you something real broke. Tests that don't break give you confidence that behavior is preserved. A test that's always breaking for cosmetic reasons trains developers to ignore test failures — the worst possible outcome.

---

## Anti-Patterns

- **Coverage theater.** Writing tests to hit a coverage number rather than to protect functionality. High coverage with low-value tests is worse than moderate coverage with meaningful tests — it creates maintenance burden and false confidence.
- **Mirror tests.** Tests that simply restate the implementation. If the test reads like a line-by-line copy of the function with assertions, it will always pass when the code is wrong in the same way, and always break when the code is refactored correctly.
- **Snapshot overuse.** Asserting on entire serialized outputs when only specific fields matter. These tests break on every inconsequential change and obscure what's actually being validated.
- **Test-per-function thinking.** Organizing tests around the source code's structure (one test file per source file, one test per function) rather than around the behaviors and contracts that matter. Some functions need many tests; some need none.
- **Over-mocking.** Replacing so many dependencies with mocks that the test no longer exercises real behavior. Mocks are useful for isolating the thing under test, but a test that mocks everything around it is testing nothing.

---

## Applying This in Practice

When delegated work that includes tests:

1. **Orient first.** Read the code you're testing. Understand what it does and why. Identify the contracts, boundaries, and high-risk logic.
2. **Decide what matters.** Not everything needs a test. Identify the behaviors that, if broken, would cause real problems.
3. **Choose the right scope.** For each thing worth testing, determine whether a unit test, integration test, or broader test gives meaningful confidence.
4. **Write tests that describe behavior.** Test names and structure should communicate what the code promises, not how it's built. A reader should understand the contract from the tests alone.
5. **Follow repo conventions.** The repo's AGENTS.md and existing test patterns define *how* tests are written in that codebase — frameworks, file organization, naming conventions, helpers. This skill defines *what* to test and *why*; the repo defines the rest.
