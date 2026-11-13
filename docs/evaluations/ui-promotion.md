# UI promotion evaluation

Date: 2026-11-12. Scope: Timer Summary molecule contract, Timer HUD extraction, planned self-review, and a fresh adversarial review. No staging or committing was performed.

**Remaining blocker:** automated browser tests cannot launch Chromium under the current macOS sandbox. Reduced-motion, rapid reversal and custom-content native focus regressions remain unverified. In-app browser access was restored, and the post-change timer journeys and responsive layout review below were completed.

## Method and limits

Two fresh GPT-6 Luna agents handled the implementation/contract tasks and self-reviews. A third fresh Luna agent reviewed source and tests without seeing their verdicts. The parent supplied integration review and final checks. These are guided implementation examples, not an A/B benchmark or evidence of measured token/cost savings.

The earlier placement-only attempts kept both feature components. This pass asked the HUD implementer to evaluate the full reusable composition with caller-controlled state; it extracted a neutral surface while retaining the useful feature adapter. The SummaryList exit defect was found after the parent challenged the interactive-content case. Neither discovery should be attributed to unaided skill invocation.

## Resulting boundaries

| Component | Decision | Responsibility |
| --- | --- | --- |
| [TimerSummary](../../src/features/timer/components/timer-summary/timer-summary.tsx) | Keep feature adapter | Timer duration formatting, repeat/chime/time wording, and domain interpretation. |
| [SummaryList](../../src/components/molecules/summary-list/index.tsx) | Reuse molecule; repair exit behavior | Caller-authored keyed items, presentation, and inert exiting content. |
| [TimerHud](../../src/features/timer/components/timer-hud/timer-hud.tsx) | Retain meaningful feature adapter | Timer mode-to-action mapping, labels/icons, callbacks and timer control refs. |
| [ControlSurface](../../src/components/organisms/control-surface/index.tsx) | Extract shared organism | Summary disclosure and adjacent action composition under one controlled visibility, inertness and motion lifecycle. |

The surface's document/media examples use different commands and vocabulary from the timer. They are executable contract examples, not a second shipping feature. Content slots accept caller-authored nodes; the primary control and actions retain their own native props/events/refs. Summary content remains noninteractive because the foundation overlays its disclosure trigger. No render callback was added: there is no new internally owned public value that a slot needs. No duplicate timer state or provider was introduced.

## Organism checklist

