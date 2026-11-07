# Independent audit of agent skills and decision guidance

**Status: closed.** The audit and repository integration are complete. The sections below preserve the completed plan, not a pending evaluation queue. Start with the [brief outcome](021-audit/audit.md); current contributor instructions live in [README](../../README.md), [CONTRIBUTING](../../CONTRIBUTING.md) and [conventions](../conventions.md). No further evaluations are authorized.

## What happened in Phase 02

Phase two added automated checks and contributor instructions, then assigned the harder architectural decisions to source documentation and human judgment. Its two small, read-only exercises compared existing guidance with README changes—not candidate restored skills—so they did not adequately establish that no skills should return.

## 1. Reopen the assessment and revise the matrix

The audit produced evaluated drafts in isolated copies; the user then authorized the active matrix, skills and enforcement integration. That work is complete. Recorded evaluation results and limits remain unchanged. Do not stage anything or run further tests unless the user requests them.

Revisit all sections of the 37 historical skill files at `1667bd1`, incorporating corrections from `31885f0` and `717e5127`. Treat Phase 02’s inventory as an index, while independently reassessing its conclusions. Record each distinct rule’s purpose, applicability, existing coverage, candidate guidance, and supporting evaluation.

Revise the matrix to make three complementary responsibilities explicit:

| Responsibility | Question it answers | Possible owners |
|---|---|---|
| Agent guidance | How does the agent choose an appropriate design or implementation? | AGENTS, focused skills and source declarations/examples |
| Verification | How do we detect violations or demonstrate behavior? | Types, lint, scripts, component/browser tests |
| Accountable judgment | Which product or architectural choices need an owner’s decision? | Human review, supported by agent analysis |

A concern may require all three. Classifying it as “human judgment” does not establish that an agent needs no guidance, and its recurring review cost must remain visible.

Use dispositions including **restore, simplify, merge, keep in source documentation, mechanically covered, inapplicable, and inconclusive**. Do not set a target skill count.

### Matrix design

The responsibilities above are complementary. Hook lint can reject a missing dependency while guidance helps distinguish reactive inputs from latest event values, runtime tests expose obsolete results, and the feature owner decides whether old content remains visible during refresh. An import restriction cannot choose the right molecule; a focus test cannot establish visual quality.

| Guidance owner | Use when | Comparison and remaining judgment |
| --- | --- | --- |
| Typed API/default and colocated JSDoc/examples | Meaning belongs to a particular public contract. | Check actual caller variations, semantic intent, runtime behavior and compatibility. |
| Agent instructions/routing | Agent commands, boundaries or recurring decision guidance. | AGENTS and focused skills must be sufficient without loading human contributor docs. |
| Human contributor documentation | Explain contracts, setup, checks and contribution decisions to people. | README, CONTRIBUTING and docs are human-facing references; they do not substitute for agent instructions or executable enforcement. |
| Task-triggered skill | A recurring design or evidence-selection decision needs contextual guidance. | Compare against existing guidance where a concrete efficacy or cost question remains; account for discovery, unnecessary activation and upkeep. |
| Accountable human judgment, supported by evidence | Product meaning, promotion, compatibility or perception requires a decision. | Name the owner and unresolved choice; human review and repair are costs, not a substitute for agent guidance. |

A skill need not wait for every other category to fail. Conversely, historical inclusion or a successful invocation alone does not demonstrate its benefit. Select verification separately: types/defaults for valid combinations; installed Biome for supported syntax; focused custom lint/checkers only for important observed gaps with acceptable false positives and maintenance; component tests for executable behavior; Chromium for real browser semantics/layout; direct review for perception. Do not encode semantic promotion or ownership as word counts, Hook scans or folder heuristics.

For each concern, record the exact guarantee, valid/invalid cases, frequency, owner and limits. Mechanical coverage can be partial while guidance remains necessary. The evaluation and cost requirements in sections 3–4 govern claims of benefit; they do not require a new general research project before integrating an authorized policy decision.

This design consolidates the former standalone matrix proposal without repeating the responsibilities table or evaluation protocol. The maintained policy belongs in the [active quality ownership matrix](../../.agents/skills/design-system-maintainer/references/quality-ownership.md). The audit did not compare old and new matrices, so adoption is an explicit policy decision informed by the audit, not a claim of experimentally proven matrix superiority.

## 2. Build candidates around meaningful decisions

Prioritize these previously undertested areas:

- **React state, Effects, and lifetime:** source of truth; derived state versus synchronization; event handlers versus Effects; reactive subscription inputs versus latest values; cleanup, remounts, and obsolete async results.
- **Composition and ownership:** atom/molecule/organism responsibilities; feature ownership versus shared promotion; props, children, slots, render callbacks, and compound components; coordinated state across siblings; native semantics, refs, and cancellation.
- **Interaction and verification judgment:** choosing evidence that exposes the actual failure, including focus, keyboard behavior, controlled values, async recovery, and perceptual limitations.

