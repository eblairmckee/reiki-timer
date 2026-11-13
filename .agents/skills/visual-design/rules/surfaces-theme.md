# Surfaces and theme

Use the app-owned system's semantic colors, atmosphere and material defaults. Button defaults to frost, with inset as a variant. Choose surfaces for their content/interaction purpose; exact feature icon-or-text choices are not universal rules.

## Pair the hue with the cue

Communicate meaningful state through labels, symbols or patterns as well as color. Check foreground legibility over the real backing, including changing atmosphere and translucency; numerical token contrast cannot certify every rendered frame.

Preserve promised forced-color and reduced-transparency behavior. Color values belong in `src/components/design-system/styles/theme.css`; consumers use semantic references, `currentColor`, transparency or theme-derived renderer inputs. Do not bypass token failures with literal paints.

Keep theme values with the system. Root styling extensions must preserve portal theming and required Olyx aliases. Private variables/selectors are not public APIs merely because source exposes them.
