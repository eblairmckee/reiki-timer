# Repository guidance

This is a client-side React, TypeScript, Vite and TanStack Router app. Use Bun and the declared scripts. Start with the affected source contract and real callers; read only the relevant linked sections and skills. Skills and their supporting references are the source of truth for conventions; this file routes to the relevant guidance.

## Organizing code and public APIs

Before adding or moving code, use [placement](.agents/references/code-organization.md#placement) and [dependency boundaries](.agents/references/code-organization.md#dependency-boundaries). For public types or untrusted inputs, use [contract boundaries](.agents/references/code-organization.md#public-contracts-and-runtime-data).

For new UI or changes to its consumers, composition or state responsibility, use [UI promotion](.agents/skills/ui-promotion/SKILL.md) to decide whether its home should change. Use [React composition](.agents/skills/react-composition/SKILL.md) for atomic contracts, controlled APIs, slots and coordinated parts.

## State, interaction and appearance

- State ownership, Effects, subscriptions, async work or resource identity: [React lifetime](.agents/skills/react-lifetime/SKILL.md).
- Native activation, keyboard/focus, forms, cancellation or recovery: [Interaction evidence](.agents/skills/interaction-evidence/SKILL.md).
- Visual hierarchy, typography, responsive content, surfaces or motion: [Visual design](.agents/skills/visual-design/SKILL.md).

## Routes and framework integration

Use [routes and generated files](.agents/references/development-workflow.md#routes-and-generated-files) for route changes and [installed packages](.agents/references/development-workflow.md#installed-packages) for unfamiliar APIs or build configuration.

## Verification and handoff

The following scope rules apply to every session in this repository and take precedence over unconditional verification or rendered-inspection steps in linked skills, references and other docs.

- **Automatic visual review requires TSX edits in the current turn.** Trigger it only when the agent adds, modifies, renames or deletes a `.tsx` file during that turn. Use the turn-start state as the baseline; pre-existing staged/unstaged changes, previous turns and reading TSX files do not count. Planning, discussion, read-only review and edits confined to Markdown, CSS, `.ts` or configuration do not trigger automatic visual review. Explicit requests to inspect the UI or diagnose browser access remain actionable without TSX edits.
- **Do not run full verification just because a turn is ending.** Planning, discussion, read-only review and documentation/guidance-only edits do not require `bun run verify` or runtime tests. For documentation/guidance edits, review the diff, links, applicability and consistency; validate skill metadata only when changed. Explicit requests to run checks or diagnose tooling remain actionable without source edits.
- For implementation, configuration or test changes, choose [focused checks](.agents/references/development-workflow.md#check-selection) during edits and follow the [handoff requirements](.agents/references/development-workflow.md#handoff). Automated browser tests are separate from automatic visual review. Repeat checks or rendered review only after further relevant changes or for an unresolved finding.

### Browser access and test servers

- For rendered review, use the in-app browser with the user's already-running dev server (normally `http://localhost:5173`). Check the current session's browser connection and tabs; a tab in another conversation does not establish access here. Do not start a second dev server or run browser tests just to view the app.
- `bun run test:browser` runs Vitest's Chromium project, which starts its own test server and Playwright-managed Chromium. It does not reuse the app dev server or the in-app browser. `bun run verify` includes this suite; a running dev server cannot satisfy its separate listening/launch permissions.
- Diagnose these paths independently. A test-server `listen EPERM` is a permission failure, not evidence that the app server is down, the port is occupied or the in-app browser is unavailable. A browser-session routing/connection failure is a separate access problem. Do not repeatedly retry unchanged permission failures, replace the user's server, change ports as a permissions workaround or weaken tests to obtain a pass.
- Report confirmed blockers prominently when encountered, naming the affected path and exact error; continue independent work. Distinguish rendered review, automated tests and checks not required for the task. Do not repeat an old verification blocker in unrelated planning or documentation handoffs.

## Quality conventions

Before introducing a convention, adding a checker, disabling a rule or changing required verification, [choose enforcement](.agents/references/quality-conventions.md#choosing-enforcement) and assess [costs and remaining judgment](.agents/references/quality-conventions.md#costs-and-remaining-judgment).

Use [static rules/checkers](.agents/references/quality-conventions.md#static-rules-and-custom-checkers) for checking changes, [colors/tokens](.agents/references/quality-conventions.md#color-and-token-ownership) for paint enforcement or token cleanup, [performance](.agents/references/quality-conventions.md#performance-and-resources) for optimization, and [check reliability](.agents/references/quality-conventions.md#check-reliability) for acceptance criteria. Load only the relevant section.

## Changing guidance

Use [convention placement](.agents/references/guidance-maintenance.md#convention-placement) when editing AGENTS, references or skills, and [validation and efficacy](.agents/references/guidance-maintenance.md#validation-and-efficacy) when assessing their structure or benefit.
