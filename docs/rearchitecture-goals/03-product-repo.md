# Product repo: make the timer a clear design-system consumer

Start a fresh chat after tooling. Read the relevant [design-system contracts and transferred product cases](01-ui-and-design.md#handoff), [tooling results](02-tooling.md#handoff), and [test commands](00-prerequisites.md#handoff).

After the user verifies the tooling goal, complete the [Phase 02 cleanup](02-tooling.md#cleanup-after-user-verification) before the first product trial.

```text
/goal Execute docs/rearchitecture-goals/03-product-repo.md with GPT-6.1 Sol at High effort as the session orchestrator. Minimize product-repo and testing instructions by encoding timer requirements in feature ownership, component usage, and library-backed behavior tests. Verify the timer flows and fresh-agent tasks, then record the final instruction counts.

Delegate independent work when it saves time or cost. Use GPT-6 Luna at High effort for inventories, reference tracing, and collecting fixture results. Use GPT-6.1 Sol at Medium effort for bounded implementation or debugging.
Run simple commands directly. Keep architecture decisions, judgments about rule removal, integration, and final verification with the orchestrator.
For before/after skill evaluations, run the same task prompts in separate fresh GPT-6.1 Sol chats at Medium effort with delegation off in both runs.
Use the in-app browser with the already running dev server for manual visual verification only when a change affects rendering or leaves an unresolved visual question. Scope inspection to the affected views and states.
Do not stage or commit any changes unless I explicitly ask. Include this constraint in the session handoff.
```

**Baseline at `1667bd1`:** `testing` has 1 entrypoint and 4 rule files, **5 files / 850 words**. Root `AGENTS.md` is a separate **1 file / 187 words**. Count complete Markdown files with `LC_ALL=C wc -w`. Identify incoming product requirements by their original UI rule and acceptance case. Record the receiving owner without counting the original file twice.

## Checklist

- [ ] **Consume the timer-derived system styles.** Use the [public styles established in the UI phase](01-ui-and-design.md#promote-timer-atoms-into-design-system-styles) when composing Choicebox, Timeline and the session controls. Keep the timer's options, event meanings, labels and actions at the caller.
- [ ] **Capture a before state.** In fresh chats, try a timer-only utility change, a request for a reusable UI interaction, and a contrast or accessibility regression. Record which instructions are opened, words read, library choices, and task outcomes. When visual verification is needed, capture the affected narrow and wide timer states in the in-app browser using the existing dev server.
- [ ] **Place code by owner.** Separate timer components, hooks, and utilities within the feature. Keep single-owner helpers, styles and tests beside their owner, keep routes thin, and keep shared UI free of timer imports. The UI promotion already moved the session summary and glyph choices into the timer feature. Apply the same ownership test to remaining product code.
- [ ] **Define the feature-facing import boundary.** Trace timer imports of `Reveal`, `motion` and `useReducedMotion` under `design-system/shared/`. Decide which contracts features should use. Expose those through supported entrypoints, move app-owned behavior to its owner, and migrate existing callers. Verify that a feature can use a supported import and that the corresponding deep import of a private helper fails, for relative paths and aliases. Hand the actual paths and examples to the [contribution guide](04-open-source-contributions.md#what-contributingmd-must-explain).
- [ ] **Extract `Choicebox`** into `src/components/molecules/choicebox`. Compose the existing Button primitive. Supply typed option values, accessible names, icons, group labelling, controlled selection, and an activation callback. Use the molecule directly in timer settings with caller-supplied chime options, icons and preview behavior. Re-activating the selected tone must still preview it. Remove the chime wrapper and its exports.
- [ ] **Extract `Timeline`** into `src/components/molecules/timeline`. Accept a heading and keyed entries with formatted time, event content, optional detail and marker content. The molecule owns ordered-list semantics and keyboard scrolling. The timer supplies formatting, names, marker icons and accessible chime wording. Render the molecule directly with no timer re-export.
- [ ] **Prove the contracts at both boundaries.** Exercise each molecule with unrelated data and two independent instances. Check accessible names, keyboard use, and controlled updates where applicable. In the real timer, verify repeat previews, cue toggles, timeline markers, disclosure focus and restored sessions. When visual verification is needed, compare the same affected narrow and wide states in the in-app browser using the existing dev server.
- [ ] **Try removing the testing skill.** Move product invariants into feature code and library-backed behavior tests. Evaluate whether a fresh agent chooses an existing library before writing a testing utility and whether it selects lint, a unit test or a real-browser check for the right reason. Repeat failures after improving the owning API, test setup or command. Keep the smallest local instruction only when its removal reproducibly breaks the task.
- [ ] **Minimize root instructions.** Repair stale references, verify the remaining setup and route commands, and test from the repo root with held-out task wordings. Account for newly mandatory guidance elsewhere. Record any transferred UI requirement that still needs a product owner.

## Incoming timer acceptance cases

These are the product cases transferred from the deleted UI skill at `31885f0`. This table is their single handoff location. Screen and state test names refer to `src/features/timer/{timer-screen,timer-state}.test.*`; the browser audit covers settled setup, tone choices and the expanded timeline. A visual acceptance case is still open for inspection when a future change affects it.

| Original UI rule and section | Receiving owner | Acceptance in the timer |
| --- | --- | --- |
| atmosphere, paragraphs 1–4; motion, final paragraph | Atmosphere, its preset and Paper adapter | One canvas persists through configuration, playback and resize. The four live pigments change sequentially through the seven chakra families. The static fallback follows those pigments and adaptive ink. CSS-pixel grain, responsive mixing, bounded resolution, hidden-tab pause and reduced motion belong to the atom. The Chromium theme suite samples transitions and dim extremes. GPU cost and actual shader texture require measurement or visual inspection. |
| layout-and-content, settings and dial paragraphs; foreground-components, Dial | TimerSettings and Dial | Two-column untitled settings keep labels, descriptions and controls aligned through disclosure. Desktop fits the full breakdown example, intermediate widths allow it to span, and mobile gives the dial and upright outside value clearance. Preceding controls stay anchored. Healing ticks mark five minutes and emphasize quarter hours. Ten-minute phase dials mark each minute. Zero is at twelve, values increase clockwise, and the visible index matches one-minute pointer and keyboard steps. TimePicker tests exercise bounds, preview, single commit, cancellation and taps. Geometry and wrapping need narrow/wide inspection. |
| content-and-localization, timer labels; typography, timer roles | TimerSettings, TimerSummary, playback and finish dialog | Use “Healing time”, “Tone”, “When chakras change”, “When warm up ends”, “End of session”, and accessible “Warm up time”/“Cool down time”. Descriptions omit terminal periods, visible subfields use CSS capitalization, and phase names/units remain lowercase after values. Verify slider/switch/group names and field order in “related fields reveal in place” and chime tests. Bona Nova SC supplies field labels, headings and countdowns, Cabin supplies body and summary copy. Check 15px-or-larger descriptions, 18px dialog copy/inline actions, upright tabular numbers, bold summary numbers, gradient coverage of wrapped and final letters, and portal typography at reading size when affected. |
| foreground-components, Chime choices; layout-and-content, tone rows | Timer settings, chimes, draft and timeline schedule | Six named bell buttons use one visible Tone label, the second tone by default, switch-thumb sizing and a persistent selected ring. Buttons span the mobile grid in one row or balanced rows of three. Enter/Space and reactivation preview the selected tone. Phase cues appear only with their phase, retaining preferences across toggles. Enabling an empty available selection chooses chakra changes. Disabling the last available cue closes Chimes and restores its switch focus; removing its phase leaves focus on the phase switch. Exercise both chime screen tests, migration cases, and the audio preview race test. |
| foreground-components, HUD actions and Icons; layout-and-content, HUD paragraph | TimerHud, TimerLayout and action group | The primary hit target stays anchored at top right during setup/editing and desktop playback. On phones playback controls sit at bottom right above the safe area. Running offers Pause; paused shows Finish (Logout05), Edit (Edit03) and Resume (Play), full-size and stable across hover/focus. Groups join at square edges with rounded ends. Restart (TimerReset) remains available throughout editing. If elapsed time exceeds the new duration, offer Restart directly. Move focus to the primary when Edit disappears. Exits become inert immediately. Exercise pause/edit, touch-shortening and focus paths; inspect silhouettes, icon stroke and safe-area geometry when affected. |
| layout-and-content, summary and timeline paragraphs; motion, summary feedback | TimerSummary, TimerTimeline, summary panel and schedule | Durations read warm up, session, cooldown, then indicators. Wrap whole items, reserve action clearance, confine blur to the backing. The timeline unfolds beneath a stationary summary, can extend beneath the HUD, stays open while crossed, supports focus/keyboard scrolling and Escape, and does not latch on touch. Initial session start is implicit; warm up starts and transitions into Root. Match chakra names and bell/dot markers to real sounding boundaries even when all sound. Tests cover “HUD summary unfolds”, “timeline marks each sounding boundary” and the shared schedule. Inspect value pulses, muted timestamps and narrow layout when affected. |
| layout-and-content, countdown and previews | TimerSettings and TimerPlayback | “Show timer” counts down the current phase; preview descriptions start with “Like:” on frosted backings. Only the config HUD shows the enabled clock icon. Playback breakdown sits beneath the countdown, fades completed phases, and its preview omits the clock. With breakdown hidden, label warm up and cooldown during those phases. Exercise restored-running and editor-summary tests. |
| foreground-components, Finish dialog and Action hierarchy; layout-and-content, edit paths; motion, scene transitions | TimerScene, TimerHud, FinishTimerDialog, timer draft, routes and storage | Start/restart exits to black, resets root red, then starts the clock and reveals the scene. Resume preserves color and elapsed time. Only an enabled cooldown dims to black. Early finish and natural expiry share “Reiki off” over playback. Focus its heading on open, restore Finish on dismissal. Save/Edit are inline, Leave without saving is the separated filled action. Browser Back permits first-tap dialog links. Both edit paths use /reiki-on/edit. Before saving, show Restart and play-glyph “Save timer” and restore the tab draft on refresh. Paused editing offers Resume/Restart. Leave clears the draft and restores saved settings/defaults. Only Save persists settings. Exercise completed-edit-refresh-save, restart without saving, paused elapsed time and automatic completion. Inspect the single glass highlight and motion-enabled transitions when affected. |

## Evaluation log

| Attempt | Guidance removed or tested → intended owner | Result, actual reads and evidence | Skill files / rule files / words left | Root files / words left | Next attempt |
| --- | --- | --- | --- | --- | --- |
| Baseline | Component selection → installed primitives and public APIs | Root instructions name two installed primitives; nine component families were found. | 5 / 4 / 850 | 1 / 187 | Test discovery from the system and its APIs after removing the stale inventory. |

## Final reconciliation

Replace the pending cells with measured results from the three chats and link the evidence. Include successor skills and transferred rules. Report both stored words and actual references loaded in the fresh-session runs.

| Owner | Baseline files / words | Final files / words | Delta | Remaining rule and evidence for keeping it |
| --- | --- | --- | --- | --- |
| UI and design | 12 / 4,351 | 0 / 0 | −12 / −4,351 | The [UI handoff](01-ui-and-design.md#handoff) records the fresh evaluations and the contracts that replaced the skill. |
| Tooling | 20 / 14,293 | Pending | | |
| Product repo skills | 5 / 850 | Pending | | |
| **All local skills** | **37 / 19,494** | Pending | | |
| Root instructions | 1 / 187 | Pending | | |
| **Combined** | **38 / 19,681** | Pending | | |

**Completion:** Run repo-wide Biome and token checks, typecheck, all Vitest projects including Chromium, and the production build. Check the earlier goals’ local acceptance evidence. Record the final design-system baseline with its revision or working-tree state, public APIs, component ownership, verification results and outstanding findings.

## Handoff

**Status: pending.** Record the validated base revision, working-tree changes, final measurements, and verification results. Do not stage or commit changes unless the user explicitly asks. Carry this instruction into any continuation handoff.

### After the rearchitecture

Hand the verified feature boundaries, change examples and proposed review paths to [Phase 04](04-open-source-contributions.md). That phase prepares the repo for outside contributors during the rearchitecture. [Hosted review](04-open-source-contributions.md#hosted-review-after-baseline-acceptance) follows acceptance of the complete baseline and the maintainer's rollout decision.

### Cleanup after user verification

At handoff, identify the actual parity tests, temporary second-feature callers, screenshots and skill-removal traces by path or case. Mark which can go and where the durable interaction, accessibility and saved-session checks live. Preserve fixtures for data that supported app versions can still load. Reconcile the deferred Phase 00/01 ledgers, keeping the accepted totals and their rationale. After user verification, the Phase 04 agent removes spent evidence, checks references, and runs the affected component and timer flows plus the full contributor check before starting readiness work.
