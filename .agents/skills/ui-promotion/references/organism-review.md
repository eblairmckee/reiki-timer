# Organism promotion review

Use for promotions that introduce/move coordinated state or lifecycle. Keep one checklist in the task's plan/evidence location, outside operational guidance. Do not create a permanent checklist for every molecule.

## Before implementation

Record the proposed boundary, real consumer, independent example and state owner. Select only relevant [atomic contracts](../../react-composition/rules/atomic-ui.md#organisms), [lifetime](../../react-lifetime/SKILL.md), [interaction](../../interaction-evidence/SKILL.md) and [visual rules](../../visual-design/SKILL.md#select-the-rules). Turn those rules into observable outcomes, not a copied catalogue.

Use this format; add rows only for real risks:

| Check | Rule/contract | Setup → action → expected result | Evidence/status |
| --- | --- | --- | --- |
| Main consumer journey | Applicable rule link | Actual entry, transitions and exit | Pending |
| Ownership/recovery | Applicable rule link | Parent update/decline, cancel/retry or resource change | Pending |
| Scope/lifetime | Applicable rule link | Two instances or remount; cleanup and reset | Pending |
| Native/custom content | Applicable rule link | Keyboard, focus return, slot replacement, single activation | Pending |
| Visual/motion | Selected visual rule | Relevant viewport/content and ordinary/reduced motion | Pending |

Prune inapplicable rows with a short reason. Tests can supply repeatable evidence; browser observations supply rendered/interaction evidence. Use the user's requested browser (the in-app browser when specified) for visual review. Preserve the app's real styles and backing.

## After implementation

Exercise journeys through actual consumer controls. Mark each row **pass**, **fail**, **blocked** or **not inspected**, naming evidence and scope. Keep the first failure and repair in the record; rerun affected checks after repair. Source inspection is not an executed journey, and reduced-motion tests do not establish ordinary motion.

Perform an adversarial pass: try to break expected outcomes with rapid reversal, hiding/unmounting while focused, stale props, or interrupted motion when relevant. Look for hierarchy, legibility, feedback and motion improvements using selected visual rules. Separate regressions/contract failures from optional design opportunities; give an observed condition and user consequence for each. Do not turn a preference into a blocking redesign.

Finish with unresolved findings and perceptual/device/assistive-technology limits. Keep evaluator history outside skills. For fresh agents, provide the task and raw source/diff, not the expected classification or earlier verdict; distinguish self-review from independent review.
