# Fresh audit: approach and starting state

Reassess the Reiki app, its design system and its quality ownership from the current working tree. The timer is the first feature of a future open-source app. The aim is reusable architecture, discoverable contracts and sustainable maintenance for humans and agents.

Read the [maintainer role and principles](../../.agents/skills/design-system-maintainer/SKILL.md) and its [quality ownership matrix](../../.agents/skills/design-system-maintainer/references/quality-ownership.md). Derive requirements from user intent, public contracts and real consumers. Assess existing implementations, tests, configuration and guidance against those requirements. Their presence does not settle their ownership or adequacy.

## Session protocol

Each plan is a fresh audit. Begin with this protocol and the selected plan; open source and historical material only as the task needs it. Keep legacy skills outside active discovery. Evaluate the current persona and matrix themselves when their routing or advice produces unnecessary context, poor choices or unjustified work.

Delegate independent work when it saves time or cost. Use GPT-6 Luna at High effort for inventories, reference tracing and collecting fixture results. Use GPT-6.1 Sol at Medium effort for bounded implementation or debugging. Run simple commands directly. Keep architecture, rule-removal judgments, integration and final verification with the orchestrator.

For before/after agent evaluations, repeat identical task prompts in separate fresh GPT-6.1 Sol chats at Medium effort, with delegation off in both runs and comparable isolated inputs/tools. Follow the matrix's measurement protocol. Keep hypotheses, observed coverage and costs, unknowns, alternatives and decisions concise. Count all required guidance, including references; measure actual reads separately from stored words.

Use the in-app browser with the already running dev server for manual visual verification only when rendering changes or a visual question remains unresolved. Inspect affected views and states. Use the appropriate declared Bun checks for each change.

**Do not stage or commit unless explicitly asked. Preserve the user's staged changes and carry this constraint into every handoff.** Hosted review activation and publication remain separate maintainer decisions after baseline acceptance.

## Start here

```text
/goal Execute docs/rearchitecture-goals/00-prerequisites.md with GPT-6.1 Sol at High effort as the session orchestrator. Follow its session protocol. Establish the current checkout and verification baseline using the maintainer persona and quality ownership matrix, then hand off to the next fresh audit.
```

- [ ] Identify the revision, staged/working changes, installed tools and actual commands. Verify links and entrypoints required for the next task.
- [ ] Establish what the current lint, types, tests and build demonstrate and where evidence is missing. Diagnose failures at their owner. Use focused bad/valid trials when a decision depends on a specific guarantee.
- [ ] Select the next audit and pass only its relevant findings and unresolved decisions. Preserve product behavior while reassessing its implementation. Record intentional behavior changes for human review.

| Plan | Fresh audit focus |
| --- | --- |
| [01 — UI and design](01-ui-and-design.md) | Shared contracts, visual language, discoverability and design quality ownership |
| [02 — Tooling](02-tooling.md) | Reliable checks, framework conventions, cost and maintenance |
| [03 — Product repo](03-product-repo.md) | Feature/app boundaries, timer behavior and product quality ownership |
| [04 — Open-source contributions](04-open-source-contributions.md) | Contribution model and release readiness after baseline acceptance |

## Targeted history recovery

The reset removed custom design/token checkers, their fixtures and command wiring. Biome, TypeScript and existing tests remain; coverage formerly supplied only by the deleted checks is open for reassessment. Previous completion claims, exhaustive ledgers and trial transcripts are omitted from these plans.

Use `git show <commit>:<path>` for a specific question. Treat recovered findings as hypotheses to verify against the current checkout.

| Recovery point | Available material |
| --- | --- |
| `717e5127dc29805e52496b39a79dfd6a3d38e382` | Promoted system source, former `scripts/` checkers, plan audits, and legacy tooling/testing skills |
| `31885f069728df7d1ae15301c6cf6d113046a769` | Earlier prerequisite audit and `.agents/skills/ui-design/` |
| `1667bd12a2bef79404a893e1c60dfe8a6f945a6e` | Original implementation and skills before rearchitecture |

These commits exclude later uncommitted guidance and trials. Ignored evidence directories were already removed. Current principles and the matrix remain in the maintainer skill; maintained design studies remain with their source references.

## Handoff and cleanup

Record the current revision/working state, verified guarantees and limits, decisions requiring follow-up, and the next plan. Include the no-stage/no-commit constraint. End every phase handoff with temporary tests, fixtures, scripts, reports and docs by path, purpose, remaining consumer and retirement condition. After user verification or explicit cleanup authorization, the incoming session removes spent artifacts before continuing. Preserve accepted decisions beside their durable owner and retain only evidence still needed by a named decision.
