# Table composition and data ownership

Compose the target app's selected table primitives in a reusable molecule. Accept the feature-owned, typed TanStack table instance; keep domain schemas, transport messages, requests, and response mapping outside shared UI. Preserve column accessor inference and stable domain row IDs. Format protobuf values such as bigint or timestamps at the column or adapter boundary without flattening messages into untyped objects.

Let the feature choose processing ownership. Client models need the complete relevant dataset. Server pages use the matching manual modes, controlled state, and response counts; manual modes bypass local processing and do not fetch data. Map pagination, sorting, and filter state into the request schema at the data boundary. Keep request dependencies complete and reset or clamp the page when the result set changes. For cursor APIs, keep token history in the feature instead of treating an opaque cursor as an offset.

Support unknown totals without inventing a page count. Preserve grouped headers, visible cells, native table semantics, an accessible name, keyboard sort controls, and distinct loading, failure, and empty results. Optional feature APIs require their features to be registered. Put reactive subscriptions at the rendering boundary when the stable instance is passed to a child; a snapshot read alone does not subscribe React.

Use the installed package guidance for feature registration, state ownership, and rendering APIs. Follow the shared [behavior checks](../../accessible-testing/rules/behavior-tests.md), including a server page that must not be processed again and a consumer-driven state change when those contracts apply.
