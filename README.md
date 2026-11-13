# Reiki timer

A Reiki timer built with React, TypeScript, Vite and TanStack Router. Customized olyx-ui design system. 

## Develop and verify

The last verified toolchain is Bun 1.2.17 and Node 24.18.0. Install dependencies and Playwright's matching Chromium, then start the app:

```sh
bun install --frozen-lockfile
bun run test:install
bun run dev
```

Follow the [repository verification scope](AGENTS.md#verification-and-handoff) to decide which checks apply before handoff. [CONTRIBUTING.md](CONTRIBUTING.md) explains focused commands, browser setup, evidence and check limits.
