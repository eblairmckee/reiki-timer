# Quality conventions

Use these conventions when choosing enforcement, changing checks, investigating tokens or optimizing a workload. Domain decisions live in the relevant task skill; source declarations and defaults define individual contracts.

## Choosing enforcement

Name the concrete failure and required guarantee before choosing a mechanism. Inspect the affected consumers and existing enforcement. Select these responsibilities independently:

| Responsibility | Suitable owner |
| --- | --- |
| Guidance: how to make the decision | Focused skills and supporting references for conventions; public declarations/defaults/examples for a specific contract; AGENTS for task routing and essential working constraints. |
| Verification: what can reject the failure | TypeScript for expressible contracts; installed Biome for supported static patterns; a justified focused checker for an observed gap; behavior tests in an environment that can establish the requirement. |
| Accountable judgment: what remains undecided | The feature/system owner for meaning, compatibility and architecture; the user for conflicting product intent, perceptual acceptance and release authority. |

A concern can need all three. Hook lint cannot choose an Effect's purpose; import restrictions cannot classify a molecule; a keyboard test cannot establish visual quality. Review does not eliminate the need for decision guidance. A skill need not wait for automation to fail, and successful discovery alone does not establish its benefit.

Public APIs and source comments own individual semantics. The existing lifetime, composition, interaction and visual skills own their domain decisions; do not duplicate those instructions into a new general policy skill. Before adopting a mechanism, state its supported scope, nearest valid alternatives, residual judgment and ongoing cost.

## Static rules and custom checkers

Prefer maintained rules and existing passes. The configured Biome policies cover direct import restrictions, property-name syntax, supported Hook rules, explicit union cases and test-selection policy. Focused tests are errors; skipped tests remain visible warnings. TypeScript owns assignability and expressible exhaustive handling. Neither tool establishes semantic ownership or runtime validity.

Add custom checking only for a concrete important gap that existing tooling cannot adequately express. Account for parsing, aliases, exceptions, diagnostics, severity and upgrades. Retain useful coverage; remove or narrow a mechanism when its replacement meets the required cases at lower cost, making unsupported portions explicit.

Do not use JSDoc word counts, business-word blacklists, Hook-count classification, universal private-selector rules or blanket timing/blur requirements as substitutes for meaning. Public naming, styling compatibility, useful abstraction and what should change together remain contract-owner decisions.

## Color and token ownership

Keep the bounded [color checker](../../scripts/check-colors.ts), its [policy](../../scripts/color-policy.ts) and valid/invalid regressions. It covers recognized CSS/script/SVG paints and local constant aliases beyond Biome's CSS hex rule. Unsupported XML fails visibly. Computed/cross-module paints, numeric renderer channels and opaque aliases require source/runtime review. Static ownership does not establish perceptual contrast or complete runtime provenance.

Unused-token investigation is advisory and belongs to the theme/consumer owner. Trace production reads, aliases and dynamic construction before removing a token. No blocking liveness checker or deletion based solely on an unused-name search is selected. Theme/material contracts and the visual skill own valid semantic references and rendering exceptions.

## Performance and resources

Optimize a real workload while preserving behavior. Measure the relevant loading, render, input or GPU cost before adding an optimization recipe or architectural churn. Callback identity needs a real contract or measured case; `noJsxPropsBind` stays off. Avoid blanket memoization, subpath-import mandates, barrel bans and package replacement.

Load resources according to the view's needs, avoid unnecessary waterfalls and keep nonurgent work from delaying required feedback. Caches need explicit lifetime and invalidation. Resource hints, script ordering, client Activity and Intl are conditional techniques, not mandatory or prohibited recipes. Framework applicability follows installed capabilities.

## Check reliability

When execution is authorized, exercise a new enforcement rule through its ordinary command with a violating and nearby valid case. Keep useful policy regressions in `scripts/lint-policy.test.ts` and `scripts/color-policy.test.ts`; preserve severity and diagnostics without repeating whole-project scans.

Assert observable requirements rather than a preferred implementation shape. Calibrate consequential acceptance checks against valid alternatives as well as plausible failures. Preserve original failures when correcting a grader; distinguish a corrected test/environment from a repaired implementation. A passing case does not establish uncovered behavior.

## Costs and remaining judgment

Establish required quality before optimizing cost. Compare implementation/migration, context reads, local/CI execution, diagnosis, review/repair and ongoing upkeep. Include required references and repeated scans. Cached input is part of input; unknown billing or review time is unknown, not zero. Stored word counts alone are not measured task savings.

Bring unresolved product intent, consequential public-contract choices and visual acceptance to the accountable owner with concrete options and evidence. Continue routine work within established contracts. State the limits of browser samples, numerical colors, axe, physical devices and assistive technology; review is neither free nor already passed.

Record accepted decisions beside their owner. Assigning every concern an owner does not establish complete automation or skill efficacy. For a specific guidance-efficacy question, use [guidance maintenance](guidance-maintenance.md#validation-and-efficacy); another evaluation project is not a prerequisite to an authorized policy decision.
