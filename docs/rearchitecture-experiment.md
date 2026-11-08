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
| **Public APIs, defaults and discovery** | Typed primitives and existing treatments, with broad combinations and behavior discovered partly through implementation or nearby callers. | Appearance-specific Button types, declared sizing hooks, required navigation destinations, native/ref/cancellation contracts and colocated JSDoc. Brand treatments have system-owned defaults. | Unsupported combinations can fail at compile time; callers can use supported extension points. Contract design and compatibility still require judgment and migration work. |
| **Tokens, styling and visual craft** | Theme tokens, pigment conventions, numerical contrast checks and extensive UI guidance already existed. | Theme-owned semantic colors, reference/system/component roles, supported overrides, compatibility aliases and explicit material ownership. Rendered inspection complements browser-resolved models. | Names such as `--sys-color-ink-on-glass` and `--cmp-space-button-frost-inset` expose purpose. Naming syntax and a passing contrast model cannot establish meaning, all composited pixels or aesthetic quality. |
| **TypeScript and routing** | Strict TypeScript, route generation and Router-before-React plugin order. | Same compiler/configuration foundations, applied to stronger public APIs, explicit modes, native refs, generated route parameters and runtime boundary owners. | Gains come from better contracts, not stricter compiler settings. Runtime input still requires validation; production routing fallback needs host evidence. |
| **Biome / Ultracite** | Core/React presets, Hook and accessibility syntax checks, CSS hex ownership and platform exceptions. | Retains those capabilities; adds scoped import restrictions, explicit union cases, focused-test errors and skipped-test warnings. Disables blanket `noJsxPropsBind`. | Existing passes provide additional bounded checks. Import strings do not prove transitive architecture; a nursery rule needs upgrade attention. Valid native handlers no longer require memoization merely to satisfy lint. |
| **Color automation** | `check:tokens` combined parsed literal-color ownership and advisory unused-token analysis, including aliases and renderer-specific dynamic-name handling. | `check:colors` checks recognized CSS/script/SVG paints and local constant aliases using a focused policy with ordinary regressions. | Keeps a demonstrated gap beyond hex lint. Computed/cross-module paints, numeric renderer channels and opaque aliases remain reviewed. It is not a contrast or complete provenance checker. |
| **Token liveness** | Automatic advisory warnings; the prerequisite log reports 101 warnings, with dynamic palette exceptions. | Owner-led advisory investigation of actual production reads, aliases and dynamic construction; no automatic detector. | This is deliberately less automation. It removes specialized analysis/exception upkeep while transferring investigation to the theme owner. That recurring human cost was not measured. |
| **Custom design-contract enforcement** | The prerequisite snapshot had a token analyzer and lint probe. The later `717e512` checkpoint expanded to nine scripts, including naming, documentation, CSS, motion and boundary heuristics. | Uses installed rules, source types, focused color checks and behavior evidence. Word-count rules, business-word blacklists, universal motion/blur prescriptions and a custom dependency graph are not retained. | Avoids treating proxies as semantic proof. Full indirect/CSS dependency coverage and meaningful naming remain review duties; this is not equivalent mechanical coverage of every retired fixture. |
| **Unit/component and tooling tests** | Vitest migration preserved 43 existing behaviors and added four; unit/component and browser environments were already present. Standalone probes demonstrated lint/token cases. | Colocated model, storage, resource, component and feature tests, plus a Node tooling project for valid/invalid policy regressions. | Specific failures are tested at their owner. Policy regressions guard intended diagnostics and valid alternatives; tests do not determine whether an abstraction is useful. |
| **Browser, accessibility and visual evidence** | Chromium, axe and color compositing; the suite emphasized settled reduced-motion states. | Adds normal-motion interruption, focus/Tab behavior, native scrolling, route overlap, preference changes and supported surface relationships. Fixtures use production cascade ordering and explicit native-event synchronization. | Establishes behavior DOM emulation cannot. Browser setup, timing and diagnosis are real costs; repeated suite failures show reliability is still imperfect. Device, assistive-technology and perceptual limits remain. |
| **Commands, editor and contributor setup** | Separate check/lint/typecheck/test/build commands; token checking also ran inside typecheck and build. Editor configuration still pointed at `bun test`. | One `verify` path: check, colors, build with route generation/types, then tests. Focused project commands and browser installation are explicit; the wrong editor runner setting is removed. | Avoids redundant full compiler/generator work in the main workflow. Contributors need no agent subscription or maintainer credentials. No hosted CI gate or hook is being credited as implemented. |
| **Product architecture and reuse** | Timer presentation, state, domain calculations, browser resources and feature atomic tiers were more entangled. | Explicit feature model/service/hook/screen owners; shared Choicebox, Timeline, SummaryList, CyclingAtmosphere and neutral audio/time utilities. | Independent usage demonstrated reusable contracts without moving timer meaning into shared UI. More named owners/files create navigation and API maintenance costs; semantic promotion cannot be inferred from folder names or Hook counts. |
| **Agent guidance and self-review** | Six broad skills with many rule files, plus root instructions and installed package guidance. | Four focused skills for lifetime, composition, interaction evidence and visual design; AGENTS owns agent routing/commands. Package guidance remains selective. Agents choose relevant checks, inspect callers and report limits. | Relevant skills were discovered reliably in the bounded trials. No repeated incremental quality advantage was established. The final combined catalogue and revised wording were not reevaluated. |
| **Contribution workflow and accountable review** | Most repository guidance lived in AGENTS, skills and phase records; there was no committed README or CONTRIBUTING at this baseline. | At this snapshot, README/CONTRIBUTING explain contribution and documents under `docs/` describe conventions and quality policy. | Maintainers and the user retain promotion, compatibility, product intent, brand/perception and release acceptance. These decisions are visible responsibilities, not free substitutes for guidance or checks. |

