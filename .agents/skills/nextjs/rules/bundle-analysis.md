# Browser bundle analysis

## Establish evidence

Resolve whether the request is an audit or a change. Choose the affected app, routes, feature, and comparison metric. For supported versions, inspect `next analyze --help` and its export help, then capture or select a uniquely named baseline. Use the app's existing analyzer when the built-in surface is unavailable.

Keep before and after artifacts distinct and scoped to the app. A repeated snapshot name can overwrite evidence. When exporting through a compression pipeline, check every process's exit status and discard partial output on failure; a valid compressed file can still contain an incomplete export.

Read the analyzer schema from the installed Next.js package when using its graph export. Stream large exports instead of loading them into instruction context. Distinguish route-attributed client output, server output, async loaders, and module variants. Build attribution supports size and reachability claims; observed browser timing and transfer savings need runtime measurements.

## Inspect import boundaries

Trace a large or unexpected contribution through exact source importers and all relevant client roots. Check alternate synchronous paths, cycles, module side effects, mount-time preload behavior, and conditions that trigger async imports. Count each emitted contribution once and record unsupported outputs or incomplete graph coverage.

Use community or directed-cut analysis when a broad import graph needs it, documenting the scenario, weights, protected dependencies, and completeness. Validate proposed boundaries against real source and behavior before changing imports.

Check unexpected server-owned dependencies in emitted client code, including async outputs. Confirm actual ownership and surviving contents. Erased type imports, public schemas, browser SDKs, and generated Server Action reference stubs can be legitimate. A filename or stub's presence alone does not establish that server implementation code shipped.

## Change and compare

Prefer a focused lazy boundary for a genuinely optional feature, compatible dependency deduplication, or server rendering for eligible display-only work. Preserve loading, keyboard and focus behavior, browser-required editing, side effects, peer constraints, and hydration. Follow the app's existing dependency policy.

Make one cohesive change and compare the same routes, output class, and metric. Check shared routes as well as the named feature, and exercise affected behavior. Retain an optimization supported by both the measured result and behavior checks. Report exact source owners, observed deltas, and evidence gaps.
