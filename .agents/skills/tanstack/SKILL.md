---
name: tanstack
description: Build or maintain web application routing, data tables, and charts when the target app installs the corresponding TanStack package, using version-matched package guidance.
---

# TanStack application work

Resolve the target app and its installed packages before applying this group. Let the installed declarations and official documentation resolve version-specific APIs.

Keep route and data ownership in the app or feature while shared UI consumes typed contracts. Verify the affected interactions and the target app's generated types, compiler, and production build.

# Version-matched package guidance

Keep the allowed sources explicit in the owning app's `package.json` under `intent.skills`. Use its locked Intent dependency; discovery and loading do not require global installation, install hooks, or generated instruction catalogs. Keep this group's local contracts separate from package-owned API details so dependency updates also refresh their guidance.

Bundled examples may assume another package manager, framework, or optional integration. Apply the repository's Bun workflow and the target app's actual dependencies. Check installed declarations if a skill's metadata or examples lag its package. An installed Router does not establish TanStack Start, SSR, or a server boundary.

For file-based Router apps, follow the [Vite integration](https://tanstack.com/router/latest/docs/installation/with-vite). Regenerate the route tree before type checking and leave the generated file to its generator. Confirm direct navigation and a production build when routes change. 
