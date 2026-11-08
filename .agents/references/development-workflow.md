# Development and verification

## Check selection

Use the declared Bun scripts and choose checks for the affected guarantee. Recheck when a change, failure or unresolved concern warrants it. For checkout setup, use `bun install --frozen-lockfile`; browser setup uses `bun run test:install` and requires local-server access and Chromium.

| Need | Command | Scope |
| --- | --- | --- |
| Formatting/static feedback | `bun run check` | Biome; review fixes from `bun run check:fix`. |
| Public types or routes | `bun run typecheck` | Route generation and TypeScript assignability. |
| Paint ownership | `bun run check:colors` | Recognized static paint contexts; see [color policy limits](quality-conventions.md#color-and-token-ownership). |
| Logic/component behavior | `bun run test:unit` | Happy DOM; append a file or `-t` for focused work. |
| Rule/checker behavior | `bun run test:tools` | Node policy regressions. |
| Native focus/events, layout or resolved styles | `bun run test:browser` | Chromium; ordinary-motion cases override the suite's reduced-motion default. |
| Complete verification | `bun run verify` | Check, colors, build with types/routes, then all tests; no duplicate compiler/generator pass. |

Ordinary tests use `bun run test` (Vitest); `bun test` selects a different runner. DOM emulation cannot establish actual Tab order or layout. Use the interaction or visual skill for affected behavior and rendered review. Axe is supplementary; report incomplete checks and uninspected conditions.

## Routes and generated files

Keep file routes in `src/routes/` as thin adapters to feature screens. The Router plugin precedes React and owns `src/routeTree.gen.ts`. Run `bun run routes:generate` after route changes; typecheck and build also generate it. Keep that file outside Biome and never edit it manually.

Check affected direct navigation and Back/Forward behavior. Production hosting must serve `index.html` for application routes; local preview alone cannot establish host configuration.

## Installed packages

Inspect installed declarations for unfamiliar or version-sensitive APIs. Discover package guidance with `bun run skills:list`, then load only the relevant entry using `bun run skills:load <package>#<skill>`. Optional Query/Start/server examples do not establish app capabilities or override repository ownership.

Use the [Vite documentation index](https://vite.dev/llms.txt) for build configuration. Server/RSC/Next/SWR examples are inapplicable as written here; client techniques remain eligible for an actual requirement. Do not add a dependency merely to make an old example applicable.

## Handoff

Run `bun run verify` before handoff unless the user restricts execution. Respect stop requests; report checks not run instead of manufacturing a passing status. Review the diff and describe changes, verification and remaining limits. Distinguish implementation failures, environment failures and accepted exceptions; a focused pass does not erase a failed full suite.

Remove disposable generated browser reports after diagnosis, excluding explicitly retained evidence. Do not turn screenshots into a mandatory review gate or introduce committed visual baselines without user authorization. Brand, device/assistive-technology and release acceptance require their own evidence; automated results do not establish them.
