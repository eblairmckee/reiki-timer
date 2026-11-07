This app uses React, TypeScript, Vite, and TanStack Router. The official [Vite documentation index](https://vite.dev/llms.txt) provides focused Markdown references for build and development configuration.

Apply the [maintainer role](.agents/skills/design-system-maintainer/SKILL.md) for architecture, shared contract and quality policy decisions. For routine work, use the affected public contracts and their checks. Keep brand and accessibility requirements explicit. Prefer installed Biome rules and TypeScript contracts for static guarantees.

File routes live in `src/routes/`; the Router plugin runs before the React plugin and generates `src/routeTree.gen.ts`. Use `bun run routes:generate` after route changes. The type-check and build scripts generate it automatically. Keep that file generated and outside Biome. Deployments of this client application must serve `index.html` for application routes.

The app-owned design system lives in `src/components/design-system/`, configured by `components.json`, and includes adapted Olyx components. Merge CLI additions and upstream updates into the existing system, preserving its public APIs, brand styling, motion and accessibility behavior. Verify dependent components and callers. Shared app atoms, molecules and organisms live in `src/components/{atoms,molecules,organisms}/`. Feature UI uses `src/features/<feature>/components/` and `screens/`, with hooks, state, pure model/data and I/O services separated by concern. Shared hooks/utilities live in `src/hooks/` and `src/utils/`; app routing/styles live in `src/app/`. Follow the [organization and state-ownership conventions](docs/conventions.md#product-organization-and-shared-component-taxonomy); keep tests/styles/private helpers with their owner and shared code independent of features.

Use Bun for installation and the declared development, type-check, and build scripts.

Use the [contributor workflow](README.md) for check selection and setup. Run `bun run verify` before handoff; use focused checks during edits. Ordinary tests use Vitest through `bun run test`.
