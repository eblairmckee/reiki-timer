# Production navigation regression tests

## Match the app and build

Use the app's existing production-mode browser test setup. When the task needs `instant()`, confirm `@next/playwright` is compatible with the installed Next.js release and follow that version's public testing API. Record the app URL, build, test identity, relevant flags, and data needed to reproduce the behavior.

Automatic prefetching and the imported readiness assertions require a production-like build. Enable `experimental.exposeTestingApiInProductionBuild` only in an isolated test build that supports it, keeping it disabled for real production traffic. Set that condition during the build, merge it with existing configuration, and rebuild before measuring. Confirm the test is running against the intended artifact with the changes under review and not an older server on the same port.

## Establish a real contract

First drive the exact navigation without the testing lock and confirm the expected destination, query, and visible content for the test user. Then repeat with `instant()` to determine which meaningful shell or prefetched UI is available while request-time work is held. After release, verify the complete content.

Use a real link click for a client-navigation contract and a direct visit for a direct-load contract. For an intent-triggered link, exercise its real hover or focus inside the testing scope; for a viewport policy, preserve that trigger. Keep the authentication, feature flags, locale, and data consistent across comparisons.

Confirm that the testing API was compiled into the measured build. When the route has deferred content, also prove lock engagement with a meaningful region that is absent under the lock and appears after release. An empty shell, absent test data, a redirect, a hidden marker, or a disabled testing API can produce misleading results. Cookie or session reads alone may not demonstrate lock engagement.

## Retain useful evidence

For an optimization, establish the current gap before editing. If the complete desired contract already passes, preserve the behavior and report that result. After fixing it, remove only the optimization in an isolated comparison, confirm the intended gap returns, then restore the change and require the passing result again. Preserve unrelated working changes throughout the comparison.

Keep the final positive regression test and remove temporary diagnostic scaffolding. Assert meaningful UI under the lock, deferred UI after release, and parity of completed content and interactions. Verify cache mutation freshness separately where applicable.

`instant()` checks readiness rather than elapsed time, request counts, or private protocol stages. Use its public API and visible UI contracts, and collect performance or network measurements separately when needed. When a required test capability or environment is unavailable, report the limitation and the behavior actually checked.
