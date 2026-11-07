# Reiki timer

A client-side timer built with React, TypeScript, Vite and TanStack Router. The app owns its design system, accessible interactions and visual identity; timer state, copy and commands belong to the timer feature.

## Develop and verify

The last verified toolchain is Bun 1.2.17 and Node 24.18.0. Install dependencies and Playwright's matching Chromium, then start the app:

```sh
bun install --frozen-lockfile
bun run test:install
bun run dev
```

Run `bun run verify` before handoff. [CONTRIBUTING.md](CONTRIBUTING.md) explains focused commands, browser setup, evidence and check limits. No maintainer credentials or coding-agent subscription are required.

## Find the owner

- [Repository conventions](docs/conventions.md): component taxonomy, directories, public contracts, brand and runtime boundaries.
- [Timer layout](src/features/timer/screens/timer-layout/timer-layout.tsx): navigation, exit transactions and focus.
- [Timer session](src/features/timer/hooks/use-timer-session.ts): draft, clock, audio lifetime and commands. Pure rules live in the feature's `model/`; browser I/O lives in `services/`.
- [Design system](src/components/design-system/): adapted foundations and theme. Shared app compositions live in `src/components/{atoms,molecules,organisms}/`.

Read the affected declaration and real callers before changing a contract. Documentation explains its meaning; checks establish only their stated guarantees.

## Contributor documentation

[CONTRIBUTING.md](CONTRIBUTING.md) covers checks, review evidence and framework changes. [Repository conventions](docs/conventions.md) explain the current contracts for human contributors; public source declarations and configured tools own their implementation.

The [tooling audit outcome](docs/rearchitecture-goals/021-audit/audit.md) summarizes what changed and what the evidence establishes. Detailed historical evidence is retained locally under ignored `.audit-evidence/` and is not required reading for contributions.

Agent instructions are separate: `AGENTS.md` and `.agents/skills/`. README, CONTRIBUTING and `docs/` are written for humans.
