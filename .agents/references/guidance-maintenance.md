# Maintaining guidance

## Convention placement

Skills and their supporting references are the source of truth for conventions. Keep recurring domain decisions in the relevant skill and shared or conditional detail in focused references. AGENTS supplies essential working constraints and task-specific links. Public declarations/defaults/examples define individual API meaning.

Before adding a convention, check existing skills, references and executable contracts. If it is covered, link to its owner without repeating it. Otherwise extend the relevant skill or reference; regroup only when that improves task discovery. Update callers and remove a superseded document after every convention has a home. README, CONTRIBUTING and other docs can explain setup, decisions and results without maintaining a parallel rule catalogue.

Use clear triggers and stable, descriptive headings. Link directly to the relevant section. Read only the needed material; do not create a chain requiring every reference or skill for ordinary work. Keep historical findings outside operational instructions. Preserve attribution/licenses and adapt imported package, path, host and authorization assumptions.

## Validation and efficacy

For skill metadata changes, `bun run skills:validate .agents/skills` checks structure. Review relative paths, heading anchors, commands, applicability and unfinished scaffolding separately. Structural validity does not establish better decisions. Honor the user's execution scope; do not start tests or evaluations merely because guidance changed.

For an authorized concrete efficacy/discovery question, compare the current baseline, equivalent documentation and a focused skill on matched fresh tasks. Separate normal discovery from forced invocation. Preserve actual decisions, reads, first failures and repairs; use unseen and nearby unrelated work before generalizing a claimed benefit. Ceiling or mixed results remain inconclusive. Policy adoption is not experimental proof, and an accepted skill does not require another evaluation batch to remain active.

Use the [cost and judgment criteria](quality-conventions.md#costs-and-remaining-judgment).
