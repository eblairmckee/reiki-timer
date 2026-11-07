# Repository conventions

This is the current reference for **human contributors**. Public declarations define individual API contracts; TypeScript, Biome, scripts and tests enforce the portions they can establish. Some conventions still require architectural or visual judgment. Agent instructions live separately in `AGENTS.md` and `.agents/skills/`; this document is not an agent instruction dependency.

The audit reconciled 104 concerns. Its implementation evaluations touched 34, often partially; 70 had no direct implementation comparison. The current ownership decisions therefore combine measured evidence with explicit maintainer judgment, rather than claiming that every convention was experimentally validated. Read only the section relevant to your change.

## Product organization and shared component taxonomy

Directories communicate responsibility and state ownership. Feature-specific UI has no atomic tiers. Use the app-owned design system's public foundations before introducing another primitive.

- An **atom** is a focused reusable primitive.
- A **molecule** combines smaller parts for one reusable purpose and owns no interaction or product state. Values, content and actions come from its caller.
- An **organism** composes reusable parts and owns coordinated state/lifecycle. Controlled/uncontrolled modes and change notifications must be explicit. A product-specific workflow remains feature UI even when it owns state.

Reading inherited preference/presence context, holding a DOM ref or using a stateful foundation does not itself make a molecule the workflow owner. Classify the public responsibility, not Hook names or element count. Stateless product copy does not automatically belong in shared UI.

Promote a capability through a neutral typed API, a current consumer and a concrete independent usage example; two already-shipping features are not required. Move reusable behavior and styling together. Keep domain interpretation, routes, analytics, permissions, asset selection and product copy with the feature. Call shared APIs directly when a wrapper only forwards props or re-exports them; retain adapters that construct meaningful domain content.

| Directory | Owner |
| --- | --- |
| `src/app/routing/`, `src/app/styles/` | Router instance, route transitions and global styles. |
| `src/routes/` | Thin file-route adapters; the generator owns `src/routeTree.gen.ts`. |
| `src/components/design-system/` | Adapted foundations, brand tokens, materials, motion and system helpers; configured by `components.json`. |
| `src/components/{atoms,molecules,organisms}/` | Reusable app UI classified by its state contract. |
| `src/hooks/`, `src/utils/<concern>/` | Neutral React/platform lifetimes and non-React utilities. |
| `src/features/<feature>/screens/` | Route/view composition, navigation transactions and focus choreography. |
| Feature `components/` | Product UI and domain-content adapters. |
| Feature `hooks/`, `state/` | React lifecycle/commands and context contracts. |
| Feature `model/`, `data/` | Pure domain types, validation, calculations and catalogues. |
| Feature `services/` | Browser/external I/O, compatibility and failure handling. |
| Feature `utils/`, `styles/` | Domain presentation adapters and styles shared within the feature. |

`src/main.tsx` remains the bootstrap entrypoint. Keep CSS, private helpers and focused tests beside their owner; whole-feature tests stay with the layout, and native browser evidence lives in `test/browser/`. Create only populated directories. Name files for their responsibility. Feature components use named implementation files; shared components may implement directly in `index.tsx`. Avoid forwarding barrels and compatibility re-exports for internal moves.

Shared components, hooks and utilities never import features. Neutral helpers do not import component implementations. Pure models do not import browser services or components. Avoid dependency cycles and private system material imports. Import restrictions catch configured direct paths; transitive ownership remains a review responsibility.

[Choicebox](../src/components/molecules/choicebox/index.tsx), [Timeline](../src/components/molecules/timeline/index.tsx) and [SummaryList](../src/components/molecules/summary-list/index.tsx) receive caller-owned values/content/actions. TimerSummary remains a feature adapter because it constructs timer-specific items. [CyclingAtmosphere](../src/components/organisms/cycling-atmosphere/index.tsx) owns a neutral palette lifecycle; chakra palettes remain feature data.

## Public contracts and state

Keep one source of truth at the coordinating owner. Pure calculations belong in models/rendering; explicit user commands and persistence policy belong with the feature. Effects synchronize committed views with external systems; user actions belong in handlers. Preserve reactive inputs, cleanup, actual resource identity and protection from obsolete async results. Coordinate shared state at the nearest common owner of all participants, including siblings outside a visual frame. Choose props, slots, render callbacks or context according to what consumers need to author.

Preserve component identity and stable item keys. Controlled `false`, `0` and empty strings remain valid values; defaults seed uncontrolled state. Preserve native semantics, ref targets, supported children/props and cancelable event behavior through wrappers. Keep public types honest about what is forwarded. Use discriminants for mutually exclusive modes and generics for real relationships.

