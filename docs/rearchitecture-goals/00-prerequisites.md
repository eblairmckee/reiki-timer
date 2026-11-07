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

The three goal chats will use this evidence to decide which local instructions can be deleted. Keep lint-driven skill removals and their before/after evaluations with their owning goal. The starting commit is `1667bd1`: Biome checked 83 files, the token check passed, and 43 Bun tests passed across six suites.

## Instruction baseline

| Goal | Skills counted | Entrypoints | Rule files | Total files | Words |
| --- | --- | ---: | ---: | ---: | ---: |
| UI and design | ui-design | 1 | 11 | 12 | 4,351 |
| Tooling | react-best-practices, typescript, tanstack, skill-maintenance | 4 | 16 | 20 | 14,293 |
| Product repo | testing | 1 | 4 | 5 | 850 |
| **All repository skills** | | **6** | **31** | **37** | **19,494** |

Root `AGENTS.md` adds one file and 187 words, for **38 files and 19,681 words** overall. For a recorded commit, enumerate tracked Markdown with `git ls-tree -r --name-only <commit> -- .agents/skills` and count the complete contents of each file with `git show "<commit>:<path>" | LC_ALL=C wc -w`. For a working candidate, include new files and omit deleted ones. Count frontmatter, examples, and any new references. Assign each file to one goal. Log transfers and any newly mandatory prose outside these directories so relocated text remains visible.

## Checklist

- [x] **Adopt Ultracite.** Pin compatible Ultracite and Biome versions using Bun. Enable the core and React presets, remove masking overrides, and keep the generated route tree outside Biome. Clean the repo in reviewable batches. Separate mechanical formatting from behavior changes and record justified exceptions.
- [x] **Prove lint coverage.** For each React or design instruction proposed for replacement, run a violating fixture and a valid near-match through the normal project lint configuration. Record the rule ID, diagnostic, exit status, and any gaps. A probe using `--only` establishes capability; ordinary lint establishes enforcement.
- [x] **Audit skill and rule overlap with the active lint configuration.** Inventory every local skill entrypoint and rule file, plus root instructions. Map candidate clauses to ordinary bad/valid fixtures, separate partial coverage and gaps from proven checks, and give the owning goals a removal ledger. [Cross-skill audit](evidence/skill-lint-audit.md).
- [x] **Enforce literal-color ownership.** Replace the raw-line scan with the built-in CSS hex rule and scoped CSS and TS/TSX rules for other literals. Keep the theme exception, a parser-based check for standalone SVG, and the `bun run check:tokens` entrypoint. Probe gradients, shadows, fallbacks, shader constants and JSX paint alongside comments, fragment IDs, token mixes, `currentColor`, `transparent`, and forced-color system colors.
- [x] **Warn on unused theme tokens.** Follow production reads, CSS aliases and fallbacks across files, including names assembled from the actual shader palette. Distinguish declarations, writes and test-only references from production reads. Show an orphan warning at its declaration, a valid alias and dynamic palette read staying quiet, and an exit status of zero with warnings alone.
- [x] **Move the six suites to Vitest** behind `bun run test`. Reconcile all 43 cases by behavior. Keep fast unit/component tests and a headless Chromium project. For each of the five theme tests, identify which checks are static and retain its runtime guarantee. Use browser-resolved theme values and Culori for color parsing, compositing and WCAG calculations. Preserve contrast thresholds and polarity on glass, the shaded button face, timeline hierarchy, palette transitions, grain and dimming.
- [x] **Prove the accessible rendering checks.** Run axe in Chromium on representative setup, choice and timeline states. Introduce a low-contrast value and an unnamed control separately, observe the intended failures and restore the originals. Record incomplete axe findings on translucent or shader surfaces and their numeric or visual coverage.
- [x] Run lint, token checks, typecheck, Vitest including Chromium, and the production build. Record the validated revision, exact commands and results below.

## Evaluation log

Append attempts as they happen. Keep failed trials and their corrections in sequence.

