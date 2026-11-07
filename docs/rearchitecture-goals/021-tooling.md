# Independent audit of agent skills and decision guidance

## What happened in Phase 02

Phase two added automated checks and contributor instructions, then assigned the harder architectural decisions to source documentation and human judgment. Its two small, read-only exercises compared existing guidance with README changes—not candidate restored skills—so they did not adequately establish that no skills should return.

## 1. Reopen the assessment and revise the matrix

Conduct a separate audit, with **evaluated drafts and recommendations as its deliverable**. Keep application code and active instructions unchanged during that audit; use isolated copies for implementation experiments.

Revisit all sections of the 37 historical skill files at `1667bd1`, incorporating corrections from `31885f0` and `717e5127`. Treat Phase 02’s inventory as an index, while independently reassessing its conclusions. Record each distinct rule’s purpose, applicability, existing coverage, candidate guidance, and supporting evaluation.

Revise the matrix to make three complementary responsibilities explicit:

| Responsibility | Question it answers | Possible owners |
|---|---|---|
| Agent guidance | How does the agent choose an appropriate design or implementation? | Skills, source examples, public documentation |
| Verification | How do we detect violations or demonstrate behavior? | Types, lint, scripts, component/browser tests |
| Accountable judgment | Which product or architectural choices need an owner’s decision? | Human review, supported by agent analysis |

A concern may require all three. Classifying it as “human judgment” does not establish that an agent needs no guidance, and its recurring review cost must remain visible.

Use dispositions including **restore, simplify, merge, keep in source documentation, mechanically covered, inapplicable, and inconclusive**. Do not set a target skill count.

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

## 4. Establish quality, then reduce total cost

A recommendation requires:

- Meeting the predefined behavioral and architectural quality bar.
- A benefit reproduced across fresh runs and confirmed on an unseen task.
- No new critical regressions in the evaluated cases.
- Evidence tied to the particular rules being recommended.

A passing existing suite is not sufficient. Conversely, one successful baseline attempt is not evidence that guidance is unnecessary.

Once quality is established, shorten instructions, adjust references, and remove rule groups experimentally. Re-run affected tasks to verify that simplification preserves the quality bar. If source documentation achieves equivalent results, recommend that owner; if the skill improves discovery or decisions, retain that benefit.

Treat **agent usage, elapsed time, human review, repair work, and maintenance** as costs. Report them separately in their actual units, including first-pass failures and effort needed to reach an acceptable result. Measure human minutes where available; otherwise report outstanding review work and uncertainty rather than treating it as free.

## 5. Deliver an inspectable audit

Produce:

- A separate audit record with the revised matrix proposal and a disposition for every historical section.
- Candidate skill drafts outside active discovery, with precise restoration or simplification recommendations.
- Reproducible prompts, fixtures, grading criteria, per-run results, representative patches, and cost comparisons.
- Explicit inconclusive findings and the next experiment needed to resolve each.

Keep reusable evaluation fixtures and summarized evidence. Retain raw traces through review, then retire disposable copies and debugging artifacts under the cleanup protocol.

Activation remains a later decision. This audit succeeds by identifying reliable, economical guidance—not by maximizing or minimizing the number of skills.
