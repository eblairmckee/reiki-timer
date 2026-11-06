# Product repo: make the timer a clear design-system consumer

Start a fresh chat after tooling. Read the relevant [design-system contracts and transferred product cases](01-ui-and-design.md#handoff), [tooling results](02-tooling.md#handoff), and [test commands](00-prerequisites.md#handoff).

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

- [ ] **Capture a before state.** In fresh chats, try a timer-only utility change, a request for a reusable UI interaction, and a contrast or accessibility regression. Record which instructions are opened, words read, library choices, and task outcomes. When visual verification is needed, capture the affected narrow and wide timer states in the in-app browser using the existing dev server.
- [ ] **Place code by owner.** Separate timer components, hooks, and utilities within the feature. Keep single-owner helpers, styles and tests beside their owner, keep routes thin, and keep shared UI free of timer imports. Move timer-specific presentation such as the session summary into the feature when its API or copy depends on timer concepts.
- [ ] **Extract `Choicebox`** into `src/components/molecules/choicebox`. Compose the existing Button primitive. Supply typed option values, accessible names, icons, group labelling, controlled selection, and an activation callback. Use the molecule directly in timer settings with caller-supplied chime options, icons and preview behavior. Re-activating the selected tone must still preview it. Remove the chime wrapper and its exports.
- [ ] **Extract `Timeline`** into `src/components/molecules/timeline`. Accept a heading and keyed entries with formatted time, event content, optional detail and marker content. The molecule owns ordered-list semantics and keyboard scrolling. The timer supplies formatting, names, marker icons and accessible chime wording. Render the molecule directly with no timer re-export.
- [ ] **Prove the contracts at both boundaries.** Exercise each molecule with unrelated data and two independent instances. Check accessible names, keyboard use, and controlled updates where applicable. In the real timer, verify repeat previews, cue toggles, timeline markers, disclosure focus and restored sessions. When visual verification is needed, compare the same affected narrow and wide states in the in-app browser using the existing dev server.
- [ ] **Try removing the testing skill.** Move product invariants into feature code and library-backed behavior tests. Evaluate whether a fresh agent chooses an existing library before writing a testing utility and whether it selects lint, a unit test or a real-browser check for the right reason. Repeat failures after improving the owning API, test setup or command. Keep the smallest local instruction only when its removal reproducibly breaks the task.
- [ ] **Minimize root instructions.** Repair stale references, verify the remaining setup and route commands, and test from the repo root with held-out task wordings. Account for newly mandatory guidance elsewhere. Record any transferred UI requirement that still needs a product owner.

## Evaluation log

| Attempt | Guidance removed or tested → intended owner | Result, actual reads and evidence | Skill files / rule files / words left | Root files / words left | Next attempt |
| --- | --- | --- | --- | --- | --- |
| Baseline | Component selection → installed primitives and public APIs | Root instructions name two installed primitives; nine component families were found. | 5 / 4 / 850 | 1 / 187 | Test discovery from the system and its APIs after removing the stale inventory. |

## Final reconciliation

Replace the pending cells with measured results from the three chats and link the evidence. Include successor skills and transferred rules. Report both stored words and actual references loaded in the fresh-session runs.

| Owner | Baseline files / words | Final files / words | Delta | Remaining rule and evidence for keeping it |
| --- | --- | --- | --- | --- |
| UI and design | 12 / 4,351 | Pending | | |
| Tooling | 20 / 14,293 | Pending | | |
| Product repo skills | 5 / 850 | Pending | | |
| **All local skills** | **37 / 19,494** | Pending | | |
| Root instructions | 1 / 187 | Pending | | |
| **Combined** | **38 / 19,681** | Pending | | |

**Completion:** Run repo-wide Biome and token checks, typecheck, all Vitest projects including Chromium, and the production build. Record the final revision, advisory warnings, unresolved browser findings, and the pass/fail evidence for retained instructions. Check the earlier goals’ acceptance evidence, including hosted review, before closing the effort.

## Handoff

**Status: pending.** Record the validated base revision, working-tree changes, final measurements, and verification results. Do not stage or commit changes unless the user explicitly asks. Carry this instruction into any continuation handoff.
