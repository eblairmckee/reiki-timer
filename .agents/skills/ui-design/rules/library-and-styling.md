# Styling ownership

Use app-local Olyx components with the installed Base UI primitives. Preserve their semantic elements, props, refs, state contracts, and handler cancellation while owning their complete appearance.

| Owner | Decisions |
| --- | --- |
| `src/components/ui/styles/theme.css` | Literal colors, palettes, glass materials, ink, focus, shadows, and shared visual scales |
| Primitive | Geometry, parts, interactive states, and documented sizing properties |
| Feature | Arrangement, viewport sizing, content, and domain state |

All application color literals belong in the theme. Elsewhere use semantic CSS variables, inherited `currentColor`, or `transparent`; platform system colors are allowed for forced colors. Local variables and JavaScript constants must not conceal duplicate literals. Resolve named theme variables when a shader needs concrete colors.

Shared decisions become tokens; component geometry stays local. Features use component APIs or documented custom properties without descendant overrides. Portals receive the root theme.

Declare cascade layer order in the document head before any application stylesheet. Verify spacing, type, and state colors after a full reload: import order and hot updates must not let resets or shared materials override primitives. Inspect the winning declaration when rendered styles disagree with source.

Run `bun run check:tokens` and review shared-style consumers. The command rejects hex and numeric color literals outside the theme; review semantic token use separately.
