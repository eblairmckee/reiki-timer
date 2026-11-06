# Layout and content resilience

Timer settings are an unframed sequence over the full-screen atmosphere. Place a compact, left-aligned “Reiki timer” wordmark in the same header row as Play. Its lettering is slightly smaller than field labels, with an enlarged initial R; retain a single accessible heading name. On desktop center a bounded grid with a fixed-width, left-aligned label column and a control column. Put descriptions immediately beneath labels. On mobile stack label, description and control, preserving safe-area clearance.

One component-owned variable sets the gap between primary rows; progressively revealed related fields use half that gap. Use AnimatePresence and layout animation for disclosure. Exiting controls become inert immediately; Reduced Motion removes spatial travel.

The selected time is small and upright outside the dial rim, radially aligned with its index and tick. Reserve clearance at every angle and both limits. Zero is at twelve o'clock; valid values increase clockwise and invalid values clamp.

HUD actions stay in one top-right semantic group: ghost text actions immediately left of the anchored primary circle, with clear separation and no backing tray. Paused mode offers Finish and Edit; editing replaces both with Restart, alongside Resume. Move focus to Resume when Edit disappears. Animate secondary action replacement and expansion/collapse without moving the primary button; exiting actions become inert and hidden from assistive technology. Button primitives own appearance and feedback; feature CSS owns placement.

Editing replaces the session area with settings. Running mode shows atmosphere and an optional countdown controlled by Show time, off by default. Never render chakra names. Completion returns to configuration using the [motion contract](motion.md).

Preserve scrolling, text resizing and zoom. Prefer intrinsic CSS geometry; measure in JavaScript only for interaction. Review framing, alignment and progressive disclosure at the viewport sizes requested for the task.
