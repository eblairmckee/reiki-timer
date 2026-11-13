# Atomic UI contracts

## Common contract

Classify by public responsibility, not size, Hook count or number of child components. Shared UI must obey [dependency boundaries](../../../references/code-organization.md#dependency-boundaries). Keep feature copy, domain interpretation, navigation, persistence policy and product commands at the feature boundary. A meaningful feature adapter can remain after promotion.

Prefer existing app-owned foundations. Document supported content, accessible-naming responsibility, defaults and callback semantics at public declarations. Preserve promised native props, refs, event cancellation and keyboard behavior. Tier names do not require additional wrapper layers.

## Atoms

- Provide one focused reusable visual or interaction primitive; avoid feature knowledge or a multi-part workflow.
- Allow local state needed for the primitive's interaction (for example focus or a disclosure). Expose meaningful values/actions through a documented controlled API when consumers own them.
- Preserve native semantics and foundation behavior. Extend an existing design-system foundation in its home rather than duplicating it as an app atom.

## Molecules

- Compose atoms/foundations into one opinionated reusable purpose. Values, selections, progress and product actions are prop-driven. Allow only local presentation state, such as showing/hiding content; do not own business state, I/O or a workflow shared by independently placed parts.
- Using stateful foundations, presence/preference context or refs does not change the tier. State coordinated across consumers belongs at their common owner.
- Make caller-facing content slots escapable: if a slot supplies a default atom, accept a custom React node in its place. Preserve the opinionated default without forcing its use. Structural wrappers are not automatically slots.
- Where slot content needs information owned by the molecule, accept a typed render callback as well as a node (for example `ReactNode | ((context: { expanded: boolean }) => ReactNode)`). Pass only relevant public state, data or required interaction props; do not invent callback context or expose private internals for uniformity.
- Define omitted versus intentionally empty slot behavior. State what semantics/ref/event props custom interactive content must preserve; do not overwrite consumer handlers or wrap arbitrary controls in another interactive element.

## Organisms

- Compose a reusable coordinated interaction or own state/lifecycle used by multiple parts. An organism may be a headless provider/controller with subscribed atoms or molecules and no visual wrapper.
- Own coordination at the nearest common ancestor of all participants. Expose scoped state/actions through props, render callbacks, compound parts or context according to real placement needs; a provider is optional.
- Specify controlled versus uncontrolled state, reset/resource identity, cleanup and independent-instance isolation using [React lifetime](../../react-lifetime/SKILL.md). Feature commands remain injected; generic coordination does not absorb business decisions.
- Preserve replaceable content and native contracts. Promote real coordination, not artificial state added to justify a directory name. If all behavior is a single presentation detail, a molecule may suffice.
- Before implementing a promotion, prepare the focused [organism review checklist](../../ui-promotion/references/organism-review.md), then exercise actual consumer journeys after the change.
