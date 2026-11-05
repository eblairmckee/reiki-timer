# Type contracts and boundaries

Use the app's TypeScript configuration and enable strict checking when initializing a new typed app. Keep framework-specific compiler options, module resolution, and generated types with that app.

Name types for public APIs, domain data, and meaningful state transitions. Let straightforward local values retain clear inference. Model mutually exclusive variants with discriminated unions and handle their cases exhaustively. Use generics when inputs and outputs or several fields preserve the same type relationship.

Accept untrusted external data as `unknown` and narrow or validate it at the boundary with the application's existing validation approach. Type assertions do not validate runtime data. Preserve the difference between a missing value, an invalid value, and a failed operation when the contract depends on it.

Use `as const` to preserve literals and `satisfies` to check configuration without discarding inference when the installed compiler supports them. Prefer narrowing to broad casts or non-null assertions. Keep a necessary escape hatch local to its boundary and make its assumption clear. A documented `@ts-expect-error` is appropriate for an intentional negative type test.
