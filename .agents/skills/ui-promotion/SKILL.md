---
name: ui-promotion
description: Decide where new or changed UI belongs and promote reusable behavior from a feature into shared atoms, molecules or organisms. Use when adding UI, adding independent consumers, or changing composition/state responsibility; also use for promotion reviews. Pure copy/style changes do not require relocation.
---

# UI promotion

Inspect the affected declaration, implementation and real callers first. Read [placement](../../references/code-organization.md#placement) and [dependency boundaries](../../references/code-organization.md#dependency-boundaries) when adding or moving code. Do not scan every feature or load every skill.

## Decide the home

1. **Does an existing foundation or shared component already provide the behavior?** Reuse or extend its public contract. Keep a feature adapter if it interprets domain data; do not duplicate an already-promoted component.
2. **Is the behavior meaningful only within this feature?** Keep it in the feature. Similar markup alone is insufficient evidence of reuse.
3. **Can it serve independent consumers through a neutral typed contract?** Record the current consumer and one concrete independent usage example. Two shipping features are not required, but speculative configurability is not a justification. Split reusable behavior/style from feature copy, decisions and commands.
4. **What responsibility will the shared contract own?** Read [common atomic contracts](../react-composition/rules/atomic-ui.md#common-contract) and the selected tier:
   - One primitive → [atom](../react-composition/rules/atomic-ui.md#atoms), `src/components/atoms/`.
   - Opinionated composition, caller-owned values/actions, only local presentation state → [molecule](../react-composition/rules/atomic-ui.md#molecules), `src/components/molecules/`.
   - Coordinated state/lifecycle across reusable parts, including headless subscribers → [organism](../react-composition/rules/atomic-ui.md#organisms), `src/components/organisms/`.
5. **Does new evidence change an existing tier?** Move only the responsibility that changed. Demote or keep feature-local when the abstraction no longer fits. Adapted design-system foundations retain their existing home.

## Plan and implement

State the decision (reuse / keep / extract / move), evidence, destination, state owner and consumer migration. Read [React composition](../react-composition/SKILL.md) for public API changes. Move owned styles/helpers/tests with behavior; retain meaningful domain adapters and update imports without passthrough re-exports.

For an organism, write a short task-specific [review checklist](references/organism-review.md) **before** implementation. For atoms/molecules, use focused contract checks in the task plan; a journey document is unnecessary. Any UX-impacting change uses the [visual rule selector](../visual-design/SKILL.md#select-the-rules) and [interaction evidence](../interaction-evidence/SKILL.md) only where applicable.

## Review the result

Check the actual consumer and independent example against the public contract, including slot overrides, parent-controlled updates and native semantics where promised. For an organism, execute the planned journeys and an adversarial pass; record observations, repairs and uninspected cases. A correct decision to keep or reuse is a successful outcome.

Choose [focused checks](../../references/development-workflow.md#check-selection), then follow [handoff](../../references/development-workflow.md#handoff). Do not equate a passing build with usable composition or a single successful task with proven skill efficacy.