Names communicate purpose, scope and state. Promoted APIs use reusable vocabulary. Put JSDoc at public prop/slot/callback declarations: explain expected content, accessible-naming responsibility and when callbacks fire. Word counts and business-word blacklists cannot establish meaningful documentation.

The timer layout owns navigation/exit transactions and focus; its session hook owns draft, clock, audio lifetime and commands. Audio prepares during a user gesture; a pending clock starts only after the layout accepts the exit. Save is explicit; unsaved tab recovery never overwrites saved preferences. Configuration changes reach their UI consumers and storage compatibility tests. Another feature owns its state and uses a sibling route outside the timer layout.

## Brand and accessible presentation

Merge upstream Olyx/CLI additions into the existing app-owned system while preserving its public API, brand, motion and accessible behavior. Verify affected callers. Centralize values and behavior that should change together, preserving intentional differences; neither every number nor every repeated expression needs a token or abstraction.

Preserve Bona Nova SC for headings, countdowns and field labels, and Cabin for dialog body/actions, descriptions and summary copy. Use Hugeicons consistently. Button's material defaults to frost, with inset as a variant; shared dialog/action/disclosure treatments stay system-owned. The finish dialog's calm icon-or-text hierarchy is a product decision, not a universal ban on icons beside labels.

Design for content hierarchy, responsive layout, legibility on the actual backing and purposeful motion. Keep essential content readable at narrow widths and enlarged text. Preserve useful media alternatives, geometry and font fallbacks. Reduced motion removes nonessential movement; ordinary transitions remain interruptible and must not block input. Atmosphere/rendering owners preserve theme-derived colors, canvas continuity, fallback and hidden-tab behavior.

Preserve native activation, useful keyboard/focus behavior, forms and recovery. Names, labels, errors and visible state must agree. Keep important async feedback understandable without announcing every keystroke. Preserve native input, submit/reset, paste and gesture alternatives; retain useful input after failure. Brand, contrast on actual backing, comfort and assistive-technology experience are explicit review responsibilities.

## Color and styling ownership

Color values belong in [theme.css](../src/components/design-system/styles/theme.css); consumers use semantic references. Preserve `currentColor`, transparency, platform/forced colors and theme-derived renderer inputs. Theme, component geometry/state and feature arrangement have distinct owners. Public root overrides must preserve supported styling and portal theming; a CSS variable or `data-*` selector found in source is not automatically a public extension point. Keep required [upstream aliases](../src/components/design-system/styles/olyx-compat.css) compatible.

The [color checker](../scripts/check-colors.ts) covers parsed CSS paints and recognized script/SVG contexts, including unique local constant aliases. Unsupported XML syntax fails visibly. Computed/cross-module paints, numeric renderer channels and opaque custom-property aliases need review. This checker cannot prove perceptual contrast, runtime provenance or token liveness. Unused-token findings are advisory: trace production reads, aliases and dynamic palettes before removal.

## TypeScript and framework integration

Use strict TypeScript, installed native/library types and generated route types. Validate untrusted runtime data as `unknown`; casts do not validate it. Preserve meaningful missing/invalid/failed distinctions, localize necessary escapes and explain their assumptions. Use exhaustive union handling; a default switch branch alone is insufficient. Biome checks static patterns, not TypeScript assignability.

Keep React's normal escaping; explicit HTML needs a trusted sanitization boundary. Minimize/version persisted data and handle unavailable, malformed or failed storage. Preserve URL/history state where links, refresh and Back/Forward should restore it; ephemeral or sensitive drafts stay with their appropriate owner. Ordinary and modified link activation must work.

Follow [framework setup and commands](../CONTRIBUTING.md#framework-and-guidance-changes). This app is client-side; package examples do not authorize introducing server/RSC/Next/SWR architecture or dependencies.

## Performance and resources

Optimize an observed workload while preserving behavior. Callback identity needs a real contract or measured case; `noJsxPropsBind` is disabled. Do not impose blanket memoization, subpath imports, barrel bans or optimization recipes. Measure relevant loading, render, input or GPU cost before architectural churn; caches need explicit lifetime and invalidation.

Load resources according to their role, avoid unnecessary waterfalls and keep nonurgent work from delaying required feedback. Client Activity, resource hints, script ordering, locale formatting and other conditional techniques remain available when applicable. Historical examples are neither mandatory recipes nor prohibited techniques.

## Recovered framework, UI and testing concerns

Phase 021 reconciled 37 historical skill files, 104 concerns and all removed checker responsibilities. The [handoff and retained-evidence index](rearchitecture-goals/021-tooling.md#evidence-retention) locate the full source inventory, original conventions, clause dispositions and results. These remain audit evidence, outside routine context. Current owners are reflected in these conventions, the configured checks and the separate agent guidance; assigning an owner does not turn an untested concern into proven automated coverage.
