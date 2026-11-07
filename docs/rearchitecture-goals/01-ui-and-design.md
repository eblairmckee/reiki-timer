# UI and design: make the system teach its contracts

Start a fresh chat after the [prerequisite handoff](00-prerequisites.md#handoff) identifies a validated revision.

Carry forward the [Phase 00 cleanup](00-prerequisites.md#cleanup-after-user-verification), including the named consumers that still need the lint and test evidence.

```text
/goal Execute docs/rearchitecture-goals/01-ui-and-design.md with GPT-6 Astra at Extra High effort as the session orchestrator. Make the timer's existing UI atoms the visual baseline for the app-local design system. Audit design tokens, motion profiles and shared utilities with each promotion, and verify the timer consumes them through public APIs. Minimize UI and design skill prose, verify the naming rules and fresh-agent evaluations, and justify every retained instruction. Keep hosted human review in the post-rearchitecture plan.

Delegate independent work when it saves time or cost. Use GPT-6 Luna at High effort for inventories, reference tracing, and collecting fixture results. Use GPT-6.1 Sol at Medium effort for bounded implementation or debugging.
Run simple commands directly. Keep architecture decisions, judgments about rule removal, integration, and final verification with the orchestrator.
For before/after skill evaluations, run the same task prompts in separate fresh GPT-6.1 Sol chats at Medium effort with delegation off in both runs.
Use the in-app browser with the already running dev server for manual visual verification only when a change affects rendering or leaves an unresolved visual question. Scope inspection to the affected views and states.
Do not stage or commit any changes unless I explicitly ask. Include this constraint in the session handoff.
```

**Baseline at `1667bd1`:** `ui-design` has 1 entrypoint and 11 rule files, **12 files / 4,351 words**. Count complete Markdown files using `LC_ALL=C wc -w`. Include any successor skills. Try zero local instructions for visual design and for composition independently. If removal produces a reproducible failure, test a stronger system contract before keeping the smallest instruction that fixes it.

## Checklist

- [x] **Capture selection before edits.** In fresh chats, try an image-concept task, a composition-only extraction, a visual restyle, a request an existing slot satisfies, and a justified extension. Leave skill names out of the prompts. Record references actually opened, words read, and the design decision. Reserve paraphrases for the final evaluation.
- [x] **Assign ownership before implementation.** Work as the design-system architect. Start from a concrete caller and search existing tokens, components, parts, and slots. Try reuse, composition, and local feature ownership. Next consider a typed API or default, prop/slot JSDoc, compiler or lint rule, behavior test, visual reference, and human judgment. Record why each branch was selected or ruled out, including tradeoffs for the closest alternatives. Extend the tree only after an observed miss.
- [x] **Move the Olyx directory.** Rename `src/components/ui` to `src/components/design-system` and change `componentDir` in the fixed CLI filename `components.json`. Migrate imports, styles, tests, token tooling, and references together. Preserve the license and confirm CLI installation in a disposable fixture. Load every public entrypoint and resolve the missing stylesheet imports in `InputGroup` and `NumberField` against their intended styles.
- [x] **Name and document public contracts.** Inventory tokens, variants, motion, JSX exports and parts, props, handlers, and slots. For each migration record the old name, new name, purpose, affected callers, and required upstream names. Use the vocabulary below as the starting point.

| Surface | What the caller should learn |
| --- | --- |
| Tokens | Reference, semantic, or component scope; property and purpose; context and interaction state when meaningful. Examples: `--ref-color-pigment-garnet`, `--sys-color-action-surface-hover`, `--cmp-color-switch-thumb-fill-checked`. Cover spacing, type, radii, and shadows too. |
| Motion and variants | Name the interaction and phase consistently in CSS and TS, such as `motion.disclosure.enter`. Give independent axes distinct names, such as intent, appearance, and size. Resolve ambiguous Button modes and color-named LinkButton variants. |
| JSX exports | Name every exported component for its purpose and compound parts for their owner, as in `CollapsibleTrigger`. Check aliases and wrapped components. |
| Props, slots, handlers | Express relationships with types and defaults. Use names such as `primaryAction` and `marker`. Document locally authored public props in JSDoc. For slots describe accepted content, interactivity and accessible naming. For callbacks describe when they fire, including repeated activation. Preserve DOM, ARIA, React and Base UI contracts. |

- [x] **Check public names and documentation as they change.** Use built-in rules first. Report invalid names and missing slot documentation with nearby examples. Migrate existing names and consumers together. Exercise bad names, valid near-matches, export aliases and platform props.
- [x] **Remove prose and repeat the tasks.** Let concepts and appearance draw on tokens and visual references. Let composition draw on component contracts and behavior. Run the baseline and held-out prompts with the relevant prose removed. Log wrong reads and failed decisions, revise the owning artifact, and retry both the failed case and its closest negative. Transfer timer-specific requirements and their acceptance cases to the product handoff exactly once.

Hosted human review follows baseline acceptance and the maintainer's rollout decision. [Phase 04 rollout](04-open-source-contributions.md#hosted-review-after-baseline-acceptance)

## Promote timer atoms into design-system styles

The system establishes the visual language of the Reiki app. The timer is its first feature. A primitive takes its name from the role another feature can use, such as Button or Dial. Reiki concepts shared across features belong to the app by default. Revisit ownership when concrete callers show that the concept has a common visual or interaction contract.

The rendered timer supplies the visual baseline. Implement its reusable treatments in the app-local system configured by `components.json`. The [pre-promotion inventory](ui-evidence/public-api.md), [control material studies](../concepts/controls) and [completed migration](ui-evidence/promotion.md) trace the changes. Some treatments already live in Button, Switch or shared CSS. Reuse those owners and move the remaining reusable styling out of timer selectors.

| Source in the timer | Style the system should provide | Decisions the timer keeps |
| --- | --- | --- |
| Start/Pause play controls, Finish/Edit icons, Done, Leave without saving and the finish dialog's inline links | Button's frosted icon and text treatments, recessed well, lit face, focus, press and release. Establish standard depth and size roles and retain LinkButton's inline text treatment. | Command, glyph, accessible label, placement, navigation and when Start shows its hint. |
| Chime choice buttons and settings switches | Selected versus momentarily pressed appearance, switch track and thumb, checked and disabled states. Keep each control's native semantics. | Tone options, repeat preview, cue settings and persistence. |
| TimePicker dial | A plain `Dial` supplies the frosted face, marks, value typography, focus and drag feedback. | Duration bounds, minute formatting and how a changed value updates the session. |
| Paused playback controls and the setup summary | `ButtonGroup variant="expandable"` joins adjacent actions to a stationary primary button. `ButtonGroupSummary` attaches optional information and reveals details on hover or focus. | Which commands appear, where the group sits, and the content of the summary and timeline. |
| Fields revealed by settings switches | `CollapsiblePanel` supplies the downward reveal. An ordinary expandable section uses `CollapsibleTrigger`. A switch can control the same panel through the root's `open` prop. | Which preference is on, the switch label and the dependent fields. |
| Finish dialog | The ordinary `Dialog` parts supply the glass surface, backdrop and etched heading, with Base UI managing keyboard focus and dismissal. | Copy, button placement, commands and focus targets. |
| Timer icons and Atmosphere | Icon size, stroke and ink roles, palette tokens, background material and foreground contrast. | What each glyph means, chakra order, session timing and when the scene dims. |

- [x] **Choose and migrate the public styles.** For each row, trace the current caller and its CSS to a system component, appearance or token. Make the timer treatment the normal way to render that role. Record where it should be the default and where a named appearance is needed alongside another supported treatment. Add a component when the control has distinct semantics or behavior. Use frost as the default Button appearance and inset as a named variant. Name promoted components, props, style hooks, assets and tokens for their reusable purpose.
- [x] **Migrate the timer callers.** Use the same public styles a different feature would use. Remove duplicated material, motion and state styling from feature CSS as each caller moves. Preserve product behavior and the [timer acceptance cases](03-product-repo.md#incoming-timer-acceptance-cases). Choicebox and Timeline composition remain assigned to the product phase.
- [x] **Verify the promoted styles.** Run the checks below before declaring the baseline ready for tooling. Record the source caller, public API, state, command and result for each treatment in the UI evidence.

### Reuse audit for each promotion

1. Trace the treatment to its current owners and callers. Inspect reference scales, semantic and component tokens, CSS and JavaScript motion, and shared styles, hooks and utilities. Include scoped overrides, compatibility aliases and reduced-motion behavior.
2. Compare what should change together. Reuse an existing role first. When independent callers share appearance or behavior, put their common part in one token, stylesheet or utility. Keep the caller's layout, gesture policy and state local. For a distinct treatment, record what would break if it followed the closest existing role.
3. Prove the decision on real consumers. Exercise a shared override or behavior in two components and check the closest intentional difference. Pair each new automated rejection with an accepted case. Record owners, callers, exceptions and verification in the [reuse audit](ui-evidence/promotion.md#token-motion-and-utility-reuse).

### Quality checks and enforcement

| What must hold | How to enforce and verify it |
| --- | --- |
| Shared design and motion decisions can change together. | Use the parsed design checks for literal motion timings and material blurs. Keep paired CSS and Motion scene timings in sync with a browser test. Check shared utility behavior through its consumers, including reduced motion and cancellation where applicable. Decide whether two treatments serve the same purpose during the audit. |
| The style works outside the timer and matches the original control. | Before moving CSS, capture representative resolved values and behavior from the real timer. In Chromium, render each public treatment with unrelated content using only the system theme and component styles. Compare the relevant geometry, ink, surface and state feedback against the timer baseline. Exercise a negative case, such as making the frosted face depend on a `.timer-hud` ancestor. The isolated consumer must catch it. |
| The design system can be imported independently, and product code uses public styling hooks. | Check TS/TSX and CSS imports, including aliases and relative paths, for dependencies from the system into timer features. Extend the existing Biome or parsed design checks where a gap is demonstrated. Reject feature selectors targeting a private part, while accepting documented root properties, public slots and timer layout CSS. Pair each rejection with a valid near-match in `bun run check:design:fixtures`. Keep contract and token checks in normal typecheck and build commands. |
| Appearance preserves interaction and accessibility. | Exercise the applicable hover, press/release, keyboard focus, selected, checked and disabled states, plus reduced motion. For example, the Start face may move inside a fixed hit target, reactivating a selected chime still previews it, and dragging a dial can be cancelled. Use component tests for events and Chromium for rendered behavior. Retain named controls, axe checks and the existing numerical contrast thresholds. Use the in-app browser on the running server only for affected rendering or unresolved visual questions such as lighting and perceived depth. Record intentional visual differences. |
| A fresh caller can discover the style. | Before migration, give a fresh agent a neutral task such as composing an unrelated icon action and a selected option. Repeat the same prompt after migration in a separate GPT-6.1 Sol Medium chat, with delegation off in both. Record the imports, API choices and any copied timer CSS. If discovery fails, revise the owning API or default and retry. The earlier Start restyle runs are evidence for the original Button contract. |

Run `bun run check`, `bun run lint`, `bun run check:design:fixtures`, `bun run typecheck`, `bun run test` and `bun run build` on the integrated result. Record the failing probe and the restored passing result for each new enforcement rule. Keep these local checks in the rearchitecture; hosted human review follows the accepted baseline.

## Evaluation log

| Attempt | Guidance removed or tested → intended owner | Observed result, trace or fixture | Files / rule files / words left | Next attempt |
| --- | --- | --- | --- | --- |
| Baseline | Prop spelling → Biome | A naming-rule probe rejected `Leading_icon`, accepted `leadingIcon`, and also accepted `thing`. Vocabulary and meaning still need evaluation. | 12 / 11 / 4,351 | Compare a vocabulary check and human review on a real slot. |
| Validated start | Prior link repairs | Clean main at 31885f0 includes the prerequisite implementation. Five fresh Sol Medium chats captured selection before edits. | 12 / 11 / 4,344 | Record the [caller and design decisions](ui-evidence/design-decisions.md). |
| First zero-prose trial | Remove all visual and composition guidance independently of the prompt domain | Five matched repeats plus five held-outs. Composition found the existing slot and justified a different, narrow extension. The matched visual restyle discarded pressure/release. | 0 / 0 / 0 | Improve Button's existing appearance contract. |
| Public inset trial | Geometry → root property with original defaults | Retry found the inset and kept feedback, but still reached into the private face from feature CSS. Nearby concept and held-out restyle retained the material. | 0 / 0 / 0 | Enforce the private selector boundary and clarify face ownership on the prop. |
| Final trial | Private layers → parsed CSS check; material → component source and existing study | Both restyle prompts used the public inset and the existing feedback. The geometry test also found and corrected a browser harness layer-order mismatch. | 0 / 0 / 0 | Carry the checked APIs and evaluation results into the tooling phase. |

**Completion:** Record final counts and deltas, newly mandatory references, held-out results, and the reproducible failure supporting every residual instruction. Attach naming, entrypoint and accessibility evidence.

## Public API follow-up for outside contributors

- [x] **Verify documentation at the caller.** The initial editor probe found descriptions on `Button.appearance` and `DialogPopup`, but only signatures on `Button`, `Dial` and the four forwarded Dialog parts. Added usage guidance to those six public values. A type-correct consumer then resolved descriptions at all 31 component imports and all 31 JSX tags across the 13 families. A second probe using the installed TypeScript 7.0.2 language server confirmed the repaired hovers and preserved upstream descriptions such as `Dialog.onOpenChange`.
- [x] **Verify vocabulary at the ownership boundary.** Run the identical `DialChakraMarker` export and `--cmp-color-reiki-marker` declaration under the design-system Dial family and an app-owned molecule. The system reports two `contracts/systemName` violations. The molecule passes. Existing fixtures also reject timer-specific names on primitives, props and styling hooks. The names stay with the app or feature until real callers justify a shared UI contract for review by the design-system lead. [Paired naming fixtures](../../scripts/design-contract-fixtures.ts)

The [editor regression check](../../scripts/editor-doc-fixtures.ts) runs in `bun run check:design`, including during typecheck and build. It uses the repository's TypeScript 5.9.3 language-service dependency to check a representative consumer's import, tag, appearance, action slot, and local and inherited callbacks. A component with documentation only on its props type fails the JSX hover assertion, while the documented popup passes. The all-family inventory and native-language-server comparison were verification runs. This follow-up added zero skill instructions.

**Integrated result.** Biome check and lint, 101 design-contract fixtures, 41 token fixtures, typecheck, all 118 tests (90 unit/component and 28 Chromium), and the production build passed. The token check reported zero unused-token warnings.

## Handoff

**Phase 01 implementation and automated verification complete.** The [promotion results](ui-evidence/promotion.md) cover 13 public families, neutral naming and style ownership, isolated and product renderings, and the matched fresh consumer evaluations. The work is based on `31885f069728df7d1ae15301c6cf6d113046a769` plus the local working-tree changes. After user verification and the cleanup below, [tooling](02-tooling.md) can take its own baseline. The [public API and ownership examples](#public-api-follow-up-for-outside-contributors) are ready for the [contribution guide](04-open-source-contributions.md#what-contributingmd-must-explain).

- The pre-promotion [public API inventory](ui-evidence/public-api.md) and [token migration map](ui-evidence/tokens.md) identify old and new spellings, consumers and upstream contracts. The CLI reads components.json. Public families live under src/components/design-system/. The promotion record lists the final public names and defaults.
- Carry the [reuse audit](ui-evidence/promotion.md#token-motion-and-utility-reuse) into subsequent promotions, including discoveries made during the product phase. Hosted review still follows acceptance of the rearchitected baseline.
- [Reduction ledger](ui-evidence/reductions.md) covers every removed file. Final UI skill count is **0 files / 0 rules / 0 words**, down 4,344 words from the validated checkout and 4,351 from the planning baseline. Root instructions fell from 187 to 124 words. The retired navigation link also removed two words from the React client rule. No successor skill or mandatory visual/composition manual was added.
- [Matched and held-out decisions](ui-evidence/evaluations.md) and [per-chat reads](ui-evidence/fresh-reads.md) record five baseline, ten zero-prose and five corrective/nearby trials. Source read volume and local instruction words have different counts.
- The [initial verification record](ui-evidence/verification.md) covers the CLI install and nine Olyx entrypoints. The [promotion verification](ui-evidence/promotion.md#verification) covers the current families, tests and enforcement fixtures. Run `bun run check`, `bun run lint`, `bun run check:design:fixtures`, `bun run typecheck`, `bun run test` and `bun run build`. Typecheck and build also run the design and token checks.
- [Incoming timer acceptance cases](03-product-repo.md#incoming-timer-acceptance-cases) is the single transfer to the product owner. [Tooling](02-tooling.md) follows completion of the UI work.

**Do not stage or commit changes unless the user explicitly asks. Carry this constraint into the next chat.**

### Cleanup after user verification

**Awaiting user verification. Phase 02 owns the cleanup.** Before its first tooling trial, apply the [handoff procedure](00-prerequisites.md#cleanup-after-user-verification) to these candidates and record the disposition here.

| Candidate | What the incoming agent should do and verify |
| --- | --- |
| `test/browser/promoted-surfaces.test.tsx` | Retire the promotion-named file. Drop the duplicate group-name and repeat-activation assertions already in `src/components/design-system/button-group/button-group.test.tsx`. Move unique Chromium coverage to the owning material, group and dialog tests: a scoped frost override reaching multiple controls, the summary fold aligning with the actual trailing button, and modal Tab containment, Escape and focus return. Preserve a check for decorative Icon semantics. Compare historical pixel/ink values to the accepted tokens and retain exact values only for an intended public default. Run the family and Chromium suites. |
| `test/browser/design-entrypoints.test.tsx` | Shed the migration wording and fixed list of the original families. Preserve the Vite import smoke test for public families without a product caller, field focus/disabled styling and fixed hit-target geometry. Drop duplicate Dial formatting/keyboard assertions covered by its family tests. A broken CSS import or misplaced frost selector in a disposable copy should still fail the appropriate browser test. |
| `ui-evidence/fresh-reads.md`, `evaluations.md`, `public-api.md`, `tokens.md`, `verification.md`, `design-decisions.md`, `promotion.md`, `reductions.md` | The directory is already ignored. Remove migration traces, inventories and historical measurements after transferring any still-needed findings and fixing inbound links. Phase 03 needs the reduction totals and rationale for reconciliation. Phase 04 needs current ownership examples, which can point directly to public source and tests. Keep the control studies used by component JSDoc. Check required references against the intended tracked files. |
| Checker scripts and their fixtures | Defer changes to live enforcement to the [Phase 02 script review](02-tooling.md#review-the-permanent-checks). Record the replacement or disposition for each rule before removing its fixtures or changing which commands enforce it. |
