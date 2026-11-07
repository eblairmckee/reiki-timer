# Product repo v2: organize product code by concern and establish shared contracts

Make the growing Reiki product understandable from its directory structure, with clear homes for feature views, components, state, domain rules, data, browser services, hooks and utilities. Extract reusable presentation and infrastructure behind explicit contracts, preserve product behavior, and document a repository organization that contributors can apply without reconstructing this audit.

Apply the [shared purpose and session protocol](00-prerequisites.md), [maintainer role](../../.agents/skills/design-system-maintainer/SKILL.md) and [quality ownership matrix](../../.agents/skills/design-system-maintainer/references/quality-ownership.md). Start from [conventions](../conventions.md#product-organization-and-shared-component-taxonomy), then inspect affected source and consumers.

**Status and authorization:** the user authorized implementation of this revised plan on November 7, 2026, with GPT-6.1 Sol High as orchestrator and delegation as specified. The concern-based structure and contracts below are implemented; final evidence is recorded in the execution handoff. The [previous version](03-product-repo-v1.md) is preserved as history. Phase 04 follows user acceptance of the integrated baseline.

```text
/goal Execute docs/rearchitecture-goals/03-product-repo.md with GPT-6.1 Sol at High effort as the session orchestrator. Follow the shared purpose and session protocol and current authorization scope. Establish and implement the product directory structure, shared component and utility boundaries, and durable organizational conventions. Validate preserved behavior, representative contributor work and sustainable quality ownership.
```

## Goals and expected outcomes

1. **Navigable product structure.** Every existing timer file has a concern-based home. Feature UI lives in `components/` and route-level composition in `screens/`; feature folders do not contain atomic tiers. No mixed root pile of TSX, storage, audio, timing and styles remains.
2. **Explicit application and shared homes.** App startup/routing/style policy is grouped under `app/`. Shared non-UI utilities and React hooks live under `utils/` and `hooks/`, grouped by concern as needed. The root retains only deliberate bootstrap/generated framework entrypoints alongside directories.
3. **Useful shared atomic contracts.** Reusable app components use shared `atoms/`, `molecules/` and `organisms/` tiers, alongside the established design system. Molecules own no interaction/product state; organisms coordinate state/lifecycle and explicitly support their chosen controlled/uncontrolled modes. Shared components receive domain data, copy and actions from callers.
4. **Readable state and dependency boundaries.** The timer has one authoritative draft/session. Pure domain code does not depend on browser/audio implementations. Route transactions, timer state, resource lifetimes and visual composition have discoverable coordinating owners. Extraction must not create competing state or move timer semantics into generic components.
5. **Durable conventions.** Document the adopted structure, taxonomy, placement rules, dependency directions, local-helper/test/CSS colocation, naming and promotion examples in `docs/conventions.md`. Update AGENTS/README routing and affected source JSDoc to match the implemented state; label proposals until implemented.
6. **Demonstrated maintainability and behavior.** Preserve current timing, save/restore, audio, navigation, focus, accessibility, brand and reduced-motion contracts. Show that adding a preference, a shared presentation variation and a second feature reaches the expected directories with bounded changes.

Completion requires all six outcomes. Passing the existing suite or moving the existing pile wholesale into one new folder is insufficient. A hypothetical second already-shipping feature is not a prerequisite for a useful reusable contract; demonstrate a realistic independent usage and keep product meaning outside it.

This expands the earlier Phase 03 scope. The [Phase 02 handoff](02-tooling.md) obligations remain: P03-1 state/lifetime, P03-2 persistence/async recovery, P03-3 dependency/composition and P03-4 product acceptance. Directory moves and shared extractions must preserve their established guarantees and address remaining evidence gaps.

## Decisions evaluated during execution

- **Directory contracts.** Confirm the proposed roles and names below, including `model/` for domain rules, `services/` for browser I/O, `state/` for context and `utils/` for feature presentation adapters. Keep ownership clear instead of introducing parallel `lib/`, `helpers/` and `utils/` catch-alls.
- **State coordination.** Separate layout/navigation/focus choreography from the timer session lifecycle where that reduces navigation through unrelated code. Preserve the user-gesture audio preparation and the commit-after-exit timing contract. Decide the typed handoff before moving logic.
- **Promotion.** Extract neutral Choicebox, Timeline, summary-list, scene and icon responsibilities. Design a generic palette-cycling organism and URL-based audio utility against actual behavior; preserve feature-specific inputs and meaningful adapters. Resolve their exact public APIs through usage sketches and targeted evidence.
- **Quality ownership.** Put behavior tests with the new owner, retain end-to-end feature obligations, and choose static enforcement through the matrix. Types/lint cannot decide semantic reusability or atom/molecule/organism meaning from Hook counts.

## Product organization re-audit — November 7, 2026

The source inventory contains **29 timer files**, including six test files and five CSS files. Two independent GPT-6 Luna High agents traced the inventory and historical conventions; the orchestrator inspected the material sources and verified the file count. No application code was changed for this audit.

The concrete problems are:

- `timer-screen.tsx` is a 404-line layout, session controller, router transaction coordinator, persistence/audio bridge and presentation composition. Naming it a screen does not expose those concerns.
- `timer-state.ts` combines configuration parsing, session types, chakra rules, timeline generation, summary projection and generic duration formatting. It imports the chime catalogue from the same module as Web Audio resource code.
- `chimes.ts` combines product asset identity with fetch/decode/cache/playback/disposal. `scene-atmosphere.tsx` combines Reiki palettes with generic cycling state and visibility lifecycle.
- `organisms/timer-settings/` contains a **controlled feature form** with timer rules/copy. It owns IDs and a focus ref, not its config. It belongs under feature `components/` under the user's taxonomy.
- `summary/` and `icons/` sit beside route screens, storage and tests; `style.css` owns unrelated layout, HUD, countdown and saved-state styles. `SaveTimer` actually displays saved confirmation and performs no save.
- Source-level `router.ts`, `route-motion.ts` and `index.css` have app-level concerns but no app directory. Generic preference/ref hooks are hidden under design-system `shared/` despite cross-area or broadly reusable responsibilities.
- Current conventions summarized organization but omitted the explicit atomic directory tree and definitions. Recovered guidance defines atoms as focused primitives and distinguishes molecules/organisms by composition; the current user clarification explicitly adds the state-ownership rule. Do not misattribute that exact wording to the historical files.

### Implemented structure

This is the implemented concern-based structure (focused tests omitted where not shown). Each populated directory has an owner; tests and CSS stay alongside the relevant owner. `index.tsx` may be a component's actual implementation, but do not create forwarding barrels merely to conceal moves. Named implementation files are shown for easier editor/search discovery.

```text
src/
  main.tsx                          # deliberate bootstrap entrypoint
  routeTree.gen.ts                   # generated, not hand-edited
  routes/                           # TanStack file routes; thin adapters
  app/
    routing/
      router.ts
      route-motion.ts
    styles/
      global.css
  hooks/
    use-media-query.ts
    use-reduced-motion.ts
    use-composed-ref.ts
  utils/
    time/
      format-duration.ts
    audio/
      sound-player.ts
  components/
    design-system/                  # existing adapted foundation and brand internals
    atoms/
      icons/
      scene/
    molecules/
      choicebox/
      timeline/
      summary-list/
    organisms/
      cycling-atmosphere/            # neutral stateful contract, validate before extraction
  features/
    timer/
      screens/
        timer-layout/
          timer-layout.tsx
          style.css
          timer-screen.test.tsx      # whole-feature flows
          timer-navigation.test.tsx
        timer-editor/
          timer-editor.tsx
        timer-playback/
          timer-playback.tsx
          style.css
      components/
        timer-settings/
          timer-settings.tsx
          settings-field.tsx
          field-preview.tsx
          style.css
          timer-settings.test.tsx
        timer-hud/
          timer-hud.tsx
          style.css
        timer-summary/
          timer-summary.tsx          # meaningful timer-content adapter to SummaryList
        finish-timer-dialog/
          finish-timer-dialog.tsx
          style.css
        timer-saved/
          timer-saved.tsx
          style.css
      hooks/
        use-timer-session.ts
        use-chimes.ts
        use-chimes.test.tsx
      state/
        timer-context.ts
      model/
        timer-config.ts
        timer-session.ts
        timer-timeline.ts
      data/
        chakras.ts
        chakra-palettes.ts
        chimes.ts
      services/
        timer-storage.ts
        timer-storage.test.ts
      utils/
        timeline-items.tsx           # domain entries -> caller-authored Timeline content
      styles/
        session.css                 # feature session surface shared by playback/saved views
```

`model/` owns pure timer types, validation and calculations; it is not a store. `state/` owns the React context contract, not a second copy of state. `hooks/` owns React lifetimes. `services/` owns browser I/O. Feature `utils/` contains feature-specific adapters that are neither domain invariants nor components. Component-private helpers stay beside the component instead of moving automatically into a utilities directory.

### Complete timer file disposition

Original paths below are relative to `src/features/timer/`; destinations are relative to the implemented tree above. This migration ledger is an audit artifact, not a permanent second feature specification.

| Current files | Concern and proposed disposition |
| --- | --- |
| `timer-screen.tsx` | Rename/move to `screens/timer-layout/timer-layout.tsx`; keep route transitions, scene composition, focus and refs here. Move the authoritative session/clock/audio/persistence commands into `hooks/use-timer-session.ts` through an explicit prepare/commit contract. No duplicated draft in the layout/context/hook. |
| `timer-context.ts` | Move to `state/timer-context.ts`; retain route-scoped provider and useful missing-provider error. The provider consumes the single session owner. |
| `timer-editor.tsx` | Move to `screens/timer-editor/`; meaningful route/context adapter to the controlled settings component. |
| `timer-playback.tsx` | Move to `screens/timer-playback/`; retain running/complete/saved view selection and product countdown semantics. |
| `timer-hud.tsx` | Move to `components/timer-hud/`; timer mode/action meanings stay local. Existing shared ButtonGroup already owns reusable action composition. |
| `finish-timer-dialog.tsx`, `finish-timer-dialog.css` | Move together to `components/finish-timer-dialog/`; keep product copy, Save/Edit/Leave meanings, modified-link activation and focus contract. |
| `save-timer.tsx` | Rename/move to `components/timer-saved/timer-saved.tsx`; keep confirmation copy and heading focus. Receive Done action from the playback owner; do not describe it as a persistence service. |
| `organisms/timer-settings/index.tsx`, `organisms/timer-settings/style.css` | Move to `components/timer-settings/`. Colocate named Field/FieldPreview helpers there. Keep conditional cue rules, labels, dial layout and dependent-panel focus with the feature. Remove the feature `organisms/` tier. |
| `organisms/timer-settings/chime-picker.tsx` | Replace with direct use of shared `molecules/choicebox/`; caller supplies chime options, selected value, bell content and preview callback. Remove the obsolete forwarding wrapper. |
| `timer-timeline.tsx`, `timer-timeline.css` | Promote neutral list/row/marker/scroll presentation to shared `molecules/timeline/`. Move clock formatting, chakra labels, chime marker meaning and emphasized round content to feature `utils/timeline-items.tsx`; layout renders Timeline directly. |
| `summary/index.tsx`, `summary/style.css` | Move neutral animated list/item presentation and styling into shared `molecules/summary-list/`. Keep a real `components/timer-summary/` adapter that constructs warm-up/session/cooldown/repeat/chime content and accessible wording. It is not a re-export or pass-through. |
| `icons/index.tsx` | Promote reusable styled glyphs to `components/atoms/icons/`, continuing to use the system Icon. Use neutral names such as Exit/Reset where appropriate; the feature's button names decide Finish/Restart semantics. |
| `timer-scene.tsx` | Promote to `components/atoms/scene/`; it is a children surface with shared scene motion, inert exit and reduced-motion behavior, with no timer logic. Preserve keys and exit completion behavior at callers. |
| `scene-atmosphere.tsx` | Separate `data/chakra-palettes.ts` from the reusable cycling coordinator. Target shared `organisms/cycling-atmosphere/`; caller supplies palettes, interval and fixed/active selection. Validate controlled/uncontrolled cycling and mode changes before extraction; avoid a leftover wrapper that only forwards the palette prop. |
| `timer-state.ts` | Split into `model/timer-config.ts` (types/defaults/parser/cue validity), `model/timer-session.ts` (session/draft types, ready session, elapsed math) and `model/timer-timeline.ts` (phase totals, timeline/cues, current phase and summary projection). Put chakra names in `data/chakras.ts`. Move domain-neutral clock/countdown formatting to `src/utils/time/format-duration.ts`. |
| `timer-storage.ts` | Move to `services/`; keep both storage keys, migration delegation, explicit Save outcomes and best-effort tab recovery. Pure ready-session/draft definitions move to the model. Do not add a generic persistence framework. |
| `chimes.ts` | Split product catalogue/IDs/default/validation into `data/chimes.ts`, and the lazy fetch/decode/cache/cancel/dispose engine into `src/utils/audio/sound-player.ts`. The shared player accepts resolved sound sources, with no ChimeId, catalogue, feature path or product copy. |
| `use-chimes.ts`, `use-chimes.test.tsx` | Move together to feature `hooks/`; retain chime-ID-to-source mapping, user-gesture preparation, lifecycle, latest-request feedback and product error wording. The generic engine does not decide timer cues. |
| `style.css` | Split by owner: layout/header/route snapshots to layout CSS; HUD layout to HUD CSS; countdown/phase to playback CSS; confirmation to saved CSS; common `.timer-session` surface to feature `styles/session.css`. Preserve cascade layers and explicit imports. |
| `timer-state.test.ts` | Redistribute existing assertions alongside config/session/timeline models; generic duration cases move with the shared formatter. Preserve legacy migration and cue-boundary assertions; do not duplicate them across layers. |
| `chimes.test.ts` | Move generic audio resource cases beside `sound-player.ts`; retain/add feature catalogue/source mapping evidence with its owner. Update feature/browser mocks to target the new resource boundary deliberately. |
| `timer-storage.test.ts` | Move beside the storage service; preserve all current compatibility/failure cases. |
| `timer-screen.test.tsx` | Keep whole-feature flows with the layout. Move controlled settings contracts to settings tests and neutral Timeline/Choicebox/SummaryList guarantees to those shared owners. Keep product-specific chime markers/copy assertions in feature integration or adapter tests. |
| `timer-navigation.test.tsx` | Keep with the layout because it exercises real route/state coordination. Preserve Back/Forward, direct edit, interrupted exits, restoration and Strict Mode evidence. |

### Shared component and utility decisions

| Candidate | Recommendation and contract to establish | Independent usage to exercise |
| --- | --- | --- |
| Choicebox — molecule | Controlled selection; caller-provided option IDs, names/content and activation callback. Re-activating the selected option must still notify, so the timer can preview it again. Preserve current button-group semantics; do not silently replace them with radio arrow-key behavior. | Named brush presets with repeated activation. |
| Timeline — molecule | Caller-formatted leading content, stable item keys, detail/marker slots, heading/name. Own ordered-list semantics and bounded keyboard scrolling; no chakra/chime types or clock formatting. | An itinerary/activity sequence with dates and non-audio markers. |
| SummaryList — molecule | Neutral item content/keys and list naming; shared layout/entry-exit treatment. Product decides which items exist and what they mean. Reading presence/preference context is not ownership of selection/workflow state. | Document metadata with page count, tags and readable icon descriptions. |
| Scene and glyphs — atoms | Small reusable presentation contracts based on existing system motion/Icon; no product actions or state. | A non-timer confirmation surface and media controls. |
| CyclingAtmosphere — organism | Coordinate palette cycling, visibility cleanup and reduced motion; palettes/timing/content remain caller inputs. Specify controlled/uncontrolled index behavior, notifications, fixed-phase overrides and preservation/reset on mode changes before committing an API. | Theme/palette preview with both caller-controlled and internally cycled selection. |
| SoundPlayer — utility | Source-based cached audio lifecycle, synchronous gesture preparation, latest-play cancellation, fetch abort/disposal and retry. Feature resolves assets and decides when sound should play. | Two arbitrary sound URLs independent of the chime catalogue. |
| Duration formatting — utility | Explicit input units and rounding/clamping contracts for clock/countdown output. Timer domain still decides elapsed/remaining durations. | Stopwatch elapsed output and a countdown near a second boundary. |
| Media/preference/ref hooks | Promote genuinely platform/React helpers to `src/hooks/`; update system and feature imports directly. Keep frost physics, color proofs and brand motion profiles within the design system. | Existing system controls and feature compositions already span these concerns. |

A state-free component is not automatically shared: TimerSettings, TimerHud and finish/saved copy retain product meaning. Conversely, one existing product feature does not justify leaving reusable presentation undiscoverable. The organism API was resolved during execution: controlled `index` emits advance requests, uncontrolled `defaultIndex` advances internally, and `fixedIndex` temporarily overrides the display while retaining the preview position. `intervalMs` is caller-configurable with the original ten-second default. Do not force a component into a tier by adding arbitrary state.

### Source-level and dependency changes

- Move `src/router.ts` and `src/route-motion.ts` under `app/routing/`, and `src/index.css` under `app/styles/global.css`. Update `main.tsx` imports. Route animation policy is app integration, not a generic duration utility.
- Keep `src/routes/` and generated `src/routeTree.gen.ts` at their configured framework locations. Update route component imports, run route generation, and preserve direct links/history and deployment fallback requirements.
- Move `use-media-query`, `use-reduced-motion` and `use-composed-ref` to the source hooks owner. Keep `use-frost-motion`, `settle-motion-value`, ink utilities, motion profiles, theme and upstream adaptations with the design system. Do not globally reclassify established design-system components during this product migration.
- Dependency direction: app/routes → feature screens → feature components/hooks/services/model/data and shared UI. Shared organisms → molecules/atoms/design-system; molecules → atoms/design-system; shared foundations → neutral hooks/utilities. Feature model → feature data and neutral utilities. Shared hooks/utilities never import features; shared UI never imports feature types, data or commands. Check cycles and public/private imports during integration.
- `components.json` continues to target the established design-system directory. Preserve `@/` alias resolution, CSS import order and route/code-splitting behavior. Update browser tests importing palettes, audio, root styles and route motion; also update any source-reading/tool fixtures and documentation links affected by moves.

## Remediation sequence and delegation

Use the shared protocol's models and efforts. Delegate bounded work only when it can proceed independently; all agents share the checkout, so assign disjoint write ownership. No agent stages or commits. Architecture, promotion decisions, rule-removal judgments, integration and final verification remain with the orchestrator.

| Step | Expected deliverable | Delegation |
| --- | --- | --- |
| 1. Confirm current baseline and adoption decisions | Revalidate this ledger against the execution checkout. Record chosen directory/taxonomy/API decisions and any justified changes to the proposal. Preserve current staged work. Prepare before-evaluation snapshot. | Luna High may refresh file/import/CSS/fixture inventories. Orchestrator decides owners and exact scope. |
| 2. Establish shared contracts | Sketch timer and independent usage for each promotion. Resolve Choicebox repeat activation, Timeline content boundaries, SummaryList identity and CyclingAtmosphere state modes. Record compatibility and tests before implementation. | Luna High traces existing consumers/fixtures. Orchestrator owns API and classification decisions; do not parallelize competing designs. |
| 3. Move concerns with behavior intact | Move app files and feature screens/components/state/services/tests; split CSS by actual owner and update imports. Introduce the model/data separation without changing math or serialized formats. | Sol Medium may perform disjoint file moves and bounded model/data splits. One assigned owner changes routes/import wiring at a time. |
| 4. Extract neutral utilities and UI | Implement formatter/player contracts and direct shared component consumption; remove obsolete wrappers/re-exports. Implement the session hook/layout handoff as a separate reviewed change after moves settle. | Sol Medium workers can handle independent utility, molecule and organism tasks after APIs are fixed. Orchestrator owns cross-cutting layout/hook integration and lifecycle review. |
| 5. Adopt organizational conventions | Update `docs/conventions.md` with the actual tree, directory purposes, atomic/state criteria, dependency directions, naming, tests/CSS/private-helper placement, promotion and counterexamples. Update AGENTS/README to route routine work, and source JSDoc for new contracts. Remove contradictory current guidance; preserve clearly labelled history. | Luna High can check links and convention coverage. Orchestrator writes/adopts architectural policy and judges whether any rule is justified. |
| 6. Validate contribution and behavior | Run focused checks, matched fresh-agent tasks, independent usage cases, affected browser/UI checks and final verify. Resolve failures at the correct owner. Record costs, misses and remaining human judgments. | Fresh Sol Medium agents, delegation off, perform matched contributor tasks. Luna High can collect deterministic fixture results. Orchestrator integrates, judges results and runs final verification. |

Do not add global state, a generic persistence framework, blanket barrel exports, component registries or a new checker merely to populate the tree. The directory contract and extraction APIs should make routine work simpler; measure that claim rather than assuming more folders improve it.

## Outcome and evidence

- **Placement/discovery:** before/after prompts are identical, use separate fresh Sol Medium agents and comparable isolated snapshots/tools. Tasks: add a backward-compatible timer preference; change a controlled choice presentation and reuse it in an unrelated feature; find and adjust audio retry without changing chime scheduling; add a route for a second feature without importing timer internals. Include an unrelated shared Button task. Measure correct owner selection, cross-area edits, actual guidance/source reads, words/tokens, tool calls/retries, time and usage cost where available. Repeat failures and assess held-out/unrelated tasks before retaining new instructions. Do not credit the earlier discovery trial with proving this new directory structure.
- **Dependency evidence:** inspect final import directions, direct consumers, root exceptions, obsolete paths/wrappers and CSS ownership. Reuse TypeScript and current Biome first. If a mechanical gap warrants a rule, run the actual contributor command on bad and nearest-valid cases, measure false positives/maintenance and name its owner. No Hook-name heuristic can prove state responsibility or semantic reusability.
- **Behavior evidence:** preserve all current storage keys/payloads/migration, explicit save/failure/retry, clock/phase/cue math, repeat preview, cancelled async work, pause/edit/resume/restart, expiry, route transaction supersession and Strict Mode cleanup. Preserve meaningful empty/false/zero controlled values and independent instances. The session clock must start only when its pending navigation/exit is accepted; prepare audio during the user gesture.
- **Shared UI evidence:** colocated tests prove each new neutral contract with timer and unrelated inputs; feature tests prove product interpretation. Use Chromium for keyboard scrolling, native focus, inert exits, disabled controls, reduced motion/transparency, layout and route snapshots. Inspect affected running UI for brand, typography, wrapping and motion; do not introduce screenshot baselines or require user review of generated test attachments.
- **Required commands:** focused `bun run check`, `typecheck`, `test:unit` and `test:browser` as appropriate; `routes:generate` after route edits; `test:tools` if tooling changes. Finish implementation with `bun run verify` and `git diff --check`. Prior 234-test results describe the pre-remediation implementation, not the future moved/extracted one. Audit-only documentation changes use link/diff validation and reuse unaffected behavioral evidence.
- **Maintenance cost:** distinguish migration churn from recurring cost. Record new public contracts, custom code/checker/dependency costs, removed wrappers/duplicates, test ownership and added guidance. Identify device/browser/perception limits, future promotion judgments and maintainers; do not treat a passing suite as complete product acceptance.

### Completion criteria

- [x] All 29 inventoried timer files and every current loose source file have a verified disposition; the resulting tree communicates the agreed concerns.
- [x] Feature atomic tiers are removed; shared atomic tiers and utility/hook homes contain the selected reusable responsibilities.
- [x] Shared contracts have neutral types/content/actions and independent usage evidence; meaningful feature adapters remain, forwarding wrappers do not.
- [x] Domain/data/browser dependencies follow their owners, with one timer state source and preserved navigation/audio lifecycle contracts.
- [x] Tests/styles/helpers move with their owners; feature integration and browser evidence remain intact without duplicate structural assertions.
- [x] `docs/conventions.md`, AGENTS, README and source JSDoc describe the adopted repository structure consistently, with historical/proposed material clearly distinguished.
- [x] Matched contributor tasks establish discovery/decision quality for the new structure, and measured costs/limits are recorded.
- [x] Focused and full verification pass on the final implementation; affected running UI has been inspected.
- [ ] User acceptance of the revised integrated baseline is obtained before Phase 04; publication/hosted review remain separate decisions.

## Handoff and cleanup

Append implementation findings, decisions and the final handoff here. Keep enduring directory rules in conventions and contracts beside source; retire this migration ledger from routine discovery once implemented. Preserve [v1](03-product-repo-v1.md) as requested historical evidence, not active policy.

**Historical audit-only handoff (before implementation):** all 29 timer files, the source root, relevant shared helpers/consumers and targeted historical rules were inspected. This plan expands Phase 03 to include directory organization, component/utility promotion and adoption of organizational conventions. Current user taxonomy is recorded in conventions; exact target paths and extraction APIs remain proposals. Implementation is pending, and the prior acceptance request is superseded.

Only documentation changed in this audit. No application files were moved or edited. Validation accounted for all 29 files, resolved local documentation links and confirmed that v1 preserves the staged original exactly after its historical banner. `bun run verify` passed Biome (124 files), color ownership (91 sources / 0 errors), route generation, TypeScript and production build; its test stage hit local-server permission. The authorized `bun run test` retry passed **234 tests / 21 files**, including Chromium, in 22.01s with no reported unhandled errors. These results establish the current baseline, not the proposed reorganization. `git diff --check` passed and the staged diff remained unchanged. Preserve the user's staged changes; **do not stage or commit unless explicitly asked**. The next authorized implementation session starts at step 1, not Phase 04.

**Temporary artifacts requiring follow-up:** none. The preserved v1 plan is a requested durable historical record.


## Phase 03 v2 execution — November 7, 2026

**Implemented decisions.** All 29 original timer files have the dispositions in the migration ledger. The feature root contains only concern directories; its atomic tier is removed. App routing/styles, shared hooks and audio/time utilities have source-level homes; bootstrap and the generated route tree remain deliberate exceptions. CSS follows layout, HUD, playback, saved confirmation and the common session surface. Settings private helpers and focused tests are colocated; whole-feature route tests remain with the layout. Sibling plan links now point at the current source owners; v1 remains preserved history.

`useTimerSession` owns the only draft/session, clock refresh, cue boundary, audio lifecycle and storage commands. `TimerLayout` owns navigation versions/pending exit transactions, composition, scene reset and focus. `prepareStart` resumes/prepares audio during activation; `commit` assigns the running clock origin only after a route transaction is accepted. Direct history/edit reconciliation precedes the exit guard as before. Pure configuration/session/timeline models import product data and neutral helpers, not browser resource implementations. Existing storage keys, unversioned payloads, explicit Save/retry and tab recovery retain their contracts.

Choicebox owns neutral pressed-button presentation and reports repeat activation; TimerSettings constructs its catalogue options directly. Timeline takes formatted nodes, keys, detail and marker slots; feature `timelineItems` interprets timer cues and rounds. SummaryList owns list presence/layout while TimerSummary builds meaningful timer content. Scene/icons use established motion/Icon foundations with neutral Exit/Reset glyph names. CyclingAtmosphere owns controlled/uncontrolled palette lifecycle, fixed-mode overrides and hidden/reduced-motion cleanup; Chakra palettes remain feature data. SoundPlayer accepts resolved URLs; `useChimes` owns asset identity and product error feedback. No forwarding wrappers, global store, generic persistence framework, dependency or skill was added.

**Delegation and integration.** The orchestrator reused the two Luna High audit inventories, settled the APIs, and integrated the app moves and layout/session handoff. Three Sol Medium workers owned disjoint model/resource, shared-molecule and cycling-organism changes. Fresh Sol Medium agents, delegation off, assessed identical contributor tasks in isolated before/after snapshots. A further Sol Medium worker implemented bounded contributor exercises only in an isolated after copy. All writes/staging constraints were carried into assignments; no agent staged or committed.

**Contributor evidence.** Both matched assessments found the preference, audio, route and unrelated Button owners. Before, the choice task still required designing an extraction and recommended retaining a picker adapter, contrary to the revised plan’s direct-consumption outcome. After, it found the neutral Choicebox API and direct independent consumption, including empty identity/repeat activation. Before reported 7 execution calls and 8,760 requested content words (1,565 guidance); after reported 8 calls and 12,623 requested words (7,038 guidance). Search output was excluded. After unnecessarily requested the entire historical conventions inventory and its output was truncated, so actual delivered words and comparable elapsed reading time are unknown. These results support owner discovery, **not context or monetary savings**. No architecture skill or extra mandatory reference chain is justified by this pair. The unrelated Button task retained its existing system contracts and did not reach timer state.

The isolated implementation added a sibling `/practice` route and a brush screen using Choicebox, Timeline and SummaryList with independent local selection. A default-true `showPhaseName` timer preference preserved missing/invalid input fallback and explicit false through config/parser, controlled settings and playback consumers. It required no storage-service, shared-component or session/navigation implementation changes; one integration assertion enumerating settings switches also changed. Eleven source/test/generated-route files changed in that isolated exercise. Typecheck/build, 46 focused tests and final **274 tests / 33 files** passed there. Six unused-suppression warnings occurred in the Git-free copy; no blocking diagnostic remained. The exercise is evidence of extension scope, not a shipped preference/feature. It did not independently test production hosting or the new route's browser history.

**Quality owners and costs.** Existing Biome shared-component import restrictions cover the new atomic tiers. The same installed rule now covers neutral hooks/utilities and rejects imports from features or UI implementations; the ordinary lint command is exercised on four bad and two nearest-valid scope cases. The tooling suite passes 48 cases. This adds one small configuration override and one test, not a parser or extra recurring check process. Direct-import inspection found no reversed feature/UI dependencies; transitive/dynamic/CSS coupling and semantic promotion remain maintainer judgments. Public types/JSDoc and focused runtime cases own the new UI/audio contracts. Root maintainers own workflow/lint; feature maintainers own domain/storage/route behavior; the design-system lead owns shared brand, accessibility and promotion decisions.

Stored routing guidance increased from 206 to 247 words in AGENTS, 930 to 1,055 in README, and 4,755 to 5,122 in conventions. The user-required organization rules have one durable home in conventions; source contracts carry API meaning. Migration churn creates more named files while reducing mixed responsibilities, without adding packages or checkers. Actual billed tokens/cost, human-review minutes, hosted CI/cold-browser cost and statistically reliable discovery/performance savings remain unknown.

**Manual evidence and limits.** In-app inspection against the existing development server covered setup, summary/timeline expansion, running countdown, Pause, Edit/Resume/Restart controls, tone selection, native Back, finish-dialog heading focus and Leave returning to setup without saving. Typography/material/motion remain recognizable. The in-app viewport override retained a 520px layout minimum, so it does not establish a 390px device result; Chromium supplies narrow layout/native keyboard evidence. Real audio output, physical touch/zoom/safe areas, screen-reader announcements, other browser/GPU combinations and production fallback remain separate device/host evidence. Generated screenshots are debugging output, not a review gate.


**Final verification.** `bun run verify` passed Biome **150 files** (224ms), color ownership **116 files / 0 errors**, generated routes, TypeScript, production build and **270 tests / 31 files**, including **49 Chromium cases** (Vitest 24.23s). This is 36 additional cases over the 234-case starting baseline, with existing assertions relocated to their owners. `git diff --check` and current documentation links passed. Two full runs exposed intermittent native scrolling assertions in the existing summary test and the new unrelated Timeline test; a focused retry passed. Explicit document focus did not solve it and was removed. The tests now wait through focus/layout paint before issuing the native scroll key, beyond React's event flush; the final integrated run passes. This is a browser-harness synchronization change, with no product keyboard handler or animation change. Future repeated misses belong to the browser evidence owner; this run is not a statistical flake-rate guarantee.

**Final handoff.** Implementation and automated/manual validation are complete for the authorized product reorganization. The durable structure/taxonomy is in `docs/conventions.md`, with contributor routing in AGENTS/README and public contracts beside source. User acceptance of the integrated baseline remains the gate before Phase 04; device/perceptual and hosting limits above remain explicit. No staging or commits were performed; the user's index is unchanged. Phase 04, hosted enforcement, licensing and publication have not started.

**Cleanup:** the before/after contributor snapshots, isolated exercise feature/preference, dependency symlink/build output, and browser failure screenshots were retired after their findings were recorded. The requested v1 plan is preserved history. **Temporary artifacts requiring follow-up: none.**