The operative decision framework separates **guidance**, **verification** and **accountable judgment**. For example, a state contract and skill help choose the resource owner, Hook lint checks dependencies, a runtime test exposes stale completion, and the feature owner decides what users should see during a refresh. No single mechanism is credited with all four decisions.

## What the accumulated evidence supports

**Concrete contract and behavior improvements are the strongest result.** Compiler probes reject unsupported frost/error combinations and navigation without destinations while accepting nearby valid uses. The summary gained native touch/keyboard activation and focus restoration. Normal-motion cases exposed and corrected preference-change and interruption failures. Product regressions exposed stale route actions, audio continuing after departure and competing native transitions; fixes live with their actual owners. These are specific before/after repairs, not an inference from test counts. Historical Phase 01–03 records preserve the cases and limits. [S2–S4]

**Source contracts improved some caller decisions, but reading cost did not consistently fall.** A Phase 01 caller exercise moved from discovering private CSS and proposing a separate dialog to using repaired public contracts; observed calls fell from eight to six. In the product reorganization exercise, a caller found the shared Choicebox directly, and an isolated implementation reused shared components in a sibling feature. However, requested reading increased from 8,760 to 12,623 words in that comparison, largely from unnecessary historical guidance. These small exercises support particular discovery improvements, not an overall agent-efficiency claim. [S2, S4]

**Stricter enforcement was sometimes counterproductive.** Ordinary inline and local native handlers failed the inherited callback rule while equivalent memoized handlers passed. Disabling that rule accepted all three valid forms without weakening the tested Effect-dependency failure. Conversely, newly enabled import, test-selection and union rules rejected demonstrated bad cases while accepting valid counterparts. The useful distinction was the guarantee and its false-positive boundary, not whether the rule was stricter. [S3, S5]

**Removing guidance without strengthening its owner was also risky.** The early UI log at `717e512` reports that a zero-prose restyling trial discarded pressure/release feedback; a later attempt reached into private material CSS. Corrective API/default/ownership work improved those results. The contemporaneous log is retained in Git, but its original ignored traces are unavailable, so it is supporting historical evidence rather than a newly reproducible efficacy score. [S1]

**The later implementation evaluations did not settle overall guidance efficacy.** The historical audit reconciled all 37 source files and 104 concerns; 34 concerns had related implementation evidence, often partial, and 70 had no direct comparison. That split concerns the guidance trials: it does not mean 70 concerns lack any lint, type or behavior-test coverage. Mechanical probes and repository regressions provide separate evidence. Across 67 fresh implementations:

| Recorded measure | Result | Interpretation |
| --- | ---: | --- |
| Original task acceptance | 58/67 | Preserve the first results. |
| Bounded behavior after documented grader/environment corrections | 67/67 | Corrections applied to unchanged outputs across conditions; this is not universal correctness. |
| Full repository verification | 46/67 | The 21 suite failures remain failures; they are not erased by isolated task passes. |
| Type checking | 67/67 | Assignability passed; a separate store diagnostic still found a genuine defect. |
| Predefined source review | 61 pass; 6 visual inconclusive | Agent review does not establish human visual acceptance. |
| Relevant skill body discovered | 20/20 | Evidence of discovery on these tasks, not a demonstrated quality advantage. |

