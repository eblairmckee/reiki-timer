# Prerequisites: establish reliable lint and test evidence

Start here in an ordinary implementation chat. Select the orchestrator model and effort shown below, then paste the full prompt.

```text
Use GPT-6.1 Sol at High effort as the session orchestrator. Execute the checklist in docs/rearchitecture-goals/00-prerequisites.md. Prove the lint coverage and migrate the tests. Record results and limitations in the handoff before starting a goal.

Delegate independent work when it saves time or cost. Use GPT-6 Luna at High effort for inventories, reference tracing, and collecting fixture results. Use GPT-6.1 Sol at Medium effort for bounded implementation or debugging.
Run simple commands directly. Keep architecture decisions, judgments about rule removal, integration, and final verification with the orchestrator.
For before/after skill evaluations, run the same task prompts in separate fresh GPT-6.1 Sol chats at Medium effort with delegation off in both runs.
Use the in-app browser with the already running dev server for manual visual verification only when a change affects rendering or leaves an unresolved visual question. Scope inspection to the affected views and states.
Do not stage or commit any changes unless I explicitly ask. Include this constraint in the session handoff.
```

The three goal chats will use this evidence to decide which local instructions can be deleted. Keep skill edits with their owning goal. The starting commit is `1667bd1`: Biome checked 83 files, the token check passed, and 43 Bun tests passed across six suites.

## Instruction baseline

| Goal | Skills counted | Entrypoints | Rule files | Total files | Words |
| --- | --- | ---: | ---: | ---: | ---: |
| UI and design | ui-design | 1 | 11 | 12 | 4,351 |
| Tooling | react-best-practices, typescript, tanstack, skill-maintenance | 4 | 16 | 20 | 14,293 |
| Product repo | testing | 1 | 4 | 5 | 850 |
| **All repository skills** | | **6** | **31** | **37** | **19,494** |

Root `AGENTS.md` adds one file and 187 words, for **38 files and 19,681 words** overall. For a recorded commit, enumerate tracked Markdown with `git ls-tree -r --name-only <commit> -- .agents/skills` and count the complete contents of each file with `git show "<commit>:<path>" | LC_ALL=C wc -w`. For a working candidate, include new files and omit deleted ones. Count frontmatter, examples, and any new references. Assign each file to one goal. Log transfers and any newly mandatory prose outside these directories so relocated text remains visible.

## Checklist

- [ ] **Adopt Ultracite.** Pin compatible Ultracite and Biome versions using Bun. Enable the core and React presets, remove masking overrides, and keep the generated route tree outside Biome. Clean the repo in reviewable batches. Separate mechanical formatting from behavior changes and record justified exceptions.
- [ ] **Prove lint coverage.** For each React or design instruction proposed for replacement, run a violating fixture and a valid near-match through the normal project lint configuration. Record the rule ID, diagnostic, exit status, and any gaps. A probe using `--only` establishes capability; ordinary lint establishes enforcement.
- [ ] **Enforce literal-color ownership.** Replace the raw-line scan with the built-in CSS hex rule and scoped CSS and TS/TSX rules for other literals. Keep the theme exception, a parser-based check for standalone SVG, and the `bun run check:tokens` entrypoint. Probe gradients, shadows, fallbacks, shader constants and JSX paint alongside comments, fragment IDs, token mixes, `currentColor`, `transparent`, and forced-color system colors.
- [ ] **Warn on unused theme tokens.** Follow production reads, CSS aliases and fallbacks across files, including names assembled from the actual shader palette. Distinguish declarations, writes and test-only references from production reads. Show an orphan warning at its declaration, a valid alias and dynamic palette read staying quiet, and an exit status of zero with warnings alone.
- [ ] **Move the six suites to Vitest** behind `bun run test`. Reconcile all 43 cases by behavior. Keep fast unit/component tests and a headless Chromium project. For each of the five theme tests, identify which checks are static and retain its runtime guarantee. Use browser-resolved theme values and Culori for color parsing, compositing and WCAG calculations. Preserve contrast thresholds and polarity on glass, the shaded button face, timeline hierarchy, palette transitions, grain and dimming.
- [ ] **Prove the accessible rendering checks.** Run axe in Chromium on representative setup, choice and timeline states. Introduce a low-contrast value and an unnamed control separately, observe the intended failures and restore the originals. Record incomplete axe findings on translucent or shader surfaces and their numeric or visual coverage.
- [ ] Run lint, token checks, typecheck, Vitest including Chromium, and the production build. Record exact commands and results below. If hosted review is pending, identify the validated branch and commit and hold protected edits for human review before landing.

## Evaluation log

Append attempts as they happen. Keep failed trials and their corrections in sequence.

| Attempt | Rule or behavior, proposed owner | What passed or failed; evidence | Skills remaining (files / words) | Next action |
| --- | --- | --- | --- | --- |
| Baseline at `1667bd1` | Nested component definitions → Biome | Explicitly selected `correctness/noNestedComponentDefinitions` rejected a nested JSX component and accepted its hoisted equivalent. | 37 / 19,494 | Repeat through ordinary lint after the presets are active. |

## Handoff

**Status: pending.** Enter the validated base revision and working-tree changes, run commands, rule/fixture matrix, six-suite reconciliation, mutation results, warning inventory, unresolved judgment calls, and merge/review status here. Keep raw traces separate and link to the relevant evidence.

Do not stage or commit changes unless the user explicitly asks. Carry this instruction into the next session's handoff.

After verification, start fresh chats **in sequence** for [UI and design](01-ui-and-design.md), then [tooling](02-tooling.md), then [product repo](03-product-repo.md). Select the orchestrator model and effort named in each plan and paste its full launch prompt. Each chat needs its own plan and relevant handoff. [Codex goal guidance](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex)
