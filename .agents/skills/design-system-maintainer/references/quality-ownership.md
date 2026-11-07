# Code and UI quality ownership

Apply the [maintainer principles](../SKILL.md#staff-design-systems-lead) before selecting a tool. This matrix guides code and UI quality decisions throughout the rearchitecture and evolves with observed results.

## Choose the tool

Start with a concrete requirement, caller and impact of failure. Search existing components, tokens, motion profiles, utilities and checks. Try reuse and composition before expanding a shared contract. First establish the coverage and valid-case acceptance the requirement needs. Among solutions that meet that bar, choose the lowest ongoing cost at the expected usage frequency. Split requirements when they need different kinds of evidence.

### Decision matrix

The conditions below route a requirement to a solution. The cost benefit is a hypothesis to verify with the measurements in the following sections.

| Solution | Choose it when | Benefit that justifies its cost | If those conditions fail |
| --- | --- | --- | --- |
| Public API/default + TypeScript | Valid values, combinations or extension points can be encoded in the contract. | One shared definition prevents caller mistakes through the existing compile pass. Compatibility and migration effort are acceptable. | Use runtime validation and tests for runtime inputs or behavior. Use JSDoc for meaning. |
| Built-in Biome rule | The normal configuration rejects the static violation and accepts valid usage. | Fast local/CI feedback replaces repeated agent corrections and human review with upstream-maintained enforcement. | Evaluate maintained extensions or a focused custom rule for an observed static gap. |
| Custom lint rule | The invariant is repeatable, the supported analysis can express it, and existing tools miss it. | The frequency or impact of prevented mistakes justifies rule code, regression cases and upgrades. Diagnostics remain actionable and false positives acceptable. | Use types or runtime tests for their respective guarantees. Use human review for infrequent semantic decisions. Compare a standalone checker only when lint cannot access the required information. |
| Standalone checker | An important cross-file/cross-format invariant needs analysis that the existing compiler or lint tooling cannot provide adequately. | Measured coverage gains justify an extra local/CI process, parser dependencies and a named maintainer. | Consolidate with an existing tool, narrow the invariant or retain an explicit review obligation. Reassess growing exceptions and duplicate scans. |
| Public JSDoc/examples | The failure is misunderstanding prop purpose, slot content, interactivity, accessible naming or callback timing. | Colocated guidance improves caller tasks with bounded reading and authoring cost. | Strengthen types for invalid combinations or tests for behavior. Compare wording heuristics against caller outcomes. Editor-hover fixtures are retired. |
| Unit/component test | A current observable behavior, interaction or compatibility requirement needs execution, and this environment reproduces it. | Focused regression detection justifies execution and assertion maintenance with lower setup cost than a browser. Reuse Vitest and installed libraries. | Choose Chromium if real browser behavior is essential to reproduce the failure. |
| Chromium/browser test | The requirement depends on layout, resolved styles, focus, rendering or browser semantics that narrower tests cannot establish. | Preventing that concrete regression justifies browser setup, CI time and failure diagnosis. Scope the cases to the affected guarantees. | Move assertions reproducible in component tests there. Use human visual inspection for perceptual questions. |
| Agent skill | A repeated decision or guidance selection failure survives stronger APIs, docs and diagnostics, and matched fresh-agent trials show a narrowly triggered instruction helps. | Measured improvement outweighs added context, inference cost, latency, evaluation upkeep and unintended invocations. | Improve the owning artifact or retain human judgment. Keep stable repo-wide routing in `AGENTS.md`. |
| Human review/visual inspection | Meaning, design fit, promotion, architectural policy or perceived quality requires accountable judgment. | The importance and ambiguity justify reviewer effort. Automated evidence concentrates review on the remaining decisions. | Move repeatable mechanical judgments to types, lint or tests when trials demonstrate equivalent coverage at lower total cost. |

For example, prop spelling starts with Biome, allowed prop combinations with TypeScript, and useful slot guidance with JSDoc plus a caller task. Start repeat-activation coverage with a component test and actual dialog Tab containment with a browser trial. The design-system lead judges whether a new appearance merits promotion. Each can have a different owner within the same component.

## Compare candidate owners

These are cost hypotheses. Measure the relevant alternatives at their expected frequency across local edits, CI revisions and agent calls.

| Candidate | Local development time | CI time | Agent usage cost | Human review time | Maintenance, scalability and code bloat |
| --- | --- | --- | --- | --- | --- |
| Typed API/default | Compile feedback, migration | Compile pass | Contract discovery and fixes | Meaning and compatibility | Shared reach, type complexity |
| Built-in Biome | Editor/lint feedback | Lint pass | Diagnostic-driven fixes | Configuration and exceptions | Upstream upkeep, version coverage |
| Custom lint | Plugin startup and scan | Rule and regression execution | False-positive investigation | Scope and accepted cases | Rule code, parser upgrades, exceptions |
| Standalone checker | Process and graph scan | Scan and repeated invocations | Separate-tool diagnosis | Analysis limits | Dependencies, graph logic, custom conventions |
| JSDoc/examples | Authoring and reading | Relevant usage tests | Discovered context tokens | Meaning and responsibilities | Colocation benefit, duplication drift |
| Unit/component tests | Focused execution and diagnosis | Suite execution | Selection and debugging | Assertions and coverage | Fixtures and helper upkeep |
| Chromium tests | Browser startup and diagnosis | Setup, execution, retries | Browser failure analysis | Runtime assertions | Environment setup, flakiness, case growth |
| Skill/agent evaluation | Agent latency and iteration | Any scheduled evaluation | Tokens, rates, tool calls, retries | Decision scoring | Trigger precision, context growth, repeatability |
| Human/visual review | Preparation and wait | Any approval wait | Assisted preparation | Reviewer effort and re-review | Reviewer capacity and evidence quality |

Separate migration costs from recurring costs. Compare developer/reviewer minutes and monetary spend in their own units, with explicit tradeoffs. Include false-positive repair and repeated scans. Consolidate overlapping checks when the chosen owner meets the required coverage.

## Record the comparison

Record each comparison in its owning phase's evaluation log, using source references and compact observations.

| Dimension | Evidence to collect |
| --- | --- |
| Requirement and coverage | Hypothesis, candidates, bad/valid cases, detected/missed failures, false positives and diagnostics. |
| Local and CI cost | Measure separately, including setup, feedback latency, retries, duplicate scans and frequency. |
| Agent cost | Model/effort, calls, retries, reported input/cached/output tokens and actual usage cost. Give pricing source/date for estimates. |
| Human cost | Author/reviewer minutes, review rounds, ambiguity and waiting time. |
| Maintenance | Custom lines/rules/fixtures, dependencies, duplication, exception growth, consumer growth and maintainer. |
| Decision and retirement | Selected owner, rejected alternatives, tradeoffs, residual judgment, replacement trigger and cleanup paths. |

Label estimates and unknowns explicitly. Revise decisions when consumers, tools or measured costs change the tradeoffs.

## Evaluate an ownership change

State the hypothesis before implementation. For deterministic checks, run the actual contributor command on a violating case and its nearest valid case. Record diagnostics and exit status. Keep behavior regressions with their component or feature. Reuse maintained testing libraries before writing helpers.

For agent decisions, use identical prompts in separate fresh GPT-6.1 Sol Medium chats, delegation off, with isolated snapshots and comparable inputs/tools. Record actual reads, words loaded, decisions and unnecessary invocations. Repeat failures and test held-out and unrelated tasks before retaining guidance. Checker fixtures establish implementation behavior. Fresh-agent evaluations establish how agents choose and use contracts.

Every phase logs results and next actions, marks untested proposals pending and updates this model when trials reveal missing distinctions. Prune superseded guidance and checks together. Manual visual inspection uses the running dev server for affected rendering or unresolved visual questions.

End each handoff with temporary tests, fixtures, scripts, reports and docs by path, purpose, remaining consumer and retirement condition. After user verification, the next agent cleans up before starting its phase. Explicit cleanup authorization can advance retirement. Preserve current-contract regressions and transfer findings before deleting migration evidence.

