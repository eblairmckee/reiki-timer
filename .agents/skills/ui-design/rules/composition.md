# Component composition

## Responsibility and boundaries

Atoms are focused reusable primitives such as buttons, inputs, and labels. Molecules combine smaller parts for one interaction or purpose, such as a search field or a field with help and error text. Organisms coordinate smaller pieces into substantial sections, such as filterable results or a settings form. Templates and pages assemble those sections for a concrete screen.

Classify components by responsibility and their relationship to consumers, following the application's vocabulary and folder conventions. Keep API clients, routes, analytics, permissions, and business data at the feature or page boundary; supply data and actions to reusable primitives through typed props. Extract shared code for a real repeated responsibility.

A molecule presents one coherent interaction contract. A search field can coordinate its input, clear action, and status while its consumer supplies the query and search behavior. An organism coordinates several such contracts into a section, such as filters, results, and pagination. Give coordinated state one owner and expose the actions consumers need.

Keep a visual wrapper local until it has a meaningful semantic responsibility or repeated consumer need. Reuse the selected library's behavior-rich controls through their supported APIs. Place shared and feature-specific compositions according to the [component organization](component-organization.md).

## Public API and variants

Sketch a normal usage and its most important variation before expanding a component's public API. Choose ordinary props, useful named slots, or compound components according to what consumers need to author independently. Use the target framework's content APIs; in React, use `children` for caller-authored structure and a render callback when the component supplies data or state to that structure.

Model mutually exclusive modes with a named variant, a discriminated union, or separate compositions of shared parts. Keep independent boolean state such as `disabled` as a boolean. Use explicit feature compositions when modes need different providers, content, or actions.

Preserve labels, descriptions, errors, refs, event behavior, and native semantics through wrappers. Keep the public contract typed and preserve its controlled or uncontrolled state ownership. 

For React wrappers, follow the [component type contracts](../../react-best-practices/rules/component-types.md) for version-compatible ref handling and providers.

## Verify consumers

For a shared component, check that a second realistic consumer composes cleanly. Trace state transitions, controlled updates, theme and layout variants, and the boundary between shared UI and feature logic. Follow the [behavior checks](../../accessible-testing/rules/behavior-tests.md) for consumer-visible contracts and explain any consequential boundary or tradeoff.

Reference: [Atomic Design methodology](https://atomicdesign.bradfrost.com/chapter-2/).

