# Compiler and code checks

The root [biome.json](../../../../biome.json) owns mechanical lint and formatting policy. Use the pinned root tooling for source files in this workspace, passing the affected paths so a local change stays scoped. From the repository root, `bun run check apps/<app>/src` checks a selected app path; `bun run check:fix apps/<app>/src` applies available safe fixes.

Keep each app's type-check command, compiler version, framework checker, and `tsconfig` with that app. Biome catches syntax and selected code patterns; the compiler establishes assignability, narrowing, generic relationships, and module contracts. Keep type-aware or framework checks at the app when Biome's configured rules do not cover them. Run the app's existing type-check script as well as relevant tests and build checks.

Keep app-specific tooling compatible with supplied code. An app can extend the root Biome configuration with `"extends": "//"` and override the settings it needs. Use app-local configuration for framework-specific policy. Keep existing framework template and style tooling where the shared source-file scope does not apply.

Review fixes before retaining them, and resolve warnings according to the changed behavior. Keep formatter policy in configuration and semantic requirements at their rule owner. Type checks and static accessibility diagnostics complement behavior and keyboard verification.
