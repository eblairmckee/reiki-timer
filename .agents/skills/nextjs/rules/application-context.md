# Application and version context

## Resolve the app

Identify the app owning the requested files. Confirm Next.js from that app's package manifest and executable scripts or framework configuration. Resolve the installed `next` package from that app's working directory, accounting for its Bun lockfile and workspace dependency boundaries. Use the resolved version rather than a dependency range, directory name, or sibling app's installation.

Check whether the app uses the App Router, Pages Router, or both. Resolve its actual route directories and custom source layout. Keep router-specific APIs within the matching routes. If both a top-level and a source-prefixed route directory exist, establish which is built before modifying either.

Keep the app's working directory, environment, port, browser session, and build output distinct from neighboring apps. Inspect existing app instructions and tooling before running commands.

## Read matching documentation

Prefer documentation shipped with the resolved Next.js package under `next/dist/docs/` when available. Discover the relevant files by topic; numbered paths can change. Use existing app-local documentation when it matches the installed version. Otherwise consult official documentation for that version.

Check the installed CLI's help and types before using analyzer flags, route configuration, or testing APIs. Framework errors link to specific message documentation; read that guidance for the reported error. A current online example can describe APIs that an older app lacks.

Keep the app's supported version and bundler unless the requested work includes changing them. The imported Cache Components and Partial Prefetching workflows target Next.js 16.3 or later and require their documented feature flags and testing APIs. Check those conditions at use time. Older apps can still use the applicable routing, rendering, and verification guidance.
