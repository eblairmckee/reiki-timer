# Making good design repeatable

A thought experiment in design-system ownership, repository tooling and contribution experience. Analysis dated November 7, 2026; the comparison covers the complete quality system, including code contracts, lint, scripts, testing, agent guidance and human review.

The work produced concrete improvements in component contracts, interaction behavior and ownership, with a smaller instruction library and less custom checker code. It also exposed limits: passing checks cannot certify craft, removing instructions can remove useful judgment, and the available evaluations do not establish an overall quality or monetary advantage over the original setup.

## Motivation

I started by recreating the front-end workflow I used at my previous company: a massive collection of hooks and skills covering UI and front-end best practices, and Ultracite presets. 

### The problem
My concern was that extensive agent instructions and strict linting still leave agents inclined to repeat the nearest available pattern. A nearby example may be type-correct and visually familiar while being wrong for the interaction, content or responsibility at hand. More rules alone do not explain what makes an interface well crafted, when a composition should become shared, or which decisions should change together.

The question is how to allocate the right tool for the right task. 
- stronger type safety
- stricter lint rules
- validation and unit tests
- behavior/browser tests
- agent skills
- human review

The same concern may need several of these, with different responsibilities.

### The goal

Make good design easier to reproduce and maintain, while accounting for agent effort, developer friction, execution, review, repair and upkeep. 

## Working hypotheses

1. **Put durable decisions in the code contract.** Meaningful names, supported combinations, defaults and declaration-level documentation should reduce private implementation copying and make ordinary contribution easier for humans and agents.
2. **Match enforcement to the guarantee.** Maintained compiler/lint capabilities should own reliable static checks; custom automation should address demonstrated gaps. Semantic or perceptual proxies can create work without establishing the quality they claim.
3. **Give agents focused decision guidance.** State lifetime, composition and evidence selection need more than syntax checks. Narrow skills should supply that judgment without requiring the whole historical instruction library.
4. **Make self-evaluation test the relevant failure.** Agents should inspect consumers, use the right environment and review their changes. Acceptance checks should admit multiple valid designs and expose plausible failures, rather than reward reproduction of a reference implementation.
5. **Use human review where human judgment changes the outcome.** Ask for concrete decisions about new public contracts, conflicting product intent, visual quality and acceptance. Routine implementation should proceed within established contracts; passing automation should not silently decide these judgments.
6. **Optimize total contribution cost.** Clear ownership, reusable capabilities and selective checks should reduce repeated work as the repository grows. Measure delivery, diagnosis, review and maintenance together; moving prose or a responsibility elsewhere does not make its cost disappear.

## Comparison of the complete quality system

