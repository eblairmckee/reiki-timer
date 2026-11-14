# Tarot Flash composition and material implementation plan

## Goal and scope

Apply the composition audit to Tarot Flash and its shared controls, then consolidate and redesign glass materials and motion by semantic purpose. Preserve the current footer layout, card workflows, authored content, timer behavior, and native accessibility contracts. Primary actions use a more opaque version of the secondary frosted material; menus and dialogs use deliberate elevated surfaces that preserve foreground hierarchy.

## Implementation sequence

| Work | Decision and owner | Acceptance |
| --- | --- | --- |
| Control contracts | Fix Dial controlled-value reconciliation and exclude unsupported Switch children. Scoped implementation agent (GPT-6.1 Sol). | Declined changes, parent updates, cancellation and disabling cannot leave the dial indicator at an uncommitted value; native activation stays single. |
| Tarot state | Extract draft/save/conflict lifetime into a feature hook; reconcile loaded records into the library collection; move schema-1 transformation to the model. Scoped implementation agent (GPT-6.1 Sol). | Late operations cannot replace a newer card; failures retain drafts; search uses newly loaded aliases; revisions and atomic storage remain intact. |
| Shared editor composition | Promote FormField and TagInput as molecules. Reuse them in Tarot and the timer where applicable. Scoped implementation agent (GPT-6.1 Sol). | Caller-owned values/actions, replaceable content, label/error associations, comma/paste/selection normalization, and independent instances remain correct. |
| File ownership | Colocate Tarot component CSS, remove stale rules/private material selectors, move ControlSurface to molecules and development gallery beside its entry. Scoped implementation agent (GPT-6.1 Sol). | Current layout is preserved; imports have no passthrough relocation wrappers; the gallery still uses the production illustration renderer. |
| Material and motion system | Trace actual surfaces and consumers, then implement semantic material/motion tokens and Textarea/Tag foundations. Root implementation with read-only inventory from GPT-6 Luna. | Menus share surface/motion roles; fields and tags share materials; button hierarchy is explicit; reduced preferences and portal rendering remain correct. |
| Failure states and references | Distinguish illustration loading/failure; synchronize product brief and data model with implemented UI. Root. | Artwork failures have an accessible fallback; documents describe footer actions, adjacent study labels and seeded aliases. |
| Integration and verification | Review changes against the turn baseline, focused tests, full declared verification, and the already-running app in the in-app browser. Root. | Test outcomes and actual rendered observations are recorded separately; no second dev server; preserve failures and report access blockers. |

## Shared contract decisions

- **FormField → molecules:** label, description, required indicator and control arrangement are reusable across timer settings and Tarot editing. Values, errors and product commands stay with callers. Timer dial clearance and related-field geometry remain feature concerns.
- **TagInput → molecules:** compose Combobox for controlled string collections, free entry and suggestions. Query/open are local interaction state. Document-tag editing provides an independent contract example; Tarot aliases and keywords are two uses in one feature, not two independent features.
- **Textarea and Tag → design-system:** native multiline editing and noninteractive chips are foundations. They reuse the system material rather than copying feature paint. Required validation applies to committed tag values, not an empty typing buffer.
- **ControlSurface → molecules:** caller-owned visibility/actions with local presentation composition; no added workflow state.
- **Keep feature-local:** card identity, correspondence interpretation, study concealment, search/filter workflow, conflict decisions, illustrations and timer commands. ButtonGroup remains the shared footer action mechanism; no generic search/footer workflow is introduced.
- **Viewport:** name the existing Tarot geometry adapter explicitly. A wider platform abstraction waits for an actual consumer requirement.

## Material and motion pass

Inventory backing, face, border, shadow, blur, ink, hover/pressed/selected states, preference fallbacks and motion at each real consumer. Use theme tokens for paints and semantic material roles; use system motion contracts for shared transitions. Keep control spring feedback, popup entry/exit, modal motion, study reveal and atmospheric motion purposeful and separate.

