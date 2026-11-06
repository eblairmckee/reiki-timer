# Tooling: eliminate duplicate framework guidance

Start a fresh chat after UI and design. Read the [lint and test evidence](00-prerequisites.md#handoff) and any tooling changes in the [UI handoff](01-ui-and-design.md#handoff).

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

## Evaluation log

| Attempt | Section or skill removed/tested → intended owner | Passed/failed, diagnostic or actual reads | Files / rule files / words left | Next attempt |
| --- | --- | --- | --- | --- |
| Baseline | Nested component guidance → Biome | Explicit rule selection caught a nested definition; the prerequisite handoff must establish coverage in the normal config. | 20 / 16 / 14,293 | Check the rule matrix before deleting this section. |

**Completion:** Record final counts and deltas for each skill, moved obligations, pass/fail traces, and the evidence for any remaining prose. Reconcile the ledger against all original sections.

## Handoff

**Status: pending.** Record the base revision and working-tree changes, which commands enforce which requirements, remaining judgment calls, and final metrics. Next chat: [product repo](03-product-repo.md).

Do not stage or commit changes unless the user explicitly asks. Carry this instruction into the next session's handoff.
