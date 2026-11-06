# UI and design: make the system teach its contracts

Start a fresh chat after the [prerequisite handoff](00-prerequisites.md#handoff) identifies a validated revision.

```text
/goal Execute docs/rearchitecture-goals/01-ui-and-design.md with GPT-6 Astra at Extra High effort as the session orchestrator. Minimize UI and design skill prose by making the design system discoverable and enforceable. Verify the public APIs, naming rules, human review gate, and fresh-agent evaluations. Record every reduction and justify every retained instruction.

Delegate independent work when it saves time or cost. Use GPT-6 Luna at High effort for inventories, reference tracing, and collecting fixture results. Use GPT-6.1 Sol at Medium effort for bounded implementation or debugging.
Run simple commands directly. Keep architecture decisions, judgments about rule removal, integration, and final verification with the orchestrator.
For before/after skill evaluations, run the same task prompts in separate fresh GPT-6.1 Sol chats at Medium effort with delegation off in both runs.
Use the in-app browser with the already running dev server for manual visual verification only when a change affects rendering or leaves an unresolved visual question. Scope inspection to the affected views and states.
Do not stage or commit any changes unless I explicitly ask. Include this constraint in the session handoff.
```

**Baseline at `1667bd1`:** `ui-design` has 1 entrypoint and 11 rule files, **12 files / 4,351 words**. Count complete Markdown files using `LC_ALL=C wc -w`. Include any successor skills. Try zero local instructions for visual design and for composition independently. If removal produces a reproducible failure, test a stronger system contract before keeping the smallest instruction that fixes it.

## Checklist

- [ ] **Capture selection before edits.** In fresh chats, try an image-concept task, a composition-only extraction, a visual restyle, a request an existing slot satisfies, and a justified extension. Leave skill names out of the prompts. Record references actually opened, words read, and the design decision. Reserve paraphrases for the final evaluation.
- [ ] **Assign ownership before implementation.** Work as the design-system architect. Start from a concrete caller and search existing tokens, components, parts, and slots. Try reuse, composition, and local feature ownership. Next consider a typed API or default, prop/slot JSDoc, compiler or lint rule, behavior test, visual reference, and human judgment. Record why each branch was selected or ruled out, including tradeoffs for the closest alternatives. Extend the tree only after an observed miss.
- [ ] **Establish protected review.** Bootstrap the reviewed public repository `eblairmckee/reiki-timer`. Cover both the old and new system directory and the files governing their policy, including the review configuration itself. Require a written proposal before a protected edit is implemented, and one human review of the tested patch. Use a distinct, limited-permission PR author identity and `@eblairmckee` as human code owner. Enforce checks, code-owner approval, and dismissal of stale approvals. Demonstrate that a valid patch waits for review, a subsequent change needs fresh approval, and a feature-only edit avoids this gate. Record real PR evidence.
- [ ] **Move the Olyx directory.** Rename `src/components/ui` to `src/components/design-system` and change `componentDir` in the fixed CLI filename `components.json`. Migrate imports, styles, tests, token tooling, and references together. Preserve the license and confirm CLI installation in a disposable fixture. Load every public entrypoint and resolve the missing stylesheet imports in `InputGroup` and `NumberField` against their intended styles.
- [ ] **Name and document public contracts.** Inventory tokens, variants, motion, JSX exports and parts, props, handlers, and slots. For each migration record the old name, new name, purpose, affected callers, and required upstream names. Use the vocabulary below as the proposal starting point.

| Surface | What the caller should learn |
| --- | --- |
| Tokens | Reference, semantic, or component scope; property and purpose; context and interaction state when meaningful. Examples: `--ref-color-chakra-bold-root-garnet`, `--sys-color-action-surface-hover`, `--cmp-color-switch-thumb-fill-checked`. Cover spacing, type, radii, and shadows too. |
| Motion and variants | Name the interaction and phase consistently in CSS and TS, such as `motion.disclosure.enter`. Give independent axes distinct names, such as intent, appearance, and size. Resolve ambiguous Button modes and color-named LinkButton variants. |
| JSX exports | Name every exported component for its purpose and compound parts for their owner, as in `CollapsibleTrigger`. Check aliases and wrapped components. |
| Props, slots, handlers | Express relationships with types and defaults. Use names such as `primaryAction` and `marker`. Document locally authored public props in JSDoc. For slots describe accepted content, interactivity and accessible naming. For callbacks describe when they fire, including repeated activation. Preserve DOM, ARIA, React and Base UI contracts. |

- [ ] **Enforce at create/update time.** Reuse built-in rules before adding syntax-aware checks. Report invalid names and missing slot documentation with nearby examples. Have a separate change check flag protected diffs missing a complete proposal. Migrate existing names and consumers in reviewed batches. Exercise bad names, valid near-matches, export aliases, platform props, and valid changes that still need review.
- [ ] **Remove prose and repeat the tasks.** Let concepts and appearance draw on tokens and visual references. Let composition draw on component contracts and behavior. Run the baseline and held-out prompts with the relevant prose removed. Log wrong reads and failed decisions, revise the owning artifact, and retry both the failed case and its closest negative. Transfer timer-specific requirements and their acceptance cases to the product handoff exactly once.

## Evaluation log

| Attempt | Guidance removed or tested → intended owner | Observed result, trace or fixture | Files / rule files / words left | Next attempt |
| --- | --- | --- | --- | --- |
| Baseline | Prop spelling → Biome | A naming-rule probe rejected `Leading_icon`, accepted `leadingIcon`, and also accepted `thing`. Vocabulary and meaning still need evaluation. | 12 / 11 / 4,351 | Compare a vocabulary check and human review on a real slot. |

**Completion:** Record final counts and deltas, newly mandatory references, held-out results, and the reproducible failure supporting every residual instruction. Attach naming, entrypoint, accessibility, and hosted review evidence.

## Handoff

**Status: pending.** Record the validated base revision and working-tree changes, enforcement commands, protected paths, public component and token conventions, and any product rules transferred with their original locations. Next chat: [tooling](02-tooling.md).

Do not stage or commit changes unless the user explicitly asks. Carry this instruction into the next session's handoff.
