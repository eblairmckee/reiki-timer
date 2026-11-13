# Code organization and contracts

## Placement

The adapted Olyx foundations in `src/components/design-system/` are app-owned and configured by `components.json`. Merge additions into that system, preserving its public APIs, brand, accessibility and motion; inspect affected consumers. The [promotion decision tree](../skills/ui-promotion/SKILL.md#decide-the-home) owns move decisions; [atomic contracts](../skills/react-composition/rules/atomic-ui.md) define shared UI responsibilities.

| Home | Responsibility |
| --- | --- |
| `src/components/design-system/` | Adapted foundations, theme, materials, motion and system-specific helpers. |
| `src/components/{atoms,molecules,organisms}/` | Shared app UI, classified by its public state responsibility. |
| `src/features/<feature>/screens/` | Route/view composition, navigation transactions and focus choreography. |
| Feature `components/` | Product UI and meaningful domain-content adapters; use atomic contracts where relevant without nesting tier directories inside features. |
| Feature `hooks/`, `state/` | React lifetimes/commands and context contracts. |
| Feature `model/`, `data/` | Pure domain rules, validation, calculations and catalogues. |
| Feature `services/` | Browser/external I/O, compatibility and failure handling. |
| Feature `utils/`, `styles/` | Domain presentation adapters and styles shared within the feature. |
| `src/hooks/`, `src/utils/<concern>/` | Neutral React/platform hooks and non-React utilities. |
| `src/app/routing/`, `src/app/styles/` | Router instance, route transitions and global styles. |

Give an independent feature its own state and a sibling route outside the timer layout. Keep CSS, private helpers and focused tests beside their owner. Whole-feature tests stay with the layout; native browser tests live in `test/browser/`. Create populated, concern-named directories. Feature components use named implementation files; shared components may implement directly in `index.tsx`. `src/main.tsx` and generated framework files are deliberate root exceptions.

## Dependency boundaries

Shared components, hooks and utilities must not import features. Neutral helpers must not import component implementations. Pure models must not import browser services or components. Keep product data, copy and commands at the feature boundary; shared code receives them through public contracts.

Avoid cycles, passthrough wrappers/re-exports for internal moves and imports of private system material internals. Keep adapters that perform meaningful domain interpretation. Configured import lint catches direct paths; transitive/dynamic/CSS coupling still needs source inspection.

## Public contracts and runtime data

Trace the declaration, implementation and real callers before changing a public contract. Configuration changes must reach affected UI consumers and storage compatibility cases. Use strict TypeScript and installed native/library types; preserve useful inference and use generics for actual relationships. Model mutually exclusive modes and exhaustive handling where the compiler can express them. A default switch branch alone is insufficient.

Declarations/defaults own individual API meaning. The composition skill covers prop/slot documentation, native forwarding and supported content; the visual skill covers brand and styling extensions. Do not infer a public API from an internal selector or implementation detail.

Validate untrusted runtime data as `unknown`; casts are not validation. Preserve meaningful missing/invalid/failed distinctions, localize necessary escapes and explain their assumptions. Browser persistence and resource semantics use the [lifetime skill](../skills/react-lifetime/SKILL.md). Keep React's normal escaping; explicit HTML requires a trusted sanitization boundary.
