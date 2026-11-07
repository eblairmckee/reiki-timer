# UI and design: audit the shared system

Use the [session protocol](00-prerequisites.md#session-protocol), [maintainer principles](../../.agents/skills/design-system-maintainer/SKILL.md) and [quality ownership matrix](../../.agents/skills/design-system-maintainer/references/quality-ownership.md). Reassess the current system from its consumers. Previous promotions and passing checks are starting evidence to inspect when relevant.

```text
/goal Execute docs/rearchitecture-goals/01-ui-and-design.md with GPT-6 Astra at Extra High effort as the session orchestrator. Follow the session protocol in docs/rearchitecture-goals/00-prerequisites.md. Audit and rearchitect the current design system using the maintainer persona and quality ownership matrix. Establish reusable, discoverable contracts and justify the quality owners with task evidence and measured tradeoffs.
```

## Design intent

The app-owned system is configured by `components.json` and lives in `src/components/design-system/`. Its adapted Olyx components are maintained product infrastructure; merge new upstream capabilities while preserving established contracts, brand, motion and accessibility. The timer supplies the initial visual language. Generic system components, tokens, props and utilities take reusable names without timer vocabulary. Product and Reiki-domain decisions stay with their actual consumers.

Frosted treatment is the default, with inset as a variant. Shared dialog styling should express the app's glass treatment where appropriate. Audit expandable actions and disclosure as reusable interaction/composition patterns, including their relationship to button groups and collapsible sections. The current shape of those APIs remains open to improvement.

## Audit and implement

- [ ] Trace public components, parts, slots, defaults, variants and extension points through real callers. Identify missing capabilities, redundant layers and private dependencies. Establish supported feature imports and deliberate compatibility boundaries.
- [ ] Audit tokens, CSS/JavaScript motion, shared styles, hooks and utilities for coherent ownership and reuse. Compare what independent consumers need to change together. Preserve justified differences; choose shared abstractions from actual need.
- [ ] Make public contracts discoverable through types, meaningful names, defaults, prop/slot/callback JSDoc and useful source examples. Include accessible naming, interaction responsibilities and callback timing. Preserve platform and upstream contracts. Test whether callers understand them before adding prose or naming/documentation heuristics.
- [ ] Derive visual, interaction and accessibility acceptance from intended behavior. Cover relevant focus, keyboard, pointer, disabled/selected states, reduced motion, material contrast and responsive composition. Identify who owns each guarantee using the matrix, then implement the chosen improvements.
- [ ] Audit existing system and browser tests against those guarantees. Examine fixed pixels, private selectors, duplicated interactions and implementation-mirroring helpers. Distinguish fallback behavior, numerical contrast models and actual rendering evidence. Retain, move, replace or retire cases based on demonstrated value and cost.
- [ ] Evaluate discovery with realistic caller tasks: an unrelated composition, an existing capability and a justified extension or restyle. Compare the same prompts before/after changes using the shared protocol, include held-out and unrelated tasks, and improve the owning artifact when agents make a wrong turn.

## Acceptance

A feature can discover and use supported system contracts with bounded context. Shared capabilities work for independent consumers while product choices stay local. Selected quality owners demonstrate the intended guarantees and expose their limits. Record why any added rule, test, abstraction or instruction earns its ongoing cost, and remove superseded material. Leave hosted owner-review activation for Phase 04.

## Handoff and cleanup

Pass the public boundaries, accepted design decisions, verification limits and unresolved ownership questions to tooling and product audits. Record user acceptance separately from automated results. End with the [cleanup handoff](00-prerequisites.md#handoff-and-cleanup), including actual temporary artifact paths. Do not stage or commit unless explicitly asked.
