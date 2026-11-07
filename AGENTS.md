This app uses React, TypeScript, Vite, TanStack Router, and Olyx UI installed through its CLI. Apply the repository's [TanStack guidance](.agents/skills/tanstack/SKILL.md) for the installed packages. The official [Vite documentation index](https://vite.dev/llms.txt) provides focused Markdown references for build and development configuration.

File routes live in `src/routes/`; the Router plugin runs before the React plugin and generates `src/routeTree.gen.ts`. Use `bun run routes:generate` after route changes. The type-check and build scripts generate it automatically. Keep that file generated and outside Biome. Deployments of this client application must serve `index.html` for application routes.

Olyx component entrypoints live in the directory configured by `components.json`. App-owned atoms and molecules live in `src/components/`. Feature screens and their data live in `src/features/`.

Use Bun for installation and the declared development, type-check, and build scripts.
