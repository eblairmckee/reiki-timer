# Contributing

Start with the affected public contract and its consumers. [Repository conventions](docs/conventions.md) explain placement and design requirements for human contributors. Keep changes scoped to the requested outcome and preserve existing user edits.

## Setup and checks

Follow the [README setup](README.md#develop-and-verify). Browser checks require local-server access and Chromium. Linux hosts may also need `bunx --no-install playwright install-deps chromium`. The editor uses repository Biome configuration; extensions are optional.

Use focused checks while editing and `bun run verify` before handoff, subject to the user's execution constraints. Verify runs formatting/lint, color policy, route generation, TypeScript, production build and all Vitest projects. Build already checks types and generates routes, so verify does not duplicate them.

| Change or question | Command | Scope |
| --- | --- | --- |
| Formatting and static rules | `bun run check` | Biome; `bun run check:fix` applies fixes for review. |
| Types or routes | `bun run typecheck` | Generates routes, then checks TypeScript assignability. |
| Theme or paint ownership | `bun run check:colors` | Recognized CSS, script and SVG paints; [coverage limits](docs/conventions.md#color-and-styling-ownership). |
| Logic or component behavior | `bun run test:unit` | Happy DOM; append a file or `-t` to focus. |
| Lint/checker policy | `bun run test:tools` | Valid and invalid cases through the configured policy. |
| Native focus/events, layout or resolved styles | `bun run test:browser` | Headless Chromium. Ordinary motion cases explicitly override its reduced-motion default. |
| Complete verification | `bun run verify` | Same entrypoint locally and in CI after lockfile install and browser setup. |

Use `bun run test` for Vitest; `bun test` selects a different runner. Run a useful check once and repeat when a change, failure or unresolved concern warrants it.

## Evidence and handoff

Test observable requirements and plausible failures at the affected boundary. Preserve controlled values, native props/refs, independent instances, cancellation and recovery where promised. Accept valid alternative compositions; an incidental wrapper or a particular live-region mounting strategy is not the contract. Reuse maintained testing libraries and the existing browser adapter before adding infrastructure.

DOM emulation cannot prove real Tab order or layout. Browser fixtures need the app's actual stylesheet and cascade; inspect the cue the contract permits, including color and pseudo-elements. Review affected running states for brand, legibility, wrapping and motion. Axe supplements behavior and perception checks; record incomplete results. Assistive-technology announcements, physical devices and perceptual acceptance need their own evidence when relevant. Do not require generated screenshots or add committed visual baselines without user authorization.

Report what changed, the checks performed and any remaining limits. Distinguish implementation failures, environment failures, accepted exceptions and checks not run. A focused pass does not erase a failed full suite. Respect a request to stop tests or evaluations. Do not stage or commit unless explicitly asked.

## Framework and guidance changes

Route changes use `bun run routes:generate`; typecheck and build also generate `src/routeTree.gen.ts`. Preserve Router-before-React plugin order and generator ownership. Check affected direct navigation and Back/Forward behavior. Production hosting needs an `index.html` fallback; local preview alone cannot establish the host configuration.

Inspect installed declarations and official package documentation for version-sensitive APIs. Optional Query/Start/server examples do not establish installed capabilities or override repository ownership.

Keep the audiences separate: declarations/examples describe public APIs; README, this guide and `docs/` explain the repository to humans; `AGENTS.md` and focused skills instruct agents. Mechanical guarantees belong in types, configuration, scripts and tests. When a convention changes, update its implementation and the relevant human and agent guidance together; agents must not depend on reading the human manual. Preserve attribution and licenses when importing guidance. On metadata changes, `bun run skills:validate .agents/skills` checks structure; review paths, commands and applicability separately. The validator's package-publication keyword warning does not apply to this private app.

For enforcement changes, prefer installed rules and existing passes. Add custom checks only for concrete gaps with acceptable false positives and upkeep. Keep nearby valid and violating regressions; syntax checks do not establish state ownership, meaningful APIs or perceptual quality. Semantic guidance needs decision evidence before claiming improved outcomes. Another evaluation batch is not a prerequisite to an authorized edit. Performance changes require a real contract or measured workload; ordinary native handlers do not require `useCallback`.

## Retained evidence

Generated browser reports are ignored debugging output and can be removed after diagnosis. **`.audit-evidence/` is explicitly retained**, including inventories, scripts, manifests and raw trials; exclude it from routine cleanup. Its [index](docs/rearchitecture-goals/021-tooling.md#evidence-retention) identifies the files and their provenance. Removal requires an explicit user instruction identifying the material. No audit runner or historical corpus is part of normal verification.
