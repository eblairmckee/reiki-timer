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

Choose [focused checks](.agents/references/development-workflow.md#check-selection) during edits. Before finishing, follow the [verification and handoff requirements](.agents/references/development-workflow.md#handoff).

## Quality conventions

Before introducing a convention, adding a checker, disabling a rule or changing required verification, [choose enforcement](.agents/references/quality-conventions.md#choosing-enforcement) and assess [costs and remaining judgment](.agents/references/quality-conventions.md#costs-and-remaining-judgment).

Use [static rules/checkers](.agents/references/quality-conventions.md#static-rules-and-custom-checkers) for checking changes, [colors/tokens](.agents/references/quality-conventions.md#color-and-token-ownership) for paint enforcement or token cleanup, [performance](.agents/references/quality-conventions.md#performance-and-resources) for optimization, and [check reliability](.agents/references/quality-conventions.md#check-reliability) for acceptance criteria. Load only the relevant section.

## Changing guidance

Use [convention placement](.agents/references/guidance-maintenance.md#convention-placement) when editing AGENTS, references or skills, and [validation and efficacy](.agents/references/guidance-maintenance.md#validation-and-efficacy) when assessing their structure or benefit.
