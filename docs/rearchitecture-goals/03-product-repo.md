# Product repo: audit feature and app ownership

Use the [session protocol](00-prerequisites.md#session-protocol), [maintainer principles](../../.agents/skills/design-system-maintainer/SKILL.md) and [quality ownership matrix](../../.agents/skills/design-system-maintainer/references/quality-ownership.md). Read the accepted system and tooling decisions relevant to the task. Start from the current timer and its consumers; reconsider earlier extraction proposals through the same ownership test as any new abstraction.

```text
/goal Execute docs/rearchitecture-goals/03-product-repo.md with GPT-6.1 Sol at High effort as the session orchestrator. Follow the session protocol in docs/rearchitecture-goals/00-prerequisites.md. Audit and rearchitect app/feature boundaries and product quality ownership using the maintainer persona and matrix. Preserve intended timer behavior while making future feature work clear and maintainable.
```

## Audit and implement

- [ ] Trace routes, state, persistence, side effects, components, styles and utilities to their actual owners. Keep product concepts near their consumers and routes focused on routing. Decide when a capability belongs in a feature, app composition, shared domain or design system.
- [ ] Verify feature-facing imports and styling hooks against the accepted system contracts. Resolve reliance on private helpers. Audit selection controls, timelines and other compositions for reuse; compare local ownership, composition and extraction without presupposing a new component or directory.
- [ ] Re-establish current behavior requirements from user intent, source and real flows. Use the areas below to find risk, then choose the evidence and tool for each requirement through the matrix. Record intentional behavior changes for review.
- [ ] Audit component, feature and browser tests for durable guarantees, duplication, implementation coupling and execution cost. Keep compatibility cases for data supported app versions can still load. Reassess fixtures whose only consumer was a completed migration.
- [ ] Evaluate realistic feature-only changes, shared UI decisions and a behavioral regression in fresh chats. Compare before/after owner discovery, correctness, required context and cost. Improve the source of a wrong turn and test a held-out task.
- [ ] Reconcile root instructions and other guidance with the accepted architecture. Remove stale routing and duplicated policy; justify retained instructions and count required references.

## Behavior areas to inspect

- Timer setup, phase ordering and bounds; pointer/keyboard dial interaction, preview, commit and cancellation.
- Chime selection and repeat preview, cue availability, toggle preferences, scheduling and audio races.
- Start, pause, resume, edit, restart, early finish and expiry; elapsed time and phase/color continuity.
- Draft restoration, saved settings, refresh and browser history; save versus leave-without-saving behavior.
- Summary/timeline content and disclosure; named controls, keyboard navigation, focus return and touch behavior.
- Responsive settings and playback, portal typography, atmosphere/palette/ink behavior, dimming and reduced motion. Distinguish modeled/fallback evidence from actual visual behavior.

Existing source/tests and the optional history pointers in Phase 00 provide detailed examples. Exact old pixel values, wording, filenames and assertions require a current contract justification before becoming policy.

## Acceptance

The timer demonstrates the accepted shared contracts without duplicating their ownership. App/feature boundaries support plausible future work with bounded context and justified reuse. Selected checks protect intended product behavior at sustainable cost; unresolved visual or semantic decisions have an accountable owner.

## Handoff and cleanup

Record the accepted app/design-system baseline, verification and limits, public usage examples and remaining decisions for Phase 04. User acceptance starts contribution-readiness work. End with the [cleanup handoff](00-prerequisites.md#handoff-and-cleanup), including temporary consumer examples and migration-only tests. Do not stage or commit unless explicitly asked.
