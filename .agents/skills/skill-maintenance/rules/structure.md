# Instruction ownership and structure

Keep brief application defaults and the discovery convention in the root `AGENTS.md`. Place each skill group directly under `.agents/skills/`, with its own `SKILL.md` and a `rules/` subdirectory. Each rule file owns a cohesive topic within the group; aggregate closely related rules in that file. Choose meaningful directory names, filenames, and headings so the structure explains the available guidance.

Keep the entrypoint focused on when the group applies, its essential workflow, and how to read its `rules/` directory. Select detail by topic and task. Omit READMEs and manually maintained catalogs or enumerations of skills and rules. Add scripts, assets, or other resources only when the workflow needs them.

Keep each instruction in one maintained place and refer to its owner when another group needs it. Keep pinned source provenance, licenses, and requested audit findings outside active instructions.

For framework-specific groups, make applicability clear in the description and entrypoint. Resolve it from the target app, and keep version-dependent workflows conditional on their actual capabilities. Keep shared guidance usable by apps with other frameworks.