| Concern / mechanism | Post-prerequisite baseline | Current approach | Quality, cost and remaining responsibility |
| --- | --- | --- | --- |
| **Public APIs, defaults and discovery** | Typed primitives with broad combinations; behavior often discovered through implementation or nearby callers. | Appearance-specific Button contracts, required navigation destinations, documented sizing and native/ref/cancellation behavior. The compile-only examples include eight valid uses and ten expected errors. | Unsupported combinations can fail during type checking. Meaning, compatibility and perceptible behavior still require judgment. |
| **Tokens, styling and visual craft** | Theme tokens, pigment conventions, numerical contrast checks and extensive UI guidance. | Semantic token roles, supported overrides, compatibility aliases and explicit styling ownership, supported by rendered inspection. | Names and defaults make intended use clearer. Static naming and contrast models cannot establish every composited pixel or visual quality. |
| **TypeScript and routing** | Strict TypeScript, generated routes and Router-before-React plugin order. | The same compiler foundations applied to stronger public contracts and runtime validation boundaries. | Improvements come from the contracts, not stricter compiler settings. Runtime data and production navigation still need appropriate evidence. |
| **Biome / Ultracite** | Core/React presets, Hook and accessibility checks, CSS hex ownership and platform exceptions. | Scoped import and property-naming policies, explicit union handling and test-selection rules. Blanket `noJsxPropsBind` enforcement is disabled. | Maintained rules cover supported static patterns. Import strings cannot prove architecture, and valid handlers no longer require memoization merely to satisfy lint. |
| **Color automation** | Combined literal-color and unused-token checking, with 40 recorded fixtures. | Focused CSS/script/SVG paint checking with 44 color-policy cases, including valid alternatives and diagnostic boundaries. | Coverage remains bounded: computed, cross-module and numeric renderer paints require review. The fixture counts are not equivalent coverage measures. |
| **Token liveness** | Automatic advisory detection; 101 warnings were recorded. | Investigation of actual production reads, aliases and dynamic construction. | Specialized detection and exception maintenance were removed. Investigation cost remains with the theme owner and has not been measured. |
| **Custom checking** | 558 lines of production checking code and 708 lines of probes/fixtures. | 482 production lines and 244 regression-test lines, alongside maintained lint and types. | Total custom tooling is 42.7% smaller. This includes deliberately relinquished automation; it does not imply equivalent coverage of every removed check. |
| **Unit/component and tooling tests** | 38 unit/component cases plus standalone tooling probes. | 173 unit/component cases and 52 tooling cases across 23 files. | Tests cover observable behavior, adverse ordering and checker reliability. More cases also create maintenance cost and do not establish abstraction quality. |
| **Browser, accessibility and visual evidence** | Nine browser cases across two files, emphasizing settled reduced-motion states. | 49 cases across eight files, including native interaction, ordinary-motion interruption, navigation and production styling. | Browser evidence establishes behavior DOM emulation cannot. Timing reliability, physical devices, assistive technology and perception remain limits. |
| **Commands and contributor setup** | Separate verification commands; token checking also ran inside typecheck and build. | One `verify` workflow, focused test projects and explicit browser setup. Route generation and compilation run once within that workflow. | Less duplicated work and clearer entrypoints. No hosted CI gate or hook is credited as implemented. |
| **Product architecture and reuse** | Presentation, state, domain calculations and browser resources were more entangled. | Explicit feature boundaries and reusable Choicebox, Timeline, SummaryList, CyclingAtmosphere and neutral utilities. | Independent usage demonstrated reusable contracts without relocating product meaning into shared UI. Additional boundaries still have navigation and maintenance costs. |
| **Skills and self-review** | Six skills containing 37 Markdown files. | Four focused skills, four shared references and a concise AGENTS entrypoint. Conventions have one maintained home. | Relevant skill discovery was reliable in the recorded trials. Repeated incremental quality benefit remains unproven, and the latest consolidation has not been reevaluated. |
| **Contribution workflow and accountable review** | Guidance was spread across skills, root instructions and planning material. | README/CONTRIBUTING cover setup and checks; AGENTS routes to the relevant skills and conventions. | Maintainers and the user retain decisions about compatibility, product intent, visual acceptance and release readiness. Review cost remains part of the system. |

The decision framework separates **guidance**, **verification** and **accountable judgment**. A skill can help choose a state owner, lint can check dependencies, a behavior test can expose stale completion, and the feature owner decides what should happen during refresh. These responsibilities complement one another.

## What the accumulated evidence supports

**Specific contract and behavior improvements are the strongest result.** Unsupported component combinations became expressible type errors. Summary activation and focus restoration improved. Motion and product tests exposed preference-change failures, stale navigation actions and audio continuing after departure. These are concrete repairs, rather than conclusions drawn from test counts.

**Discovery improved in some tasks without consistently reducing reading cost.** One caller exercise went from eight tool calls to six and used supported contracts more directly. Another found the intended reusable component but requested 12,623 words instead of 8,760. Those observations support particular discovery improvements, not a general efficiency claim.

**Stricter enforcement was sometimes counterproductive.** Inline and ordinary local handlers failed the inherited callback rule while memoized equivalents passed. Disabling it admitted all three valid forms while preserving the missing-Effect-dependency check. The useful criterion was the failure prevented and the valid alternatives admitted.

**Guidance efficacy remains inconclusive.** The 67 implementation trials compared guidance variants on a later codebase, rather than the complete original setup against the current repository.

