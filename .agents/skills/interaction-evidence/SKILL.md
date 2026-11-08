---
name: interaction-evidence
description: Implement or review UI interaction changes where focus, keyboard behavior, native activation, controlled state, or async failure and recovery determine correctness. Choose and execute evidence for the affected interaction; unrelated logic or cosmetic changes do not require this workflow.
---

# Interaction evidence

Describe the user-visible transition and the failure that would matter. Inspect the existing control's behavior and the consumer's responsibility before adding ARIA, event handlers or test helpers. Preserve installed library behavior through its supported APIs.

Use roles, names, labels and ordinary user actions as the behavioral test surface. Include the relevant controlled values and parent updates, independent instances, native props/refs and single activation. For cancelable events, verify that prevention stops the owned action at the promised point. Successful rendering or a callback spy alone may miss the actual interaction. Assert the required content and behavior without fixing an optional wrapper or live-region mounting strategy. Calibrate a new acceptance test against multiple valid designs as well as plausible failures when those alternatives affect its meaning.

Trace keyboard entry, movement, activation and exit. A closing disclosure must not retain focus in inaccessible content; a modal must contain focus and restore it according to the owner's contract. Ensure pointer gestures have the required keyboard alternative. Preserve native text entry, submit/reset and paste; check ordinary and modified link activation. Use Chromium for actual Tab behavior, native focus, layout and browser event ordering. Component tests are appropriate when they reproduce the asserted behavior; do not label synthetic focus as proof of real keyboard navigation.

For an async form or command, exercise pending behavior, duplicate submission, failure, retained input, retry and obsolete completion. Associate errors with the affected field and make important async feedback understandable and discoverable without announcing every keystroke. Do not clear the user's work simply because the first attempt failed. Native semantics, accessible names and visible state must agree.

Use axe as additional evidence, not a substitute for behavior, useful names or perception. Record incomplete results. Brand, visual hierarchy, legibility over real backing, motion comfort and assistive-technology announcements may require direct inspection or a person; name these limits and the required review rather than treating them as free or already passed.
