# Motion

Use motion to explain relationships and state without blocking input or making completion depend on animation. Preserve the system's purposeful timing distinctions rather than imposing a universal duration.

Review ordinary motion separately from reduced motion: entry/exit, quick reversal, interrupted transitions and focus during disappearance where applicable. Hidden/exiting content must not leave actionable invisible controls or stranded focus. Check layout continuity and whether repeated movement distracts from the task.

Atmospheric renderers preserve theme-derived colors, canvas continuity, fallback and hidden-tab behavior. Apply these checks only to work affecting that rendering/lifecycle. Use [React lifetime](../../react-lifetime/SKILL.md) for resources/subscriptions and [interaction evidence](../../interaction-evidence/SKILL.md) for actual focus/event ordering.

Adversarial review should name the observed condition and effect (for example a target moves during repeated activation), then separate a broken contract from an optional comfort/design improvement. Do not infer motion comfort from automated assertions alone.