Button roles must express primary, secondary and liquid/tag treatments consistently inside and outside groups. Groups own arrangement, not a hidden change in visual priority. Redesign primary actions as a denser version of the secondary material and give menus a consistent readable backing. Verify contrast calculations against changed backing layers. Do not delete compatibility or dynamic tokens solely because a name search finds no consumer.

### Material hierarchy

| Role | Consumers | Contract |
| --- | --- | --- |
| Primary action | Shuffle, Save, timer playback, dialog continuation | Denser frosted face over the same backing family as secondary; supports icon and word controls. |
| Secondary action | Search opener, Edit, reverse, timer auxiliary actions | Quieter face using the same geometry and feedback; grouping never changes its priority. |
| Liquid content | Study tags, editable chips, search matches | Light translucent material; interactive instances retain their own focus and activation contracts. |
| Recessed field | Frost Input, Textarea, Select trigger, Combobox container | Shared fill, border, depth, blur and focus; feature CSS owns only content layout. Traditional Input remains supported. |
| Menu surface | Select and Combobox popups | Shared elevated backing and entry/exit motion with readable ink in portals. |
| Modal surface | Tarot recovery dialogs and timer finish dialog | Stronger separation from the page, distinct modal entry, shared elevated material family. |

CSS owns native popup/modal transitions and theme materials. Motion's shared TypeScript presets own spring-driven disclosure and reveal choreography. A feature keeps its semantic sequence, content, offsets and layout responsibility; it does not acquire a generic workflow wrapper just to share timing. Reduced-motion, reduced-transparency and forced-color states remain separate contracts.

The values live in [theme.css](../../src/components/design-system/styles/theme.css); spring and reveal timing lives in [shared/motion.ts](../../src/components/design-system/shared/motion.ts). Primary uses 60% light frost with dark ink; secondary uses 10% frost with adaptive light ink. Both use the existing shallow well. Menu opacity is 86%, dialog opacity is 93%, and the timer overview uses 94% of the same overlay pigment. These are material roles, not feature-specific paints. Legacy word-button and popup token names remain aliases.

## Verification journeys

- Tarot study → reveal → reverse → edit → save/cancel; footer actions stay at the same position across modes.
- Search opens/focuses, filters and ranks work, Escape/outside interaction dismisses, and card navigation preserves the footer.
- Editor supports long notes, tag creation/removal/paste, validation focus, storage retry and stale-version recovery.
- Timer fields, chime preview, paused action group, overview and finish dialog preserve behavior and layout.
- Compare menus, dialogs, fields, chips and grouped/standalone controls at narrow/wide viewports and ordinary/reduced motion; inspect reduced transparency and forced colors through suitable browser evidence.
- Run `bun run verify` once integrated; use focused checks while editing. A blocked browser-test server and in-app browser access are separate paths.

## Implementation and verification

- Composition, state, contract, file-ownership, artwork fallback and documentation changes are implemented. Shared controls own their material; domain workflows remain inside their features.
- Reviewed the actual app on the existing server at narrow (390 × 844) and wide (1280 × 800) viewports: Tarot study, editor, search and Select popup; timer settings, overview, Start/Pause, grouped actions and finish dialog. The initial overly dark action treatment was revised after rendered inspection. The timer was returned to setup and the browser to Tarot; no card edits were saved.
- Static checks, color ownership and the production build passed. Full verification reached the test stage, where Chromium could not start its separate server: `listen EPERM: operation not permitted ::1:23315`. The app server and in-app browser remained accessible. The permission failure was not retried or worked around.
- Updated stale primary-variant assertions and stabilized behavioral test setup/input and timer navigation synchronization. Ordinary/reduced motion, transparency, forced colors, native pointer handling and material relationships have Chromium regressions, but their automated execution remains pending the server permission. Manual rendered review does not substitute for those checks or device/assistive-technology acceptance.
- The final unit run passed all 360 tests across 37 files. Both tooling test files (52 tests) passed during the full verification attempt.

This implementation records the promotion decisions and exercises independent shared-component contracts. It is one concrete evaluation of the repository guidance, not evidence that promotion decisions are fully automated or that the guidance's cost savings have been measured.
