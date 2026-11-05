# Cache Components and the static shell

## Applicability and adoption

Use this workflow for requested Cache Components adoption or an identified shell or caching problem in an App Router app. Confirm the installed version supports the specific configuration and validation APIs; the imported workflow assumes Next.js 16.3 or later. Read the matching migration and caching documentation before changing configuration. Pages Router routes keep their own behavior.

Confirm the application runs with the environment needed for the affected routes. Inspect existing cache boundaries, rendering requirements, shared layouts, and legacy route or experimental configuration. Translate incompatible options using the version's migration guide. Preserve the requested rollout scope and the behavior of routes that currently require static rendering.

Use a supported codemod only for the intended source directory and inspect its result. A successful exit with zero affected files does not establish adoption. Review changes alongside existing work and validate the app afterward.

## Resolve blocking work

Work through shared layouts and affected routes from their common owners downward. Temporary opt-outs can mask ancestor or descendant validation, so confirm the complete feature rather than one passing layout. Keep a remaining opt-out only for an intentional rendering requirement, with the reason at its owner.

For each blocking read, follow the actual framework diagnostic. Move request-time data into a focused Suspense boundary when the surrounding UI can render independently. Forward parameter promises to the appropriate child where the version supports that pattern. Keep nondeterministic and request-sensitive work in supported boundaries.

Cache existing work only when its inputs, authorization, lifetime, and invalidation contract permit reuse. Preserve required access checks and redirects. Use the existing loading UI and keep a useful shell at the supported viewport sizes; a partial-prerender route label does not establish what users can see.

## Optimize and verify

For an identified shell delay, define the meaningful UI expected before request-time work completes. Use the [navigation regression workflow](navigation-tests.md) when the app supports its testing API, and preserve the route's completed content, ordering, redirects, focus, and input state.

After changing a shared boundary, check affected sibling routes. Run the production build and verify that loading fallbacks resolve in the browser. When a cache can be changed by a mutation, populate it, mutate through the real application path, and confirm the next read updates. Readiness checks and mutation freshness establish separate contracts.
