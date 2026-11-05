# Runtime verification

Start or reuse the target app through its declared development script. Confirm its actual URL, port, and project before interacting, and preserve its existing bundler. Use an available browser or component-preview tool to exercise the changed flow.

When the installed Next.js version exposes `/_next/mcp` and an appropriate client is available, discover its current tools and confirm their project metadata refers to this app. Use available compilation, route, error, and log diagnostics to narrow investigation. Tool availability depends on the version and bundler; use the app's existing diagnostics when a tool is unavailable.

After an edit, check compilation and server errors, then drive the real interaction and inspect the resulting UI, browser errors, and relevant network behavior. Use React introspection when it helps establish a rendering or boundary change and the browser tooling supports it. Wait for observable readiness or the exact destination and content.

Reconcile stale or misdirected sessions before diagnosing an application failure. Recheck the actual app URL and take fresh browser state after navigation. Keep authentication and storage scoped to the intended test session, especially when several apps run together.

Preserve the development server's generated output while it runs. Use a separate configured output directory or stop the conflicting process before a production build would overwrite that output. A passing development compile establishes different evidence from a browser interaction or a production navigation test; report the checks actually performed.