| Attempt | Rule or behavior, proposed owner | What passed or failed; evidence | Skills remaining (files / words) | Next action |
| --- | --- | --- | --- | --- |
| Baseline at `1667bd1` | Nested component definitions → Biome | Explicitly selected `correctness/noNestedComponentDefinitions` rejected a nested JSX component and accepted its hoisted equivalent. | 37 / 19,494 | Repeat through ordinary lint after the presets are active. |
| 2026-11-06 — starting checkout | Establish the actual baseline | Clean `main` at `c5166b3` (plans only since `1667bd1`): 83-file lint and all 43 Bun cases passed. | 37 / 19,494 | Enable presets before treating lint as an instruction owner. |
| Presets and cleanup | Ultracite core + React → ordinary Biome | Pinned Ultracite 8.1.1 / Biome 2.6.3; removed group masking and warning downgrades. First run exposed 336 errors. Formatting, safe fixes, reviewed cleanup and narrow exceptions are recorded in [integration review](evidence/integration-review.md). | 37 / 19,494 | Verify bad and nearest-valid fixtures with the final configuration. |
| Ordinary lint fixtures | React and design patterns → Biome, compiler or retained judgment | [22 pairs](evidence/lint-fixtures.md): 17 bad patterns rejected with intended diagnostics, five demonstrated lint gaps; all 22 valid cases exit 0. Both compiler probes behave correctly (TS2322 / valid exit 0). | 37 / 19,494 | Preserve uncovered state, naming, accessibility and visual judgments for their owning goals. |
| Parsed color ownership and liveness | Theme ownership → Biome CSS hex plus parsed scoped rules | [40 fixtures](evidence/token-fixtures.json) pass. Corrections include TS7 parser API, prose/name false positives, actual dynamic palette flow, write/test exclusions and forced-color alternatives. [101 real declaration warnings](evidence/final-tokens.txt), zero errors, exit 0. [Limits](evidence/token-enforcement.md) include numeric arrays/GLSL and arbitrary runtime assembly. | 37 / 19,494 | Review advisory inventory; do not delete unused tokens automatically. |
| Vitest migration and runtime strengthening | All 43 behaviors → happy-dom + Chromium/Culori | [Six-suite reconciliation](evidence/test-six-suite-reconciliation.md) retains 38 unit/component and five original browser theme cases. Four added cases produce 47 total. Missing browser/local listen restrictions resolved. | 37 / 19,494 | Retain numeric bounds alongside axe's incomplete results. |
| Accessibility mutations and failed trials | Accessible settled rendering → axe and numerical regression checks | Initial unnamed mutation still had a title; initial identical-color axe mutation was treated as invisible. Corrected probes produce `button-name` and `color-contrast` (1.47:1), restore originals and pass. A transient 2.26:1 disclosure failure prompted supported reduced-motion settled-state audits; quantized hierarchy equality is recorded. [Ordered attempts](evidence/test-migration.md). | 37 / 19,494 | Keep transient animation and shader-pixel limits visible. |
| Final integration | Repository commands and handoff | Local check, lint, tokens, typecheck, Chromium-inclusive Vitest and build all exit 0. A concurrent-negative-fixture check and evidence JSON formatting failure were corrected before the serialized final run. Skills and root instructions unchanged. | 37 / 19,494 | Hand off without staging, committing or starting a goal. |

## Handoff

### For human review

No prerequisite decision needs your review.

### For the UI and design plan

- **Starting point.** Use the validated local working tree on `main` at base `c5166b3`, including the repaired reference links. The UI skill now has 12 files and 4,344 words. Do not stage or commit unless the user explicitly asks.
- **Token renaming.** All 28 shader pigments are live. The unused-token checker recognizes their current `--chakra-` prefix. Update its matcher and dynamic-read fixture alongside the rename so live pigments stay recognized.
- **Naming rules.** Ordinary lint accepted both `Leading_icon` and `thing` as local identifiers. Probe actual exported props before relying on the earlier prop-spelling result. The [local audit](evidence/skill-lint-audit.md) identifies the exact patterns tested.
- **Disclosure contrast.** Axe measured the “When chakras change” label at 2.26:1 during its fade. The passing browser suite checks settled states with reduced motion. If the disclosure or its materials change, recheck that transition with motion enabled.

### Cleanup after user verification

For every phase, finish the handoff with the actual paths or test cases created or carried forward. Give each a disposition (remove, consolidate, keep, or defer), the reason, any remaining consumer, and the check that proves cleanup preserved the intended behavior. Record the user's verification of the phase goal separately from passing tests. Once the user verifies it, the incoming agent performs the listed cleanup before starting its phase, repairs references and records the result. Defer anything still needed to its named owner and phase. Keep this record in the handoff. Do not stage or commit without the user's explicit request.

| Phase 00 candidate | Disposition and last consumer |
| --- | --- |
| `evidence/*attempt*`, `final-*.txt`, raw JSON and output logs | Remove disposable local copies after acceptance and extraction of the findings. Keep the lint/skill matrix through Phase 02 and the test reconciliation through Phase 03 where their ledgers depend on them. Both evidence and its consumers must agree on what ships in a clean checkout. |
| `scripts/probe-lint.ts` | Defer to Phase 02's rule-removal trials. It generates the baseline lint matrix and asserts several known gaps. After the last trial, transfer any enduring repo-specific case to the maintained suite, then retire the probe and its report writer. Verify ordinary lint catches the retained bad case and accepts its valid counterpart. |
