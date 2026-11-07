# Open-source contributions: establish participation and accountability

Turn the accepted architecture and quality ownership into a contribution model that outside humans and agents can use. Resolve how changes are proposed, verified and reviewed, who can make each decision, and what is required for responsible publication.

Start after the user accepts the integrated baseline. Apply the [shared purpose and session protocol](00-prerequisites.md), including the maintainer persona and matrix. This phase owns participation, accountability and distribution readiness. Earlier phases own the system, product and verification contracts it communicates. A separately published UI package would require its own decision.

```text
/goal Execute the local preparation in docs/rearchitecture-goals/04-open-source-contributions.md. Follow the session protocol in docs/rearchitecture-goals/00-prerequisites.md with GPT-6.1 Sol at High effort as the session orchestrator. Write and verify a fresh contribution model from the accepted architecture, maintainer principles and quality matrix. Record local readiness separately from hosted enforcement and publication.
```

## Write the contribution model

- [ ] Write a new root README and `CONTRIBUTING.md` from the accepted baseline. Explain why the architecture is arranged as it is, where a change belongs, how to discover public APIs and how to verify work. Use shipped source/JSDoc and examples. Keep one authoritative home for principles and the matrix; update skill links if that home changes.
- [ ] Document design-system, app/shared-domain, feature and repository-tooling ownership. Map actual paths and public contracts to responsible people. Explain compatibility, promotion, exceptions, disagreements and how to challenge a false positive.
- [ ] Explain the responsibilities below through a feature fix, shared-contract proposal and quality-rule change. Include the principle, author, accountable reviewer and appropriate evidence. Choose examples from the accepted implementation.

| Participant | Responsibility to make explicit |
| --- | --- |
| Staff design systems lead | Shared architecture, brand/accessibility, public contracts, promotion, visual intent and compatibility decisions; identify the human owner, initially `@eblairmckee`. |
| App/feature maintainer | Product behavior, domain data, composition, persistence and contextual accessibility. |
| Repository maintainer | Tool reliability, contribution/review policy, ownership mapping and release decisions. |
| Contributor and assisting agent | Responsibility for submitted work; trace owners, explain tradeoffs, verify changes and report uncertainty. Agents surface unresolved choices to the human owner. |
| Automation | Reproducible diagnostics, declared coverage/limits and advisory versus blocking results. Humans own meaning, exceptions and acceptance. |

## Verify local readiness

- [ ] Follow setup and the selected verification workflow from a clean copy of intended public files, without private references, maintainer credentials or an agent subscription. Repair gaps at their source.
- [ ] Exercise ordinary feature work, a shared API change and a quality-owner decision with fresh contributors. Use the matched agent protocol for agent comparisons; distinguish agent discovery trials from human walkthroughs. Measure outcomes, reading/usage costs and review effort.
- [ ] Prepare PR checks and proposed owner routing from accepted quality decisions. Test feature-only, system, tooling and mixed changes, including a moved ownership boundary. Keep release permissions separate from ordinary contribution validation.
- [ ] Resolve project licensing and distribution scope with the maintainer. Preserve the [Olyx notice](../../src/components/design-system/LICENSE); audit fonts, audio, icons, shaders, imported material and design assets for required rights/notices. Review the proposed source/history for private material without reproducing sensitive values in docs. Establish a private security-reporting path and responsible contact.

## Hosted review and publication

After baseline acceptance and explicit rollout authorization, configure the agreed human owners and checks. Verify real PR behavior with a separate author and human approver, including new revisions, fork contributions and changes to review rules. Record what was actually exercised.

Publication requires a separate maintainer decision on the exact source snapshot/history, license/notices and outstanding issues. Keep local readiness, hosted enforcement and publication statuses distinct.

## Completion, handoff and cleanup

Local completion requires a contributor workflow that works from the intended public files, an accountable ownership/review model, and explicit dispositions for distribution questions. Hosted enforcement and publication can remain pending their separate authorizations.

Provide contributor entrypoints, verified examples, owner contacts, evidence limits and outstanding release decisions. End with the [cleanup handoff](00-prerequisites.md#handoff-and-cleanup); retire exercises and migration plans once their decisions have durable homes and the user verifies completion. Do not stage or commit unless explicitly asked.
