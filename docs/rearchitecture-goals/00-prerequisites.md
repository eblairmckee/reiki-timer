# Rearchitecture: purpose, responsibilities and baseline

Establish the architecture we intend to maintain for a growing Reiki app, together with the quality ownership model that sustains it. The work must resolve where responsibilities belong, how changes cross those boundaries and how important guarantees remain reliable as features and contributors grow.

The [maintainer role](../../.agents/skills/design-system-maintainer/SKILL.md) supplies the principles for architectural judgment. The [quality ownership matrix](../../.agents/skills/design-system-maintainer/references/quality-ownership.md) selects how an agreed responsibility or guarantee should be maintained. Establish the intended contract and owner before choosing enforcement. Architectural review, change-impact analysis, runtime evidence and contributor tasks answer different questions; select evidence appropriate to the claim.

Plans describe unresolved decisions and required outcomes. Source and existing guidance describe the implementation and standing rules. Keep enduring decisions with their owners; avoid creating a parallel specification or component inventory in the plans.

## Phase responsibilities

| Phase | Decision it owns | Required outcome |
| --- | --- | --- |
| [00 — Baseline](#start-here) | Which current evidence is trustworthy enough to begin? | A bounded verification baseline with explicit limits |
| [01 — UI and design](01-ui-and-design.md) | How should shared design and interaction responsibilities be divided, composed and extended? | A justified system contract model, implemented improvements and quality owners for its guarantees |
| [02 — Tooling](02-tooling.md) | How should repository-wide conventions and verification operate sustainably? | A coherent development/checking workflow with justified mechanisms, coverage and costs |
| [03 — Product repo](03-product-repo.md) | How should product responsibilities and dependencies be arranged for reliable feature work? | A justified app/feature architecture with preserved behavior and appropriate quality controls |
| [04 — Contributions](04-open-source-contributions.md) | How can outside contributors participate in the accepted architecture and its maintenance? | A verified contribution model, accountable human ownership and explicit release-readiness decisions |

Quality ownership is part of every phase. Tooling supplies shared infrastructure; design and product owners establish the meaning and acceptance of their contracts. Later findings may reopen earlier decisions with evidence. Phase 04 follows user acceptance of the integrated baseline.

A phase is complete when its consequential ownership choices are explained, warranted changes are implemented, and evidence supports the chosen contracts and controls with residual judgments identified. Retaining a sound existing design is a valid outcome. Less custom code and instruction are benefits to pursue alongside correctness and maintainability.

## Session protocol

Start the UI/design, tooling and product-repo audits from the relevant [conventions](../conventions.md). Apply the persona to the existing code and propose specific improvements; use the matrix to evaluate their quality owners and enforcement. Keep accepted intent, implementation findings and proposed convention changes distinct.

Each plan is a fresh architectural assessment. Begin with this protocol and the selected plan; open source and historical material only as needed. Reuse applicable handoff evidence and repeat verification when intervening changes invalidate it. Keep legacy skills outside active discovery. Evaluate the persona and matrix themselves when their routing or advice produces unnecessary context, poor choices or unjustified work.

The orchestrator investigates, recommends and implements changes within the user's stated intent. Resolve ordinary architecture and tool choices from the principles and evidence. Bring conflicting requirements or consequential changes to product/design intent to the human owner with a concrete recommendation and tradeoffs. Baseline acceptance, licensing and release authority remain with the user.

The phase outcomes describe the full rearchitecture. Follow the current session's authorization scope: an audit-only session produces concrete recommendations and a validation approach, with implementation explicitly pending.

Delegate independent work when it saves time or cost. Use GPT-6 Luna at High effort for inventories, reference tracing and collecting fixture results. Use GPT-6.1 Sol at Medium effort for bounded implementation or debugging. Run simple commands directly. Keep architecture, rule-removal judgments, integration and final verification with the orchestrator.

For before/after agent evaluations, repeat identical task prompts in separate fresh GPT-6.1 Sol chats at Medium effort, with delegation off in both runs and comparable isolated inputs/tools. Follow the matrix's measurement protocol. Keep hypotheses, observed coverage and costs, unknowns, alternatives and decisions concise. Count all required guidance, including references; measure actual reads separately from stored words.

Use the in-app browser with the already running dev server for manual visual verification only when rendering changes or a visual question remains unresolved. Inspect affected views and states. The user reviews the running UI directly; do not make Vitest snapshots or generated screenshots a user-review requirement. Do not introduce committed visual snapshot baselines unless explicitly requested. Use the appropriate declared Bun checks for each change.

**Do not stage or commit unless explicitly asked. Preserve the user's staged changes and carry this constraint into every handoff.** Hosted review activation and publication remain separate maintainer decisions after baseline acceptance.

## Start here

```text
/goal Execute docs/rearchitecture-goals/00-prerequisites.md with GPT-6.1 Sol at High effort as the session orchestrator. Follow its session protocol. Establish the current checkout and verification baseline using the maintainer persona and quality ownership matrix, then hand off to the next fresh audit.
```

- [ ] Identify the revision, staged/working changes, installed tools and actual commands. Verify links and entrypoints required for the next task.
- [ ] Establish what the current lint, types, tests and build demonstrate and where evidence is missing. Diagnose failures at their owner. Use focused bad/valid trials when a decision depends on a specific guarantee.
- [ ] Select the next audit and pass only its relevant findings and unresolved decisions. Preserve product behavior while reassessing its implementation. Record intentional behavior changes for human review.

## Targeted history recovery

Phase 021 has completed this reconciliation and integrated its decisions. The inventory below records the original recovery scope; current work uses [conventions](../conventions.md) and [the completed handoff](021-tooling.md#phase-021-handoff--november-7-2026). Historical sources are retained evidence, not a prerequisite to routine changes.

The reset removed the remaining React, TypeScript, testing, TanStack and skill-maintenance guidance as well as custom design/token checkers, their fixtures and command wiring; the UI skill had already been removed. Biome, TypeScript and existing tests remain. Deletion does not demonstrate replacement coverage. The [conventions inventory](../conventions.md#recovered-framework-ui-and-testing-concerns) records the recovered concerns and source manifest; [Phase 02](02-tooling.md#coverage-baseline-and-recovery) must reconcile every historical section and removed checker responsibility before claiming coverage. Previous completion claims and trial transcripts are historical evidence to verify, not present results.

Use `git show <commit>:<path>` for a specific question. Treat recovered findings as hypotheses to verify against the current checkout.

| Recovery point | Available material |
| --- | --- |
| `717e5127dc29805e52496b39a79dfd6a3d38e382` | Promoted system source, former `scripts/` checkers, plan audits, and legacy tooling/testing skills |
| `31885f069728df7d1ae15301c6cf6d113046a769` | Earlier prerequisite audit and `.agents/skills/ui-design/` |
| `1667bd12a2bef79404a893e1c60dfe8a6f945a6e` | Original implementation and skills before rearchitecture |
| `c5166b39e7bf4129953a20032f6facbacad1d27d` | Original prerequisite/tooling/product plans requiring complete legacy-rule accounting and verified automation replacements |

These commits exclude later uncommitted guidance and trials. Ignored evidence directories were already removed. Current principles and the matrix remain in the maintainer skill; maintained design studies remain with their source references.

## Handoff and cleanup

Append the handoff to the end of the current phase's plan; do not create a separate document. Keep it brief: the verified starting point, actionable unresolved findings and next plan. Separate decisions for the human reviewer from work owned by the next audit. Include the no-stage/no-commit constraint.

Generated browser-test screenshots and reports are disposable debugging output. Keep them ignored by Git and remove them once their debugging purpose is complete, before handoff, without waiting for user review. This is standing cleanup authorization; retaining behavioral test source does not require retaining generated artifacts.

**Retained evidence is excluded from routine cleanup.** The ignored `.audit-evidence/` directory is deliberately retained local evidence, not temporary output. Do not delete, prune or replace its contents merely because an audit or user review has finished. Removal requires an explicit user instruction identifying the evidence to retire. Follow the [evidence register](021-tooling.md#evidence-retention) for its contents and current locations. This retention rule takes precedence over older retirement notes for material moved there.

End with any other temporary artifacts requiring follow-up, listing each path, purpose, remaining consumer and retirement condition; say "none" when applicable. After user verification or explicit cleanup authorization, the incoming session removes those spent artifacts. Preserve accepted decisions beside their durable owner.

## Phase 00 handoff — November 6, 2026

**Baseline:** `main` at `b2f3921`, initially clean. Bun `1.2.17`, Node `24.18.0`. `bun run check`, `lint`, `typecheck`, `build` and `test` passed: 115 tests, including Chromium. Chromium required local server permission. Application code is unchanged; current edits are documentation only.

### Human review

none

### Next audit

Start [01 — UI and design](01-ui-and-design.md) fresh, as an audit only:

- Resolve contrast evidence: axe leaves gradients/images/overlaps undetermined; existing contrast tests model colors rather than rendered pixels. Browser tests default to reduced motion, leaving ordinary animation unverified.
- Assess the passing modal focus test's repeated React `act` warnings at the test owner.
- Carry to Phase 02: `.vscode/settings.json` selects `bun test`, while the declared suite uses `bun run test` (Vitest).

Do not stage or commit unless explicitly asked; preserve user-staged changes.

**Temporary artifacts requiring follow-up:** none. The separate handoff document was removed; no temporary tests, fixtures, scripts or reports remain.
