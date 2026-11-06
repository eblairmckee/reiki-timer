# Behavior tests

Use the existing runner. Reproduce a reported failure before fixing it when practical, then verify the smallest useful interaction before extending the change.

Test rendered behavior through roles, accessible names, labels, and user actions. Use Testing Library's user-event utilities when available. Keep assertions on public behavior and meaningful type contracts so internal refactoring can preserve the tests.

Cover the happy path and the relevant boundaries: validation, empty input, keyboard operation, disabled behavior, reset, async failure, controlled updates, or focus restoration. Await observable state changes and clean up introduced timers, subscriptions, and requests.

For shared React compositions, render two instances to check independent state and label or description IDs. Verify consumer-driven value changes, forwarded refs and native props, and that composed handlers perform a single intended action. Match these checks to the public API and interaction risk.

Use end-to-end tests where component tests cannot verify the integration boundary.

Reference: [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles/).
