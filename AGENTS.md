This app uses React, TypeScript, Vite, TanStack Router, and Olyx UI installed through its CLI. Apply the repository's [TanStack guidance](.agents/skills/tanstack/SKILL.md) for the installed packages. The official [Vite documentation index](https://vite.dev/llms.txt) provides focused Markdown references for build and development configuration.

File routes live in `src/routes/`; the Router plugin runs before the React plugin and generates `src/routeTree.gen.ts`. Use `bun run routes:generate` after route changes. The type-check and build scripts generate it automatically. Keep that file generated and outside Biome. Deployments of this client application must serve `index.html` for application routes.

Component source, component styles, and shared Olyx tokens live in `src/components/ui/`. Only Button and Switch are currently installed; add other primitives when a feature needs them. Use these app-local components and their installed Base UI APIs when composing interfaces. App-owned atoms live in `src/components/atoms/`; create molecules in `src/components/molecules/` as needed. Feature screens and their data live in `src/features/`.

Use Bun for installation and the declared development, type-check, and build scripts.

Apply the repository's [UI design skill](.agents/skills/ui-design/SKILL.md) for interface changes. It owns theme, foreground styling, typography, and interaction rules. Run `bun run check:tokens` to enforce the theme's ownership of literal colors.
