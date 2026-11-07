# Tooling: eliminate duplicate framework guidance

Start a fresh chat after UI and design. Read the [lint and test evidence](00-prerequisites.md#handoff) and the [UI handoff](01-ui-and-design.md#handoff), including the completed [editor and naming checks](01-ui-and-design.md#public-api-follow-up-for-outside-contributors). When consolidating tooling, rerun the UI phase’s [style ownership and behavior checks](01-ui-and-design.md#quality-checks-and-enforcement).

Begin with the [Phase 01 cleanup](01-ui-and-design.md#cleanup-after-user-verification) once the user has verified its goal. Record what was removed, moved and deferred before taking the Phase 02 baseline.

```text
/goal Execute docs/rearchitecture-goals/02-tooling.md with GPT-6.1 Sol at High effort as the session orchestrator. Minimize framework, language, and skill-maintenance guidance using verified lint, types, package guidance, and tooling. Prove each replacement and record the outcome of removing each residual rule.

Delegate independent work when it saves time or cost. Use GPT-6 Luna at High effort for inventories, reference tracing, and collecting fixture results. Use GPT-6.1 Sol at Medium effort for bounded implementation or debugging.
Run simple commands directly. Keep architecture decisions, judgments about rule removal, integration, and final verification with the orchestrator.
For before/after skill evaluations, run the same task prompts in separate fresh GPT-6.1 Sol chats at Medium effort with delegation off in both runs.
Use the in-app browser with the already running dev server for manual visual verification only when a change affects rendering or leaves an unresolved visual question. Scope inspection to the affected views and states.
Do not stage or commit any changes unless I explicitly ask. Include this constraint in the session handoff.
```

## Baseline at `1667bd1`

| Skill | Entrypoints | Rule files | Total files | Words |
| --- | ---: | ---: | ---: | ---: |
| react-best-practices | 1 | 10 | 11 | 12,933 |
| typescript | 1 | 2 | 3 | 455 |
| tanstack | 1 | 0 | 1 | 216 |
| skill-maintenance | 1 | 4 | 5 | 689 |
| **Total** | **4** | **16** | **20** | **14,293** |

Count complete Markdown files using `LC_ALL=C wc -w`, including successors and newly mandatory references. Try removing each skill in full. Record what a fresh agent reads and decides when it can use the installed tools and package guidance directly.

## Checklist

- [ ] **Measure before removing.** Try a React state decision, a hook dependency mistake, a TypeScript contract, a route edit, and a skill-maintenance request in fresh chats. Record task outcome, skills and files actually opened, words loaded, and any unnecessary invocation.
- [ ] **Audit every section.** Keep a ledger in this document with source section, intended behavior, enforcement owner, fixture or evidence, and disposition: fully enforced, partially enforced, inapplicable, or judgment-based. Use the prerequisite matrix. Before deleting anything attributed to lint, establish that the normal configuration catches the bad case and accepts its nearest valid case. Preserve the uncovered portion of a partial match until separately evaluated.
- [ ] **Prefer executable or version-matched owners.** Test compiler and public type contracts, file-route generation and build checks, and the installed TanStack package guidance. Retire Next.js server and SWR guidance for this client app. Preserve required attribution for imported material. Evaluate each remaining state, effect, composition, and performance decision on a representative task.
- [ ] **Test full-skill removal, including skill maintenance.** Where a task fails, first improve its existing owner. Retry the failed prompt and nearest negative, then a held-out paraphrase. Keep a narrowly scoped instruction only when it fixes a repeatable miss. Trial a hook only if the trace shows a deterministic check being skipped. Compare it against the same task and an unrelated task before adopting it.

### Review the permanent checks

- [ ] Decide rule by rule which checks should run during development, on a PR, when tooling changes, or only for this migration. Use an actual failing change and its nearest valid case to compare alternatives. Record missed failures, false positives, maintenance cost (including parser upgrades), and elapsed time. Put the recommendation in the handoff before adopting the steady-state policy. Preserve existing enforcement until an equivalent check is proven or the maintainer accepts a policy change.

| Scripts in the current checkout | Current use and trade-off to test |
| --- | --- |
| `check-design-contracts.ts`, `design-system-boundary.ts`, `design-css-values.ts`, `design-motion-options.ts` | One production-source checker with three supporting modules. It runs in both typecheck and build. Compare deterministic cross-file boundaries and material rules with Biome configuration and type contracts. Compare JSDoc wording and vocabulary heuristics with targeted tests and design-owner review. Keep custom parsing only for a demonstrated gap. |
| `check-design-tokens.ts`, `token-analysis.ts` | Run in typecheck and build. Biome already covers CSS hex literals. The analyzer also follows paint in SVG and TypeScript and warns on unused tokens. Compare per-format coverage and the cost of scanning twice when both commands run. Keep the distinction between a warning and a blocking violation. |
| `editor-doc-fixtures.ts` | A consumer-side editor test currently run during typecheck and build. Compare a contract test in CI against that frequency. It catches a documented props type hiding an undocumented JSX value, but depends on a second TypeScript version. Prove that an undocumented export still fails wherever the check lands. |
| `design-contract-fixtures.ts`, `token-fixtures.ts` | The separate fixture command exercises the checkers (101 design cases, 41 token cases at handoff). Compare the script runners with ordinary parameterized tests. Retain a bad/valid pair for each surviving rule and distinct parsing boundary. Trim redundant historical probes and remove the token runner's write to `evidence/token-fixtures.json`; a clean run should need only its exit status and diagnostics. |
| `probe-lint.ts` | Migration evaluation, invoked directly to generate `evidence/lint-fixtures.md`. Its final disposition belongs to [Phase 00's handoff](00-prerequisites.md#cleanup-after-user-verification) and the last Phase 02 trial that consumes it. |

One sequential local sample took 1.42s for the design-contract scan, 0.78s for editor hovers and 0.41s for token ownership. Both typecheck and build invoke all three today. Compare running shared checks once in the full contributor command with keeping individual commands independently protective. Measure on the clean checkout before deciding.

### Clean checkout verification

- [ ] Provide one declared Bun command for the full local check, covering lint/format, design and token checks and their fixtures, typecheck, unit and Chromium tests, and the production build. In a disposable clean copy of the intended tracked files, install from the lockfile, follow the documented browser setup and run the command without maintainer credentials or an agent subscription. Introduce a known bad change, record which step fails, restore it and pass.
- [ ] Check that required links resolve from that copy. Earlier records link into the ignored `evidence/` and `ui-evidence/` directories beside these plans. Transfer needed guidance to a reviewed, distributable source or make the check reproducible from tracked inputs. Pass the command and setup steps to [Phase 04](04-open-source-contributions.md#contributor-exercises).

## Evaluation log

| Attempt | Section or skill removed/tested → intended owner | Passed/failed, diagnostic or actual reads | Files / rule files / words left | Next attempt |
| --- | --- | --- | --- | --- |
| Baseline | Nested component guidance → Biome | Explicit rule selection caught a nested definition; the prerequisite handoff must establish coverage in the normal config. | 20 / 16 / 14,293 | Check the rule matrix before deleting this section. |

**Completion:** Record final counts and deltas for each skill, moved obligations, pass/fail traces, and the evidence for any remaining prose. Reconcile the ledger against all original sections.

## Handoff

**Status: pending.** Record the base revision and working-tree changes, which commands enforce which requirements, remaining judgment calls, and final metrics. Next chat: [product repo](03-product-repo.md).

Do not stage or commit changes unless the user explicitly asks. Carry this instruction into the next session's handoff.

### Cleanup after user verification

At handoff, fill in the actual paths and dispositions from the [script review](#review-the-permanent-checks). List skill-evaluation prompts and transcripts, throwaway lint probes, generated reports, and the paired fixtures and commands that must survive. After user verification, the Phase 03 agent removes spent trials, updates references and runs the clean-checkout command with the retained bad/valid cases before starting product work. Carry only unresolved items into the next handoff.