The implementation agent wrote its checklist before editing. The rows below retain its planned guarantees and record final evidence. Select rules using [visual design](../../.agents/skills/visual-design/SKILL.md#select-the-rules); the reusable format lives in [organism review](../../.agents/skills/ui-promotion/references/organism-review.md).

| Check and selected rule | Setup → action → expected result | Result and evidence |
| --- | --- | --- |
| Actual timer journey — [interaction](../../.agents/skills/interaction-evidence/SKILL.md) | Setup → start → pause → edit/resume/restart → finish/save; actions follow feature state. | Pass in existing timer screen unit tests and post-change in-app browser review. Focus follows Pause/Resume; finish dismissal restores Resume; save reaches Timer saved, then Done returns to setup. |
| Controlled ownership — [atomic contracts](../../.agents/skills/react-composition/rules/atomic-ui.md#organisms) | Parent hides/shows surface → inertness and accessibility state follow props, without a second workflow state. | Pass in ControlSurface unit tests. Actual route transitions remove departing controls from the accessibility tree and focus the destination action. Independent custom-control focus cases remain blocked. |
| Scope/lifetime — [React lifetime](../../.agents/skills/react-lifetime/SKILL.md) | Render document and media surfaces → open one disclosure → the other stays closed. | Pass in ControlSurface unit tests. Existing blur/outside dismissal remains authoritative; hide/show does not promise a disclosure stays open. |
| Custom content/native contracts — [composition](../../.agents/skills/react-composition/SKILL.md) | Supply custom native controls and callback fieldset ref → activate repeatedly and cancel an event → caller receives the original event and correct ref. | Pass in unit tests; no native Tab-order claim. Root props are deliberately limited to label, visibility, className and ref. |
| Summary identity and exit — [atomic contracts](../../.agents/skills/react-composition/rules/atomic-ui.md#molecules) | Reorder/update custom rows → state follows stable keys; remove a row → retained exit content becomes inert. | Pass in SummaryList unit tests; real focus exclusion is a separate browser test. |
| Layout and theme — [layout](../../.agents/skills/visual-design/rules/layout-spacing.md), [surfaces](../../.agents/skills/visual-design/rules/surfaces-theme.md) | Inspect actual backing at narrow/wide sizes → readable summary and usable, unclipped actions. | Reviewed at actual CSS viewports 391×844 and 1339×1137. No horizontal overflow; long timer summary wraps with Restart/Resume present; timeline scrolls to its last entry by keyboard. |
| Motion and focus — [motion](../../.agents/skills/visual-design/rules/motion.md) | Hide while focused, reverse before fade completes, remove custom summary control; repeat with ordinary/reduced motion. | Ordinary-motion timer transitions and destination focus observed. Exact rapid reversal, custom exit and reduced-motion regression execution remains blocked by Chromium launch permission. In-app connection offers no motion emulation. |

## Findings and repairs

- **Fixed: departing custom summary controls could remain interactive.** `aria-hidden` did not exclude descendants from native interaction during AnimatePresence retention. Added `inert` to exiting items, an attribute-level unit regression, and a separate browser focus test.
- **Fixed: browser evidence conflated focus loss with blocked refocus.** The first test attempted focus after applying inert, then checked the result. It now checks that existing focus leaves first, then separately tests blocked refocus and Tab exclusion. Browser execution is still pending.
- **Clarified: supported root API.** Independent review suggested forwarding all fieldset props. The current public contract intentionally supports only selected root props; arbitrary native root forwarding was not added. Caller-authored control nodes retain their own native APIs.
- **Taxonomy judgment remains explicit.** The reviewer preferred a molecule because disclosure state stays in the foundation. The chosen organism boundary is the coordinated visibility/interaction lifecycle across summary and action parts, even when fully controlled. A different boundary could classify the same composition as a molecule. Hook count is not evidence. The promotion decision tree could state this controlled-composition case more explicitly; the staged guidance was left unchanged.

Raw development failures: initial unit Tab expectation selected the wrong element; it was replaced by focused disclosure behavior, with native order reserved for browser tests. An outside-click hide test measured dismissal rather than parent-controlled visibility; it now rerenders the parent prop. Import/attribute ordering, a missing Ref import, a test-local component declaration, and unsupported Testing Library `exact` options were caught and corrected by checks. None were suppressed.

## Adversarial design opportunities

These distinguish observed opportunities from cases still requiring evidence:

- **Disclosure discoverability — “The deal, then reveal.”** In-app review confirmed the summary has status icons but no visible details label/chevron. Keyboard access and focus return work. A distinct disclosure cue is an improvement candidate; first-time-user discoverability has not been usability-tested.
- **Entrance feedback — motion and system status.** The surface inherits the existing 1.2-second entrance fade while controls become interactive immediately when shown. Ordinary edit/resume/restart flows settled correctly. The timeline's moving backdrop shows through strongly during entry, then becomes subdued at rest. Rapid reversal and invisible-target risk still need the authored browser cases; do not delay input just to wait for animation.
- **Content density — “Space sets the pace.”** The English summary with warmup, cooldown, repeat and chime indicators wrapped into two lines alongside Restart/Resume at 391px. The long timeline remained keyboard-scrollable. Localized content and enlarged text remain uninspected.

## Post-change in-app review

Access initially failed, then reconnected to the user's existing localhost tab. The following observations use the changed code, not the earlier pre-change review:

- Opened the summary, tabbed into the timeline, and used Escape: disclosure closed and focus returned to its trigger. Tab then reached Start; Enter started the timer and focused Pause.
- Space paused the timer. Edit focused Resume in the editor. Restart reset the countdown; a separate edit/resume cycle continued the paused remaining time instead of resetting it.
- At the narrow viewport, enabled warmup, repeat and chimes to stress summary density. Opened the longer timeline, tabbed into it, and used End to reach the final cooldown entry. Restored all three settings afterward.
- Finish focused the dialog heading. Escape dismissed it and restored Resume. Reopened Finish, saved the restored configuration, observed Timer saved with heading focus, and used Done to return to setup with Start focused.
- Restored the original browser viewport and left the timer stopped on setup: 20-minute session, 1-minute cooldown, timer visible, warmup/repeat/chimes/breakdown off.

Viewport dimensions above were measured from the rendered DOM: the browser override's requested dimensions differed from CSS pixels under its existing scaling. No horizontal document overflow was observed at either recorded size. Review used ordinary motion (`prefers-reduced-motion: reduce` was false). No application source changes were needed during this review.

## Verification

- `bun run verify`: lint, color ownership and production build/typecheck passed. Browser startup failed with macOS `MachPortRendezvousServer ... Permission denied (1100)`; this run is not a full pass.
- `bun run test:unit`: 22 files, 178 tests passed. `bun run test:tools`: 2 files, 52 tests passed. Total: 230 non-browser tests passed.
- [Browser regression cases](../../test/browser/control-surface.test.tsx): narrow viewport/custom controls, existing-focus loss, Tab exclusion, rapid hidden/show reversal under ordinary/reduced motion, and inert SummaryList removal. Authored and typechecked; not executed successfully here.
- Requested in-app browser: access restored; post-change journeys and narrow/wide appearance reviewed as recorded above. No substitute browser was used.
- Physical-device, enlarged-text, assistive-technology, reduced-motion and formal usability acceptance remain uninspected.

## Remaining verification

Run `bun run test:browser` in an environment that can launch Chromium, including the custom controls, summary exit, rapid reversal and ordinary/reduced-motion cases. Save failure/retry needs a suitable failure-injection fixture; this in-app review covered successful saving only. Leave-without-saving, localized content, enlarged text and physical-device behavior were not exercised in this pass. The observed timer journey is accepted within the scope above; the full browser suite is not a pass.
