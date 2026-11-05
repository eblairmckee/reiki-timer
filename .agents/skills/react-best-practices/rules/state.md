# Rendering and state contracts

Keep rendering pure and preserve component identity across ordinary parent renders, following the [component boundary guidance](rerenders.md#dont-define-components-inside-components). Use stable item identities for keys and reset or preserve state deliberately when identity changes. Use the configured [code checks](../../typescript/rules/checks.md) for static Hook and JSX diagnostics.

Keep state with the nearest owner that coordinates it. Follow the [derived-state guidance](rerenders.md#calculate-derived-state-during-rendering) and [event-handler guidance](rerenders.md#put-interaction-logic-in-event-handlers) when deciding what needs state or an Effect. Use reducers for related transitions that benefit from an explicit state machine. Update React-owned arrays and objects immutably.

Use Effects to synchronize with external systems and mirror setup with cleanup. The [Effect patterns](effects-and-initialization.md) cover reactive inputs and latest-value callbacks. Use external-store subscription APIs where appropriate.

For controlled and uncontrolled component APIs, separate the controlled value, uncontrolled default, and change callback. Maintain one source of truth throughout the component's lifetime. Determine control from prop presence according to the API contract; defined values such as `false`, `0`, and `""` remain valid controlled values. Defaults seed the initial uncontrolled state, while controlled updates follow the parent value.
