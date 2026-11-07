# Reiki timer

Client-side React, TypeScript, Vite and TanStack Router application. Shared UI owns brand, accessible interaction and material behavior; timer data, copy and commands belong to the feature.

## Develop and verify

The verified toolchain is Bun 1.2.17 and Node 24.18.0. Install Bun and Node, then use the committed lockfile:

```sh
bun install --frozen-lockfile
bun run test:install
bun run dev
```

Browser installation downloads Playwright's matching Chromium; Linux hosts may also need `bunx --no-install playwright install-deps chromium`. No maintainer credentials or coding-agent subscription are needed. Browser tests start a local server, so the environment must permit local listening and launching Chromium.

Run `bun run verify` before handing off a change or requesting review. It runs formatting/lint, color ownership, route generation, TypeScript, the production build and all test projects. Build includes the compiler, so verify does not repeat typecheck or route generation. Generated `src/routeTree.gen.ts` belongs to the Router generator and stays outside Biome.

| During a change | Command and guarantee |
| --- | --- |
| Static edits / editor feedback | `bun run check`; `bun run check:fix` applies fixes for review. Biome does not replace TypeScript. |
| Public types / route edits | `bun run typecheck`; generates routes before checking assignability. |
| Color or theme edits | `bun run check:colors`; static color ownership outside the theme. See the checker for its scope and runtime limits. |
| Pure logic / component behavior | `bun run test:unit`; append a file or `-t` for focused work. Happy DOM cannot establish actual Tab order or layout. |
| Tooling changes | `bun run test:tools`; parsed policy regression cases. |
| Focus, layout, resolved styles, preferences | `bun run test:browser`; uses installed headless Chromium. Normal-motion cases override the suite's reduced-motion default. |
| Complete local or CI verification | `bun run verify`; no hosted service required. CI should run lockfile install, browser setup, then this same command. Hosted review activation is a separate owner decision. |

Use `bun run test`, which invokes Vitest. `bun test` invokes a different runner. The editor uses the repository Biome configuration; run test commands in its terminal. Editor extensions are optional.

## Contracts and evidence

The [repository organization conventions](docs/conventions.md#product-organization-and-shared-component-taxonomy) define placement and state ownership. `src/app/` owns routing/global styles; thin file routes select feature screens. Shared app atoms/molecules/organisms live beside the adapted design system, while `src/hooks/` and `src/utils/` own neutral React and infrastructure helpers. Feature components carry product meaning and have no atomic tiers.

The timer's [layout](src/features/timer/screens/timer-layout/timer-layout.tsx) owns route/exit transactions and focus. Its [session hook](src/features/timer/hooks/use-timer-session.ts) owns the single draft, clock, audio lifetime and commands; audio prepares during a user gesture, and a pending clock starts only after the layout accepts the exit. Pure [configuration](src/features/timer/model/timer-config.ts), [session](src/features/timer/model/timer-session.ts) and [timeline](src/features/timer/model/timer-timeline.ts) models own defaults, migration and calculations; [storage](src/features/timer/services/timer-storage.ts) owns browser reads/writes and tab recovery. A preference starts with the configuration contract and its actual UI consumers. A storage-format change also reaches storage compatibility tests. Save is explicit; unsaved tab recovery never overwrites saved preferences. Another feature owns its own state and uses a sibling route outside the timer layout.

Reuse [Choicebox](src/components/molecules/choicebox/index.tsx) for controlled option activation, [Timeline](src/components/molecules/timeline/index.tsx) for caller-formatted sequences and [SummaryList](src/components/molecules/summary-list/index.tsx) for keyed informational content. These molecules own no selection/workflow state. [CyclingAtmosphere](src/components/organisms/cycling-atmosphere/index.tsx) coordinates a palette lifecycle with explicit state modes. Product data/copy/actions stay in the feature; call shared APIs directly unless a feature adapter performs meaningful domain interpretation. Colocate CSS, private helpers and focused tests; layout tests cover whole-feature flows and browser tests cover native interaction.

Trace the affected public API and real callers before changing shared behavior. Prefer types/defaults and installed lint rules for static guarantees. Keep JSDoc beside public props/slots/callbacks; it explains meaning, accessible naming and activation timing. Tests prove observable behavior, including controlled `false`/`0`/empty values, multiple instances, native props/refs and composed activation where promised. Choose cases for the affected contract, including failure and recovery; a passing suite does not prove an untested case.

Hook lint checks call order and dependency syntax. The feature owner still reviews the source of truth, event-versus-Effect choice, subscription cleanup, stale async results and storage failures. Validate runtime inputs as `unknown`; a cast is not validation. Use a `never` check for exhaustive union handling when the compiler can express it; a default switch branch alone does not establish exhaustiveness.

Use Chromium for actual focus containment/exclusion, browser event behavior, resolved CSS and layout. Axe supplements keyboard and perception checks; record incomplete results. Inspect affected rendered states in the running app for brand, legibility, wrapping and motion. Physical devices, screen-reader announcements and arbitrary GPU/theme combinations require their own evidence. Generated browser attachments/reports are ignored debugging output; remove them after diagnosis. Do not introduce visual snapshot baselines without owner approval.

Theme colors live in `src/components/design-system/styles/theme.css`; consumers use semantic references. Preserve `currentColor`, transparency, platform colors and theme-derived renderer values. The static checker covers parsed CSS paints and recognized script/SVG paint contexts, including unique local constant aliases. Computed/cross-module paints, numeric renderer channels and opaque custom-property aliases need review. Unsupported XML syntax fails visibly. The checker cannot prove runtime color provenance, perceptual contrast or token liveness. Review unused-token candidates against production reads, aliases and dynamically constructed palettes before removing them; findings are advisory.

## Framework and guidance changes

Routes live in `src/routes/`; run `bun run routes:generate` after editing them. The Router Vite plugin precedes React. Check direct navigation and Back/Forward for affected views; production hosting must return `index.html` for application routes. A local preview cannot prove a hosting provider's fallback configuration.

For unfamiliar version-sensitive Router APIs, inspect installed declarations and discover package guidance with `bun run skills:list`, then load only the relevant entry using `bun run skills:load <package>#<skill>`. Package examples may mention optional Query/Start/server features; use only installed capabilities and preserve app ownership. Their instructions do not override repository contracts or authorization.

Routine work starts from affected source contracts and diagnostics. Apply the maintainer role for architecture, shared-contract or quality-policy decisions as routed by [AGENTS.md](AGENTS.md). Before adding recurring guidance, test the residual decision failure with matched fresh tasks, repeat failures and include held-out/unrelated tasks. Check metadata, links, commands and attribution separately from whether instructions improve decisions. Performance recipes require measured workloads; avoid blanket memoization, package replacement or structural churn.

On skill metadata changes run `bun run skills:validate .agents/skills`. This maintained validator checks structure; humans still verify referenced paths, commands, applicability and outcomes. Its package-publication keyword warning does not apply to this private app.
