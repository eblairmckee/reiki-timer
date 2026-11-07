# Agent instructions

This is a client-side React, TypeScript, Vite and TanStack Router app. Use Bun and the declared scripts. This file and `.agents/skills/` contain agent instructions. README, CONTRIBUTING and `docs/` are for human contributors; they are not prerequisites for ordinary agent work.

Start with the affected public declaration, implementation and real callers. Load only the relevant skill below. Types, lint and tests establish their stated guarantees; skills guide semantic choices and evidence selection. Do not load the historical audit corpus unless the task calls for it.

## Task skills

| Decision | Skill |
| --- | --- |
| State ownership, Effects, subscriptions, async work, persistence or resource identity | [React lifetime](.agents/skills/react-lifetime/SKILL.md) |
| Shared promotion, atoms/molecules/organisms, controlled APIs, slots or coordinated parts | [React composition](.agents/skills/react-composition/SKILL.md) |
| Native activation, keyboard/focus, forms, cancellation or recovery | [Interaction evidence](.agents/skills/interaction-evidence/SKILL.md) |
| Visual hierarchy, typography, responsive content, surfaces or motion | [Visual design](.agents/skills/visual-design/SKILL.md) |
| Architecture, shared contracts or quality policy | [Maintainer role](.agents/skills/design-system-maintainer/SKILL.md); its matrix selects guidance, checks and accountable judgment |

## Repository boundaries

The adapted Olyx foundations in `src/components/design-system/` are app-owned and configured by `components.json`. Merge additions into that system, preserving public APIs, brand, accessibility and motion; inspect affected callers. Shared app UI lives in `src/components/{atoms,molecules,organisms}/`. The composition skill owns the classification and promotion rules.

Feature UI lives in `src/features/<feature>/components/` and `screens/`, without atomic tiers. Feature `hooks/` own React lifetimes/commands; `state/` owns context; `model/` and `data/` own pure rules/catalogues; `services/` owns I/O. Shared hooks/utilities live in `src/hooks/` and `src/utils/`; app routing/styles live in `src/app/`. Keep CSS, private helpers and focused tests beside their owner. Whole-feature tests stay with the layout; native browser tests live in `test/browser/`.

Shared components, hooks and utilities must not import features; neutral helpers must not import component implementations. Pure models must not import browser services or components. Use populated, concern-named directories; feature components have named implementation files. Shared components may implement in `index.tsx`. Avoid passthrough wrappers/re-exports for internal moves and private system material imports.

## Checks and frameworks

Use `bun run check` for Biome, `bun run typecheck` for types, `bun run check:colors` for static paint ownership, and the relevant `test:unit`, `test:tools` or `test:browser` script. Run `bun run verify` before handoff unless execution is restricted; it runs lint, colors, build/types and all Vitest projects without duplicate compilation. Ordinary tests use `bun run test`, not `bun test`. Respect requests to stop tests/evaluations and report checks not run. Recheck only when a change, failure or unresolved concern warrants it.

Routes live in `src/routes/`; the Router plugin precedes React and owns `src/routeTree.gen.ts`. Run `bun run routes:generate` after route edits; typecheck/build also generate it. Keep it outside Biome and never edit it manually. Check affected direct navigation and history. Production hosting must serve `index.html` for application routes.

For unfamiliar APIs, inspect installed declarations. Use `bun run skills:list` and `bun run skills:load <package>#<skill>` for relevant installed package guidance; optional server/Query examples do not establish app capabilities. The [Vite documentation index](https://vite.dev/llms.txt) covers build configuration. Use strict TypeScript and runtime validation for untrusted data; casts are not validation. Keep normal React escaping; explicit HTML requires a trusted sanitization boundary. Optimize observed workloads and preserve identity where the contract requires it; avoid blanket memoization or new performance dependencies.

## Handoff and guidance changes

Review the diff, report checks and remaining limits, and preserve user edits. Do not stage or commit without explicit authorization. The ignored `.audit-evidence/` directory is retained evidence and excluded from routine cleanup; remove material only when the user explicitly identifies it.

Keep agent decisions in these instructions or a focused skill, human explanations in README/CONTRIBUTING/docs, and mechanical guarantees in types/configuration/scripts/tests. Update both audiences when a convention changes without making agents load human docs. Skill metadata changes use `bun run skills:validate .agents/skills`; review paths, commands and applicability separately. Preserve source attribution. Another evaluation batch requires a concrete question and authorization, not merely a documentation edit.
