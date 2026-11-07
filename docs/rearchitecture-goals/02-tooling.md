# Tooling: choose sustainable quality owners

Use the [session protocol](00-prerequisites.md#session-protocol), [maintainer principles](../../.agents/skills/design-system-maintainer/SKILL.md) and [quality ownership matrix](../../.agents/skills/design-system-maintainer/references/quality-ownership.md). Start from current contracts and failures worth preventing. Earlier custom checkers were retired; any replacement must earn its place through a fresh comparison.

```text
/goal Execute docs/rearchitecture-goals/02-tooling.md with GPT-6.1 Sol at High effort as the session orchestrator. Follow the session protocol in docs/rearchitecture-goals/00-prerequisites.md. Audit tooling, framework conventions and quality enforcement using the maintainer persona and decision matrix. Implement the least costly adequate owners, test their coverage and record maintenance tradeoffs.
```

## Audit and implement

- [ ] Inventory the current compiler, Biome configuration, package guidance, tests, build and development workflow. Identify useful guarantees, duplicate work, gaps, false positives and unsupported assumptions. Inspect retired code or legacy guidance only to answer a concrete question.
- [ ] Separate static shape and spelling from semantic meaning, runtime behavior, visual judgment and agent choices. Prefer installed TypeScript and Biome capabilities for guarantees they establish. Compare public APIs/JSDoc, maintained extensions, focused tests, human review and agent guidance as the requirement warrants. Custom analysis needs an observed gap and an explicit maintenance justification.
- [ ] Review React state/effect patterns, type boundaries, routing/generated files and package usage against the installed versions and current app. Establish which conventions improve real work and where their authoritative source belongs. Improve source contracts or diagnostics before adding instructions.
- [ ] Audit test environments, helpers, fixtures and browser setup. Select scope and run frequency by the failures each can detect. Compare local feedback, CI execution, agent usage, human review and upkeep using the matrix; distinguish measurements from estimates.
- [ ] Evaluate the current maintainer role and routing alongside any proposed guidance. Use matched fresh tasks, held-out cases and unrelated controls. Measure decision quality, unnecessary invocations and total context, including references. Retain instructions only with a clear need and evidence.
- [ ] Establish a reproducible contributor verification path with declared Bun commands and actionable diagnostics. Decide which checks belong during local work, per PR, on tooling changes or in occasional evaluations. Remove duplicate scans and unused dependencies where warranted.

## Acceptance

Demonstrate selected deterministic checks through the ordinary command on a violating and nearest-valid case. Validate behavioral checks in an environment that reproduces the relevant failure. Evaluate judgment through real tasks and accountable review. Record residual gaps explicitly.

Verify installation and the chosen workflow from a clean copy of the intended files, using the lockfile and documented setup without maintainer credentials or an agent subscription. Run a representative bad change and its restored passing state. Report local timing separately from measured hosted CI costs.

## Handoff and cleanup

Pass selected owners, commands, run frequencies, evidence limits and unresolved product questions to Phase 03; provide the clean-checkout result for Phase 04. End with the [cleanup handoff](00-prerequisites.md#handoff-and-cleanup), retiring comparison fixtures and superseded tools after their findings reach the owner. Do not stage or commit unless explicitly asked.