| Recorded measure | Result | Interpretation |
| --- | ---: | --- |
| Original task acceptance | 58/67 | Nine original failures remain part of the record. |
| Behavior after grader/environment corrections | 67/67 | Corrections applied to unchanged implementations; this is not universal correctness. |
| Full repository verification | 46/67 | The 21 failures are not erased by isolated task passes. |
| Type checking | 67/67 | A separate diagnostic still found a runtime robustness defect. |
| Predefined source review | 61 pass; six visual inconclusive | Source review does not establish visual acceptance. |
| Relevant skill body discovered | 20/20 | Reliable discovery on these tasks, not demonstrated incremental quality. |

Equivalent linked documentation was read in 19/20 relevant runs. The combined skill catalogue and latest wording have not been evaluated. Of 104 reviewed concerns, 34 had related implementation-comparison evidence and 70 did not; that is a guidance-evidence boundary, not a percentage of missing automated coverage.

The evaluations also exposed problems in their own acceptance criteria: valid implementations failed assumptions about markup, empty status regions or visual cues. Checks need valid alternatives as well as plausible failures.

## Cost and scalability

These are source inventories, not measurements of inference cost, execution speed or labor saved. Word counts include Markdown and metadata; the experiment document itself is excluded.

| Inventory | Baseline | Current working tree |
| --- | ---: | ---: |
| Local skills | 6 | 4 |
| Skill Markdown files | 37 | 4 |
| Shared reference files | 0 | 4 |
| Skill prose | 19,487 words | 2,019 words |
| Shared reference prose | 0 words | 2,033 words |
| AGENTS | 187 words | 246 words |
| **Skills + references + AGENTS** | **19,674 words** | **4,298 words** |
| README + CONTRIBUTING | Not present | 328 words |
| **Total ongoing guidance** | **19,674 words** | **4,626 words** |
| Production checker code | 558 lines | 482 lines |
| Tooling fixtures/probes/regressions | 708 lines | 244 lines |
| **Total custom tooling code** | **1,266 lines** | **726 lines** |
| Defined runtime test cases | 47 | 274 |
| Runtime test files | 7 | 31 |

Core guidance is **78.2% smaller**, including the references. Including setup documentation, the ongoing guidance footprint is **76.5% smaller**. Custom production checking code is **13.6% smaller**; including its fixtures and regressions, custom tooling is **42.7% smaller**. None of these reductions establishes equivalent coverage or lower delivery cost by itself.

The current source defines **173 unit/component, 49 browser and 52 tooling cases**. The last recorded full pass covered **270 cases**; four subsequently added lint-policy cases have not been rerun. Recorded full test runs took approximately **23–24 seconds locally**. There is no matched baseline/current timing benchmark.

Earlier focused measurements recorded ordinary lint checks at roughly **0.21–0.33 seconds**, compiler probes at **0.43–0.75 seconds**, and color checks at **0.13–0.15 seconds**. These describe particular local runs, not current CI guarantees. Browser installation, cold starts, diagnosis and upgrade costs remain incompletely measured.

The 67 implementation trials consumed **56,216,674 input tokens**, including **53,437,056 cached tokens**, and **442,475 output tokens**. Summed implementation time was **13,592.79 seconds**, with **1,908.69 seconds** of evaluation execution and **332.96 seconds** of queue wait. Runs overlapped, so these are not project wall time. An earlier tooling pass separately recorded 549,488 aggregate tokens over 22 minutes 29 seconds; its accounting is not directly comparable. Total billed cost, migration effort and review time remain unknown.

## Aggregate assessment

The evidence supports **clearer responsibilities and specific quality improvements** across contracts, lint, custom checks, behavior tests and focused guidance. The repository carries less instructional and custom-checker material while making more intended behavior explicit.

It does **not** establish that the complete approach is consistently cheaper, that every removed mechanism has equivalent coverage, or that focused skills reliably outperform equivalent documentation. The practical result is a smaller, more deliberate quality system whose automated guarantees and remaining judgments are easier to identify.
