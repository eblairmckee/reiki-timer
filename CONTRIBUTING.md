# Contributing

Start with the affected public contract and its consumers. Use the [task entrypoints](AGENTS.md) to find the relevant skill and supporting references. Keep changes scoped to the requested outcome and preserve existing user edits.

## Setup and checks

Follow the [README setup](README.md#develop-and-verify). Browser checks require local-server access and Chromium. Linux hosts may also need `bunx --no-install playwright install-deps chromium`. The editor uses repository Biome configuration; extensions are optional.

Use the [repository verification scope](AGENTS.md#verification-and-handoff) to decide when checks and rendered review apply. See [browser access and test servers](AGENTS.md#browser-access-and-test-servers) for the distinction between the running app, the in-app browser and Vitest's browser suite.

| Change or question | Command | Scope |
| --- | --- | --- |
| Formatting and static rules | `bun run check` | Biome; `bun run check:fix` applies fixes for review. |
| Types or routes | `bun run typecheck` | Generates routes, then checks TypeScript assignability. |
| Theme or paint ownership | `bun run check:colors` | Recognized CSS, script and SVG paints; [coverage limits](.agents/references/quality-conventions.md#color-and-token-ownership). |
| Route changes | `bun run routes:generate` | Regenerates routes. |
| Logic or component behavior | `bun run test:unit` | Happy DOM; append a file or `-t` to focus. |
| Lint/checker policy | `bun run test:tools` | Valid and invalid cases through the configured policy. |
| Native focus/events, layout or resolved styles | `bun run test:browser` | Headless Chromium. Ordinary motion cases explicitly override its reduced-motion default. |
| Complete verification | `bun run verify` | Same entrypoint locally and in CI after lockfile install and browser setup. |

Use `bun run test` for Vitest; `bun test` selects a different runner. Run a useful check once and repeat when a change, failure or unresolved concern warrants it.
