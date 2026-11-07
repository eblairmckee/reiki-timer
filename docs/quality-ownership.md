# Code and UI quality ownership

Use this policy when choosing enforcement or changing guidance. Routine implementation starts with the affected source contract and [agent task skills](../../../../AGENTS.md#task-skills). This policy is agent guidance; human contributors use their separate documentation.

## Choose guidance, verification and judgment separately

| Responsibility | Choose an owner |
| --- | --- |
| Guidance: how to choose a state owner, API, composition or evidence | Public declarations/defaults/examples for a particular contract; AGENTS for agent commands and repository boundaries; a focused skill for recurring decisions across contracts. Human docs explain these contracts to contributors without becoming agent dependencies. |
| Verification: which violations can be rejected | TypeScript, installed Biome, a justified focused checker, or behavior tests in an appropriate environment. |
| Accountable judgment: which decisions remain | The feature/system maintainer owns meaning, compatibility and architecture; the user owns conflicting product intent, acceptance and release authority. |

A concern can need all three. Hook lint cannot choose an Effect's purpose, import restrictions cannot choose a molecule, and a keyboard test cannot establish visual quality. A skill need not wait for automation to fail. Historical inclusion or successful discovery alone does not prove that instructions improve decisions. Keep one owner per rule and link to it rather than duplicating it.

## Select verification for the actual guarantee

| Mechanism | Guarantee and limit |
| --- | --- |
| Public API/default + TypeScript | Assignability, native/ref types, modes and expressible exhaustive handling. Runtime input and semantic ownership still need their own contracts. |
| Installed Biome | Supported syntax, Hook rules and configured naming/import/test policy. Import strings do not establish transitive ownership; syntax does not establish meaning. |
| Focused custom checker | An important observed static gap that maintained tooling cannot adequately express. State supported syntax, nearest valid cases, severity and upkeep; prefer an existing pass. |
| Unit/component tests | Observable behavior and adverse ordering reproducible in that environment. Avoid grading a preferred implementation shape; DOM emulation cannot establish real Tab behavior or layout. |
| Browser tests | Native focus/events, resolved CSS, layout and affected preferences. Include actual app styles and permitted cues; account for browser setup, timing and diagnosis. |
| Rendered/human review | Brand, hierarchy, legibility, motion comfort and unresolved product/architecture choices. State inspected conditions and remaining devices/assistive technology; axe and numerical colors do not certify perception. |

Use [declared checks](../../../../AGENTS.md#checks-and-frameworks), with focused work before complete verification. Separate failures, missing evidence, environment limits and accepted exceptions. Honor the user's execution constraints.

## Current repository decisions

| Concern | Guidance and contract owner | Enforcement and remaining judgment |
| --- | --- | --- |
| State, Effects and async lifetime | [React lifetime](../../react-lifetime/SKILL.md); feature hooks/models/services. | Hook lint and types for their static scope; behavior evidence for cleanup, obsolete work, receivers and replacement identity. Source of truth, persistence and refresh semantics remain explicit decisions. |
| Composition and promotion | [React composition](../../react-composition/SKILL.md); public APIs and the classification/promotion criteria in that skill. | Types, configured import restrictions and consumer/native/ref tests. Neutral API + current consumer + independent usage example; no two-shipping-feature prerequisite or Hook-count classifier. |
| Public naming, documentation and styling | Declaration JSDoc/examples and supported extension contracts. | Installed syntax/type checks; maintainer judgment for meaning and compatibility. No word-count, business-word, private-selector or universal motion/blur heuristics. |
| Types and runtime data | Public/domain declarations, validators and service contracts. | Strict TypeScript, explicit union cases and runtime validation/tests. Casts do not validate input. No extra general TypeScript syntax skill. |
| Focus, forms and interaction | [Interaction evidence](../../interaction-evidence/SKILL.md); native/library and feature feedback contracts. | Relevant component/Chromium tests and supplementary axe. Names/ARIA alone do not prove operation; required announcements and uninspected assistive technology remain explicit. |
| Brand, typography, layout and motion | [Visual design](../../visual-design/SKILL.md); system theme/materials and feature content. | Browser geometry/preferences/interruption evidence plus rendered review. Real stylesheet/cascade and color/pseudo-element cues matter. Human perception and exact product styling remain owned judgments. |
| Static color ownership | [Theme declarations](../../../../src/components/design-system/styles/theme.css), semantic references and visual-design guidance. | Keep `scripts/check-colors.ts`, `color-policy.ts` and valid/invalid regressions. Computed/cross-module paints, numeric renderer channels and opaque aliases need review; contrast and token liveness are not certified. |
| Unused tokens | Theme/consumer owner traces production reads, aliases and dynamic construction. | Advisory investigation. No blocking liveness checker or deletion from an unused-name search alone. |
| Performance and resources | Affected workload/source owner and relevant lifetime/visual guidance. | Measure relevant loading/render/input cost while preserving behavior. `noJsxPropsBind` stays off; identity needs a real contract or measured case. No blanket memoization, barrel ban or recipe skill. |
| Routing and frameworks | Installed declarations, scoped package guidance and navigation owner. | Route generation, typecheck/build and affected navigation behavior. Hosting fallback requires host evidence. No new optional dependency merely to fit an example. |
| Conditional techniques | Owner of a real applicable feature. | Server/RSC/Next/SWR examples remain inapplicable as written. Client Activity, resource hints, script ordering and Intl remain conditional options. |
| Guidance upkeep | Owning skill/source, maintainer role and AGENTS; human explanations are maintained separately. | Metadata, links, commands, applicability and attribution review. Fresh task comparisons answer a concrete efficacy/discovery question when authorized; they are not a gate on every edit. |
| Check reliability | Configured rule/test/checker owner. | Keep `lint-policy.test.ts` and `color-policy.test.ts`, including the callback/dependency cases retained from the audit. Use nearby valid designs and plausible failures; preserve original failures when correcting a grader. |

These decisions account for the removed design-contract, token and checker-fixture responsibilities. The [retained 104-concern mapping](../../../../.audit-evidence/021/integration/ownership-decisions.json) records each disposition and evidence limit. Assigned ownership is not a claim of complete automation or demonstrated skill efficacy.

## Evidence, cost and revision

Establish the required quality before optimizing cost. An enforcement change needs a violating and nearby valid case through the ordinary command when execution is authorized. Prefer installed tooling and existing tests over a new parser, scanner or process. Retain sound automation; remove or narrow an overlapping mechanism when its replacement meets the required cases at lower cost.

For a concrete guidance question, compare the current baseline, equivalent documentation and a focused skill on matched fresh tasks. Separate normal discovery from forced invocation. A repeated quality claim needs unseen and nearby unrelated work. Record original decisions, reads, first failures and repairs. Ceiling or mixed results remain inconclusive; an authorized policy adoption is not experimental proof. No new evaluation is required merely to keep an accepted skill active.

Account for input/cached/output usage, elapsed time, local/CI execution, setup, review, repair and maintenance. Cached tokens are part of input; unknown billing and human time are unknown, not zero. Include required references and repeated scans. Shorter stored text is not a measured saving in actual task cost.

Keep current decisions at their source owner. Historical results belong in the phase record and retained evidence. The ignored `.audit-evidence/` directory is excluded from routine cleanup, even after review; its `.audit-evidence/021/retention-manifest.json` records locations and original paths. Do not stage, commit, publish or activate hosted reviews without authorization.
