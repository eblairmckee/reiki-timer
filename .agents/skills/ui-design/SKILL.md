---
name: ui-design
description: Invoke when designing, restyling, building UIs, or reviewing this app's interfaces. Ensures consistent use of theme, visual aesthetic, interaction contracts, and composition rules.
---

Understand the requested feature, interaction, screen, component API, or review. Read the relevant application code and use its tooling, design references, and constraints. Clarify details that would materially change the result; state reasonable assumptions when progress can continue.

Identify the primary user task, data shape, required states, interaction contract, and accessibility needs. Keep the work within the requested behavior. Compare plausible approaches when they change public APIs, state ownership, implementation cost, or user experience; small clear changes can proceed directly.

Use an isolated prototype when it resolves a real uncertainty, then integrate or remove it after the question is answered. Build one working path and its relevant state transitions and edge cases. Verify the affected behavior and explain consequential design and engineering decisions. Report useful follow-up separately from the completed scope.

## Self review
- Verify the result in the running app at its actual reading size. 
- Inspect any references provided, then compare browser captures at matching proportions within the user's requested viewport scope. Match silhouette, scale, placement, type and material before polishing motion. 
- Check interactive states: default, hover, and pressed/active over both warm and cool backgrounds.

## Skill improvements
When the user changes a design decision, revise its owning rule and any conflicting references as part of implementing it. 