# Partial Prefetching and link policy

## Applicability

Use this guidance for a requested adoption or an identified navigation problem. The imported workflow requires Next.js 16.3 or later, an App Router app with Cache Components adopted, and the matching Partial Prefetching APIs. Read the installed version's adoption or optimization guide before changing flags, route exports, or link behavior.

Identify the exact source link, destination, expected ready content, content allowed to wait for navigation, and viewport or intent trigger. Treat two links to the same URL as different contracts when their policies differ. Keep freshness, authorization, and server-request cost within the application's intended behavior.

## Preserve behavior during adoption

Inspect `next/link` wrappers and their consumers, forwarded or conditional prefetch props, and imperative `router.prefetch` calls. Determine effective production behavior. A text match is a candidate for inspection, and a development insight sweep does not cover every imperative prefetch.

Before enabling a new global flag or changing destination and cache behavior, verify the selected legacy contract on a production build. Where the testing API is available, run the unchanged preservation assertions with the flag off. Use the [navigation test contract](navigation-tests.md) to establish trustworthy evidence.

Adopt destinations within the requested rollout using the version's supported route configuration. Preserve the selected existing behavior before adding further prefetched UI. Verify affected links as destinations change, then run the complete in-scope preservation checks before enabling a global flag and removing redundant temporary configuration. Keep deliberate opt-outs intact.

Inspect development insights and the linked diagnostics for URL-dependent reads that prevent a reusable shared shell. Fix the reported boundaries and check affected siblings. Verify automatic prefetching against a production build, where it actually runs, and check manual prefetch paths separately.

## Optimize one navigation

Confirm the shared shell already meets its contract, then measure the selected link policy. Stop when the desired behavior already passes. Keep each source-link, destination, and trigger contract independently testable.

Use the documented prefetch or navigation stage when the task requires it. Verify that deferred reusable work remains cached where intended, and check mutation freshness after changing a cache boundary. Apply the smallest change for the selected link and preserve direct-load behavior and the final page.

Retain a regression test that distinguishes the accepted policy: removing only the optimization restores the original gap while the shell stays available, and reapplying it passes. Treat prefetching as best effort; keep a usable shell when it has not completed. Measure request counts and transferred bytes separately from rendered-readiness assertions.
