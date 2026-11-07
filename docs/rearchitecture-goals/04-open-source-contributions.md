# Open-source contributions to the Reiki app and its design system

Prepare one repository that an outside contributor can understand, change and verify. The design system defines the app's shared visual language. The timer is the first example of a feature using it. The intended release is the application source, including its supported design-system entrypoints. An independently published UI package would be a separate decision.

Start after the [product handoff](03-product-repo.md#handoff). Use the [public API findings](01-ui-and-design.md#public-api-follow-up-for-outside-contributors), [clean-checkout result](02-tooling.md#clean-checkout-verification) and the actual feature imports as inputs.

Once the user verifies the product goal, complete the [Phase 03 cleanup](03-product-repo.md#cleanup-after-user-verification) before starting readiness work.

```text
/goal Execute the local preparation in docs/rearchitecture-goals/04-open-source-contributions.md. Write the contributor guide as the staff design systems lead's account of the app and design-system architecture. Verify the guide with outside-contributor exercises and record outstanding release decisions.

Delegate independent inventories and fixture collection to GPT-6 Luna at High effort, and bounded implementation or debugging to GPT-6.1 Sol at Medium effort, when useful. Keep architecture, ownership and final verification with the orchestrator. For before/after skill evaluations, repeat identical prompts in separate fresh GPT-6.1 Sol chats at Medium effort with delegation off.
Use the in-app browser on the already running server only for affected rendering or unresolved visual questions. Limit inspection to those views and states.
Leave hosted review activation and publication for their separate maintainer decisions. Do not stage or commit unless explicitly asked. Carry this constraint into the handoff.
```

## What CONTRIBUTING.md must explain

Make root `CONTRIBUTING.md` the contributor-facing account of **why the architecture is arranged this way, who decides a change, and how someone can tell it is safe to merge**. Link to it from the root README beside the setup and verification commands. Use maintained source, public JSDoc and runnable examples for API details. A contributor should be able to work from those entrypoints without reading the migration plans.

### Where a change belongs

| Owner | What it owns and why | Example for the guide |
| --- | --- | --- |
| Design system | Reusable interaction and visual contracts across features. Public components, tokens, motion and styling hooks let one fix reach every caller. Family internals can evolve behind supported entrypoints. | Button owns the frosted face, hit target and pressure feedback. Show the public inset appearance, its JSDoc and a test with an unrelated caller. |
| App and shared domain | App composition, navigation and Reiki concepts with multiple feature consumers. App-owned compositions combine system primitives. Promote a part when callers need a common contract and can name what should change together. | A second feature needing the same chakra order would give the app a reason to share that domain data. Trace a real app composition in the accepted checkout and label future examples as hypothetical. |
| Feature | Product state, copy, data, commands and feature-specific behavior. Keeping these near their callers makes routine product changes independently reviewable. | The timer chooses the chime and handles replay when the selected tone is activated again. Button supplies activation behavior. Link to both owners and the repeat-preview test. |
| Repository tooling | Installation, route generation, checks, CI and review configuration. Local and hosted checks use the same tracked inputs so contributors can reproduce a failure. | Follow one rejected private import or invalid token from its diagnostic to the accepted alternative and paired fixture. |

### Who participates and who decides

One person may hold several roles. Describe the responsibility they are exercising on a given change. Publish the current contact or ownership path for each area, how to request a decision, and who can act when an owner is unavailable. Identify proposed and active review rules accurately as rollout progresses.

| Participant | Responsibility and decision rights |
| --- | --- |
| Contributor or PR author | Identify the owning area, reuse existing contracts, describe the affected callers, run the relevant checks and respond to review. Own the submitted change and its evidence, including work produced with an agent. |
| Feature or app maintainer | Review product behavior, accessibility in context and compatibility with existing data and routes. Decide ordinary changes within the feature. Coordinate app-level domain changes with affected feature owners. |
| Staff design systems lead | Set the principles for shared UI and its relationship to the app. Decide promotions, public API and token changes, visual intent, exceptions and migration strategy. Record the reason and affected consumers where a future contributor can find them. Map this role to the designated human owner, initially `@eblairmckee` for the planned system review. |
| Repository maintainer | Own the contribution process, verification tools, review policy and release decisions. Coordinate cross-area work with the affected owners. Keep review paths and owner contacts current when the architecture changes. |
| Coding or review agent | Trace ownership and callers, suggest the smallest change, run checks and report evidence and uncertainty. Surface design or policy choices to the responsible human. An independent human supplies required owner approval. |
| Automated checks | Run reproducible checks on the proposed revision and identify the failing contract. Explain what each blocking check proves, which findings are advisory, and how to reproduce them locally. Humans decide design fit, exceptions and whether the evidence justifies changing a rule. |

Walk through a timer-only behavior fix, a proposed shared component variant, and a change to an enforcement rule. For each, give the principle, author, accountable reviewer, evidence, and route for resolving disagreement. A feature fix uses ordinary review. A new or breaking public contract calls for a short proposal covering the caller, composition options, compatibility, migration and tests. A rule change needs a failing fixture, its nearest valid case, and review by whoever owns the contract it enforces. Identify who reviews mixed changes and how contributors can challenge a false positive.

Use one of those examples to explain the layers of quality enforcement. For a Button variant, types establish what a caller may pass, keyboard tests establish activation behavior, and browser tests establish the rendered focus and contrast. The design-system lead decides whether the variant expresses a reusable distinction. Link to the corresponding tests so a contributor can inspect the guarantees and their limits.

## Local deliverables and acceptance

- [ ] **Write and verify the contributor entrypoints.** Add the root README and contribution guide. Link each ownership example to a shipped source or test and the current responsible role. Describe how a change to a public default, accessibility behavior or import path reaches existing callers. Keep executable policy in the checks and public usage details in JSDoc. Check the links in a clean copy of the proposed distribution.
- [ ] **Prepare repeatable external checks.** Use the single verification command from Phase 02 in the proposed pull-request workflow. Keep checks runnable by an outside author without deployment, publishing or maintainer credentials. Separate release permissions from PR validation. Record which quality checks block and which only advise, with evidence for a rejection and an accepted near-match. Prepare the proposed ownership mapping from actual paths, including the files that govern checks and review. Compare feature-only, system, tooling and mixed diffs against the routing described in the guide. Hosted enforcement is verified at rollout.
- [ ] **Exercise an ownership change.** In a disposable example, move a feature-owned component into the public design system. Verify the new path selects the system owner, the public import resolves, and the contributor guide still leads to the right reviewer and checks. Show which source, ownership mapping and guide references travel together in the same change.
- [ ] **Prepare a distribution inventory for the maintainer.** Obtain a project license decision and identify its intended coverage. Preserve the [Olyx notice](../../src/components/design-system/LICENSE). Trace rights and notices for bundled fonts, chime audio, icons, shaders, imported guidance and design studies. Record the source, terms, required credit, and disposition of every unresolved asset. Review the exact source files and proposed history for private material, credentials and redistribution issues. Record findings without copying sensitive values into public documentation. Agree on a private security-reporting channel and responsible contact before advertising it.

### Contributor exercises

- [ ] From a clean copy of the intended public files, start at the README, install with the lockfile, run the dev setup and full check, and trace an ordinary timer change to its owner and test. Record the revision or working-tree snapshot, environment, commands, results and any unpublished reference the contributor needed.
- [ ] Give a fresh contributor a proposed Button appearance and a tempting private helper. Verify they can find the supported API in their editor, explain when a proposal is warranted, name the decision-maker and prepare evidence. Exercise a rule-change case too. Compare their route with the ownership map and diagnostics. Fix the source of any wrong turn and retry.
- [ ] Record who actually performed each exercise. An agent dry run can validate discovery. Record a human walkthrough separately when available. The ordinary contributor workflow must also work with a standard editor and the repository's commands.

## Hosted review after baseline acceptance

After the full rearchitecture baseline is accepted **and the maintainer authorizes rollout** in `eblairmckee/reiki-timer`, configure the approved protected paths, human owners and required checks. Use a limited-permission author distinct from the approving human. Verify on real PRs that a feature-only change can proceed after ordinary checks, a protected change waits for owner approval even with passing checks, and a new revision requires fresh approval. Verify fork-originated checks run without release secrets and changes to the ownership or review rules themselves get the intended review. Record PR links, exact revisions, check results and human decisions.

**Publication is a separate decision.** Present the exact snapshot and history proposed for release, the license and notices, remaining blockers and the hosted review status. The maintainer chooses what to publish and when. Keep unverified rollout cases explicitly pending.

## Handoff

Record local readiness, hosted enforcement and publication as three separate statuses. Include the guide, owner contacts, verified examples and checks, distribution decisions, and outstanding items with their decision-makers. **Do not stage or commit unless the user explicitly asks. Carry this constraint into the next chat.**

### Cleanup after user verification

List the actual disposable contributor exercises, trial patches and transcripts alongside the shipped guide, license notices, ownership mapping and maintained checks. Identify any evidence still needed for an outstanding release decision. After user verification, the release-preparation agent applies the listed cleanup, repairs links and reruns the contributor check from the proposed public files. Review this plan series and its migration records for retirement once all dependent decisions have been transferred. Hosted review setup and publication retain their separate authorizations.