Also assess the remaining visual-design, TypeScript, framework-integration, performance, and skill-maintenance guidance. Keep visual-design and composition guidance independently discoverable. Preserve current repository conventions and attribution; historical examples and folder layouts are not automatically requirements.

Draft task-specific skills with clear triggers and focused references. Each retained instruction must have an identifiable decision to improve; generic advice and already-enforced syntax should not dominate the candidate.

## 3. Evaluate actual implementations

Freeze one complete repository snapshot, including current staged and relevant unstaged files. Prepare task requirements, grading criteria, and independent acceptance tests before tuning candidate guidance.

Compare three conditions with identical tasks and tools:

1. **Current baseline:** existing instructions, public contracts, and checks.
2. **Documentation alternative:** the same substantive candidate guidance placed with an appropriate existing source/documentation owner.
3. **Skill candidate:** that guidance packaged as a discoverable, task-triggered skill.

Use fresh GPT‑6.1 Sol Medium sessions, delegation off, following the shared protocol. Agents must produce working patches and run relevant checks. Capture commands, file reads, patches, failures, repairs, and available usage through a small `codex exec --json` runner; this follows the official [skill evaluation approach](https://developers.openai.com/blog/eval-skills).

Start with two implementation tasks per candidate. Require three fresh repetitions per condition for the priority Effects and composition candidates; use initial screening before expanding other families. Mixed results remain inconclusive.

Representative tasks must include:

| Task | Acceptance evidence |
|---|---|
| Extend a subscription that depends on changing inputs and callbacks | Current values, correct subscription lifetime, cleanup, remount behavior, obsolete-result handling |
| Build a coordinated composition with controls and a sibling preview | One state owner, independent instances, controlled updates, useful public contract |
| Extract a molecule used by two different feature organisms | Coherent responsibility, caller-owned business behavior, both consumers working without special-case coupling |
| Change an externally controlled disclosure or form flow | Native semantics, cancellation, focus recovery, failure/retry behavior, appropriate browser evidence |

Prompts describe desired behavior without naming the suspected mistake or prescribing the solution. Independent tests verify outcomes; blinded review evaluates architectural criteria against multiple acceptable designs.

After candidate tuning, use **two unseen transfer tasks and one unrelated task** to test generalization and unnecessary activation. Separate explicit-invocation trials from normal discovery trials so useful content and reliable triggering are measured independently.

### Transfer and screening schedule

This schedule made the plan's existing transfer, screening and unrelated-task requirements concrete; it was not a separate workstream. It was registered before the additional-stage implementations and completed after the 36 priority development runs. Candidate wording stayed at development version 1, with no tuning against transfer outcomes. The retained [input manifest](../../.audit-evidence/021/audit/evals/frozen-inputs-additional.json) records the immutable copy of all 11 tasks and four candidate packages.

| Work | Conditions and controls | Additional implementations |
| --- | --- | ---: |
| Two Effects and two composition transfer tasks | Baseline, documentation and skill | 12 |
| Interaction-evidence screening on form/disclosure | Documentation and skill; reuse the same tasks' fresh baseline controls | 4 |
| Visual-design screening on content/motion | Baseline, documentation and skill; browser geometry remains separate from perceptual judgment | 6 |
| Unrelated pure formatting task | One shared baseline, plus documentation and skill for each of the four candidates | 9 |
| **Total** | **31 additional runs; 67 unique implementations overall** | **31** |

Shared controls use identical task/model/tool inputs and count once, not as independent evidence for multiple families. Elapsed-time comparisons remain descriptive because host load and suite reliability vary. If normal discovery misses a relevant skill body, use an explicit-invocation diagnostic separately; forced invocation does not count as successful automatic discovery. No such diagnostic was needed when all relevant skill bodies were observed.

Initial screening and single-transfer success do not establish restoration efficacy. Promising differences need repeated confirmation and genuinely unseen work; later candidate revisions invalidate these tasks' held-out status. Simplification or rule-group ablation follows an established quality benefit, as required below.

## 4. Establish quality, then reduce total cost

The audit used these thresholds to claim a demonstrated improvement:

- Meeting the predefined behavioral and architectural quality bar.
- A benefit reproduced across fresh runs and confirmed on an unseen task.
- No new critical regressions in the evaluated cases.
- Evidence tied to the particular rules being recommended.

A passing existing suite is not sufficient. Conversely, one successful baseline attempt is not evidence that guidance is unnecessary.

Once quality is established, experiments may compare shorter instructions, references or removed rule groups for a concrete cost question. Do not claim that simplification preserves quality without affected-task evidence. A comparison that establishes equivalent quality and lower cost can justify the documentation owner; a demonstrated discovery or decision benefit can justify skill packaging. The authorized integration uses existing evidence and owner judgment, with unresolved benefits labeled explicitly.

Treat **agent usage, elapsed time, human review, repair work, and maintenance** as costs. Report them separately in their actual units, including first-pass failures and effort needed to reach an acceptable result. Measure human minutes where available; otherwise report outstanding review work and uncertainty rather than treating it as free.

## 5. Deliver an inspectable audit

The completed audit produced:

- A separate audit record with the revised matrix proposal and a disposition for every historical section.
- Candidate skill drafts outside active discovery, with precise restoration or simplification recommendations.
- Reproducible prompts, fixtures, grading criteria, per-run results, representative patches, and cost comparisons.
- Explicit inconclusive findings and the next experiment needed to resolve each.

Keep human-readable findings, decisions and attribution in version control. Following the user's retention request, keep the historical inventories, detailed results, evaluation tools/fixtures and manifests with the raw records in the ignored `.audit-evidence/` folder, explicitly marked as retained. The [evidence locations below](#evidence-retention) identify what is retained; routine cleanup and completion of review do not authorize its removal.

The user authorized integration after reviewing the audit and installing the four skills. The completed workflow selects current owners without claiming unmeasured benefits or targeting a particular skill count.

## Phase 021 handoff — November 7, 2026

**Coverage and findings:** all 37 historical skill files, 120 headings plus the unheaded UI workflow, [104 concerns](../../.audit-evidence/021/audit/historical-rule-register.md) and removed checker responsibilities are reconciled. Implementation trials touch 34 concerns, often partially; 70 have no direct implementation comparison. Ownership decisions do not imply every convention was evaluated. The [67 implementation trials](../../.audit-evidence/021/audit/evals/results/README.md) compare baseline, documentation and skill guidance, with transfer and unrelated work. Original acceptance was 58/67; four documented grader/environment corrections on unchanged outputs yielded 67/67 bounded behavioral passes. Full verification passed 46/67; source review passed 61 cases with six visual judgments inconclusive. A separate store-receiver diagnostic found a real robustness gap. These counts do not establish universal correctness or a repeatable incremental skill benefit. The baseline already had substantial guidance, so it cannot establish that lint replaces skills.

**Final repository decisions:** human documentation and agent instructions are separate. AGENTS and skills contain the agent workflow and relevant conventions; README, CONTRIBUTING and docs explain them to humans. Types/configuration/scripts/tests enforce applicable mechanical guarantees for both audiences. The [active matrix](../../.agents/skills/design-system-maintainer/references/quality-ownership.md) selects guidance, verification and accountable judgment independently. Four focused skills cover React lifetime, composition, interaction evidence and visual design; the maintainer role owns architecture/policy. They incorporate observed receiver/store identity, unsupported-prop and grader-assumption findings. This is an authorized adoption informed by evidence, not a claim that the revised matrix or wording won an experiment. The [104-concern/C1–C3 mapping](../../.audit-evidence/021/integration/ownership-decisions.json) preserves every original evidence limit and identifies current owners.

**Contributor workflow and cost:** AGENTS routes directly to self-contained skills and declared checks. README covers human onboarding; CONTRIBUTING explains checks and handoff; conventions are the current human contract reference. Agents no longer depend on those human documents. Historical inventories and unresolved audit questions no longer sit in routine guidance. Types, installed lint, color checking and existing unit/browser/tooling projects remain the verification path; the existing `verify` script already avoids duplicate compilation and route generation, so it was retained. The previously exercised native-handler and Effect-dependency probes are now ordinary policy regression cases. No new scanner, dependency, model evaluation command or CI stage was added. Blanket callback memoization stays disabled. General syntax/optimization skills, word-count/domain-word/Hook heuristics and a blocking unused-token checker were not restored.

**Measured audit cost:** the 67 runs used 56,216,674 input tokens (53,437,056 cached, included in input) and 442,475 output tokens; summed agent time was 13,592.79 seconds, evaluator time 1,908.69 seconds and queue wait 332.96 seconds. These overlapping sums are not wall time. Root, inventory, review and preparation were incompletely instrumented; billing and human review minutes are unknown. Broad document reads were common. The consolidation separates audiences, removes historical inventory from current guidance and routes agents to relevant skills. Actual task token/time savings were not measured.

**Remaining judgment:** feature/system owners decide product semantics, promotion and compatibility. Human brand/comfort/assistive-technology acceptance, computed color provenance, token liveness, deployment fallback and performance benefits retain their specific evidence needs. These are standing ownership responsibilities, not an unfinished general evaluation project. Optional experiment designs were moved to retained evidence.

**Closeout verification:** sources, configured commands, historical probe sources, owner mappings and Markdown references were reviewed; focused formatting/lint and whitespace checks cover the added regression source. No tests or model evaluations were run during closeout, honoring the user's stop request. The new regression cases have not been executed as part of this suite. The earlier audit's full `verify` passed 270 tests in 31 files plus lint, types, build and color policy; that result predates later skill/configuration edits and is not a passing result for the final tree. The [original validation record](../../.audit-evidence/021/audit/evals/results/validation.json) remains intact. The assistant made working-tree changes only, with no staging or commits; the user manages staging.

### Skill provenance

These four skills were evaluated as isolated drafts, then moved by the user into `.agents/skills/`. The [brief outcome](021-audit/audit.md) summarizes the findings; the full report is retained under `closeout/before/docs/rearchitecture-goals/021-audit/audit.md` (relative to `.audit-evidence/021/`). The [result tables](../../.audit-evidence/021/audit/evals/results/README.md) preserve evaluation details; installation does not change those historical findings.

| Skill | Historical sources and intent | Current owner to preserve |
| --- | --- | --- |
| [react-lifetime](../../.agents/skills/react-lifetime/SKILL.md) | react-best-practices/state; effects-and-initialization; applicable async/client/rerenders clauses | Feature state/service contracts, React APIs and current public-state conventions |
| [react-composition](../../.agents/skills/react-composition/SKILL.md) | ui-design/composition and component-organization; react-best-practices/component-types and state | Current product taxonomy, typed public APIs and real callers |
| [interaction-evidence](../../.agents/skills/interaction-evidence/SKILL.md) | testing/accessibility, behavior-tests, forms and validation; UI navigation/input | Existing component/browser tests and contributor workflow |
| [visual-design](../../.agents/skills/visual-design/SKILL.md) | UI atmosphere, foreground, layout/content, styling, media/fonts, motion, navigation/input and typography | Existing theme, materials, public contracts and design studies |

The original React entrypoint at `1667bd1` attributes imported guidance to Vercel under MIT. These compact skills are newly worded decision guidance with no copied code or performance impact estimates; retain that historical attribution here. Any future verbatim source import must retain the actual upstream license/attribution. The UI composition source cites Brad Frost's Atomic Design; the repository's current responsibility-based taxonomy governs placement. Corrected material at `31885f0` and `717e5127` supplies the recovered sources; obsolete pastel-preservation instructions are not reinstated.

TypeScript and framework details remain with installed types, runtime boundary owners and package guidance; the audit does not establish an additional general skill benefit for them. Performance recipes remain conditional on an observed workload. Skill-authoring material was assessed against the available skill-creator and maintainer workflows rather than copied into another general skill. The retained [historical inventory](../../.audit-evidence/021/audit/historical-inventory.md) accounts for every section.

### Evidence retention

This section is the retained-evidence index. The repository-root `.audit-evidence/` directory is ignored by Git and excluded from routine cleanup, including after review. Retirement requires an explicit user instruction identifying the material. Git ignore is not a backup; a fresh checkout needs the retained files from their owner.

| Path relative to the repository root | Contents |
| --- | --- |
| `.audit-evidence/021/audit/` | Historical inventories/register, evaluation JSON, Python tools, fixtures, detailed results and manifests. |
| `.audit-evidence/021/session/` | The original `/private/tmp/reiki-skill-audit-20261107/` directory, moved intact: trial workspaces, raw traces, logs and setup/replay material. |
| `.audit-evidence/021/results/` | All 67 implementation patches and selected original failures. |
| `.audit-evidence/021/snapshots/` | Exact frozen replay archives; use the retained `audit/evals/README.md` instructions. |
| `.audit-evidence/021/integration/` | Current 104-concern/C1–C3 ownership mapping and reviewed guidance changes, separate from original trial outcomes. |
| `.audit-evidence/021/closeout/` | Exact pre-consolidation documents, including the full audit report, original conventions/source provenance and optional future-experiment notes; manifest records their original paths and hashes. Also holds the closeout diff/review records. |
| `.audit-evidence/021/retention-manifest.json` | Relocation and integrity records. |

Snapshot Markdown links are interpreted from the original repository path recorded in `closeout/before-manifest.json`. Original raw records retain their historical temporary paths; translate that prefix to the retained `session/` directory. All 35 generated browser artifact directories and 24 preview entry files removed before the retention request remain removed; preview servers and the browser tab are closed. No other temporary artifact requires follow-up.