Equivalent linked documentation was read in 19/20 relevant runs. The four skill conditions on one unrelated task did not load their candidate bodies. Broader and overlapping discovery remains untested. The control already contained substantial contracts, documentation and maintainer guidance; its successes cannot establish that scripts alone replace semantic guidance. [S5]

**The evaluation machinery needed judgment too.** Named fieldsets, empty live regions, real app styles and color/pseudo-element cues exposed invalid assumptions in graders. A receiver-dependent external store exposed a defect beyond the frozen acceptance cases. The lesson applies to tooling as a whole: a test or rule can be precise about the wrong thing, so retain original failures and calibrate against valid alternatives as well as broken examples. [S5]

## Cost and scalability

The inventories below are reproducible from Git. They are stored material and code size, not inference tokens, runtime performance or labor saved.

| Inventory | Baseline `31885f0` | Current `bddb5b4` |
| --- | ---: | ---: |
| Local skills / skill Markdown files | 6 / 37 | 4 / 4 |
| Skill prose, including metadata/examples/references | 19,487 words | 1,913 words |
| AGENTS | 187 words | 645 words |
| Total local agent instructions | 19,674 words | 2,558 words |
| README + CONTRIBUTING + conventions + quality policy | Not present at these paths | 3,532 words |
| Custom production checking code | 558 lines | 482 lines |
| Checker fixtures/probes/regressions under `scripts/` | 708 lines | 244 lines |
| All four tooling scripts, including their tests | 1,266 lines | 726 lines |

The skill and AGENTS inventory is about 87% smaller, but AGENTS itself grew and README/CONTRIBUTING plus the convention and policy documents contain 3,532 words at this snapshot. Before the owner's final cleanup, `bf1eef1` contained 4,125 instruction words including the persona and matrix. Relocating the matrix and removing personal notes must not be mistaken for a measured delivery saving. The script reduction also reflects relinquished token-liveness automation, and excludes the expanded application/browser tests.

The post-prerequisite suite recorded 47 passing tests. The later integrated application recorded 270 tests in 31 files, including 49 Chromium cases; the test stage took about 24 seconds locally. That is broader explicit regression evidence with additional maintenance and execution cost, not a quality multiplier. The final callback/dependency regression additions were not rerun under the user's stop request, so the earlier full pass is not a fresh certification of the final tree. [S1, S4, S5]

Recorded focused costs help explain mechanism selection: Phase 02 static fixtures took roughly 0.21–0.33 seconds per ordinary lint invocation, compiler probes 0.43–0.75 seconds, and color probes 0.13–0.15 seconds. Its retained lint-policy cases cost roughly 2.3–2.6 seconds, while pure color-policy cases took tens of milliseconds after startup. These are local observations at that phase, not controlled baseline/current speedups. Cold browser setup, hosted CI and long-term upgrade costs remain unknown. [S3]

The evaluation project itself was expensive and is separate from normal contribution cost. The 67 implementation runs used 56,216,674 input tokens, including 53,437,056 cached input, and 442,475 output tokens. Summed agent elapsed time was 13,592.79 seconds; evaluation execution added 1,908.69 seconds and queue wait 332.96 seconds. Runs overlapped, so these are not project wall time. These figures cover Phase 021 trials, not the entire rearchitecture. Phase 02 separately reported 549,488 aggregate session tokens over 22 minutes 29 seconds, without comparable input/cache/output allocation. Earlier migration, preparation, orchestration and review costs are incomplete; billed dollars and human review minutes are unknown. No evaluation runner is part of ordinary CI or contributor verification. [S3, S5]

## Aggregate assessment

The evidence supports **better ownership and specific quality improvements**, achieved through a combination of API design, maintained static tools, bounded custom checking, behavior evidence and human judgment. The repository now makes more intended behavior explicit and gives ordinary changes clearer owners. It also reduces custom checking and instructional surface without pretending that every removed responsibility became automated.

Evidence for lower total cost and consistently better agent or human experience is incomplete. Some caller tasks improved; others read more context. Browser checks exposed real bugs but also incurred timing and diagnosis failures. Focused skills were discoverable but did not show a repeatable aggregate advantage on the bounded tasks. No matched end-to-end study compared the complete original setup with the complete final system, and no human review-time or perceptual-quality improvement was measured.

The durable outcome is an approach to making design repeatable: put stable decisions where contributors use them, choose enforcement for the actual guarantee, provide focused guidance for semantic decisions, and bring humans concrete judgments that automation cannot settle. The supported conclusion is stronger than “we deleted skills” and narrower than “the new system is proven cheaper and better in every respect.”
