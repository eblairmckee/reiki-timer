# Navigation and pointer interaction

Keep shareable navigation state, such as meaningful filters, pagination, and selected views, in the URL when refresh, linking, or browser history should restore it. Use the existing router and a deliberate history policy. Keep ephemeral interaction state and sensitive draft content with their appropriate local owner.

Preserve ordinary link behavior, including modified clicks, opening a new tab, and back and forward navigation. 

Use the [foreground component states](foreground-components.md) and [motion contract](motion.md) for interactive feedback.

## Mobile web browsers
Use touch-action deliberately on affected controls, preserving the page's expected pan and zoom behavior.

Contain scroll chaining in a scrollable overlay when appropriate. Keep page-level pull-to-refresh and native navigation usable unless the application requires a scoped change. Check hybrid pointer and touch devices when changing input-dependent styles.

During a drag, scope text-selection suppression to the interaction and keep focus and alternate actions usable. Follow the [keyboard and gesture contract](../../accessible-testing/rules/accessibility.md) for custom interactions.
