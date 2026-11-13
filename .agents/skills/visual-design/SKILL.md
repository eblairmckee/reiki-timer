---
name: visual-design
description: Design or review changes to visual hierarchy, content, layout, typography, surfaces, feedback, data display or motion. Select only rules relevant to the affected UX; use for rendered and adversarial self-review independently of React composition work.
---

# Visual design in this app

Start with the user's task, actual content, affected states and existing system contracts. Preserve intentional brand and interaction distinctions. Read only the rule files selected below; they own the detailed principles.

## Select the rules

1. Identify what changes or could regress in the affected experience.
2. Select each matching row; for self-review turn its criteria into observable checks. Skip unrelated rows (a HUD promotion does not need chart guidance).
3. Inspect running states, then distinguish contract failures from optional improvements. For organism journeys use the [review checklist](../ui-promotion/references/organism-review.md).

| When making or reviewing… | Read |
| --- | --- |
| Content priority, grouping, disclosure, orientation or comparative decisions | [Hierarchy and meaning](rules/design-principles.md) |
| Spacing, responsive layout, overflow or content density | [Layout and spacing](rules/layout-spacing.md) |
| Type roles, reading order, icons or media | [Typography and media](rules/typography-media.md) |
| Color, materials, theme extensions or legibility over a backing | [Surfaces and theme](rules/surfaces-theme.md) |
| Loading, empty, error, success or changing system state | [Status and feedback](rules/status-feedback.md) |
| Formatted numbers, comparable metrics or charts | [Data display](rules/data-display.md) |
| Animation, presence, reveal, transitions or atmospheric rendering | [Motion](rules/motion.md) |

## Rendered review

Inspect affected states for selected criteria. Use the in-app browser when requested. A fixture must load the app's actual global stylesheet and cascade. Use browser relationships and resolved styles for objective guarantees; static colors, axe and screenshots alone do not establish visual quality. Observe the cue the contract allows (including color or pseudo-elements), rather than assuming motion means travel or opacity.

Record viewport/content/state, observations and uninspected conditions. Ordinary and reduced motion need separate evidence. Do not turn screenshots into mandatory approval baselines. Report device, font, screen-reader and perceptual limits without claiming they passed.
