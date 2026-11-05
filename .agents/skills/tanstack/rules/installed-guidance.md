# Version-matched package guidance

[TanStack's agent documentation](https://tanstack.com/table/latest/docs/agent-skills) describes skills bundled with installed packages and discovered through Intent. From the target app with Intent configured, run `bun run skills:list`, then `bun run skills:load '<package>#<skill>'` using the matching identifier returned by discovery. Follow its prerequisites and read task-relevant references. Apps without these scripts can read the installed package's `skills/` entrypoint directly, as the documentation supports.

Keep the allowed sources explicit in the owning app's `package.json` under `intent.skills`. Use its locked Intent dependency; discovery and loading do not require global installation, install hooks, or generated instruction catalogs. Keep this group's local contracts separate from package-owned API details so dependency updates also refresh their guidance.

Bundled examples may assume another package manager, framework, or optional integration. Apply the repository's Bun workflow and the target app's actual dependencies. Check installed declarations if a skill's metadata or examples lag its package. An installed Router does not establish TanStack Start, SSR, or a server boundary.

For file-based Router apps, follow the [Vite integration](https://tanstack.com/router/latest/docs/installation/with-vite). Regenerate the route tree before type checking and leave the generated file to its generator. Confirm direct navigation and a production build when routes change. Put application data adapters and route concerns at their feature or route boundary, following the shared [component placement](../../ui-design/rules/component-organization.md).
