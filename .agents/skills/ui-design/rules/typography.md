# Typography and contrast

Use theme-owned, self-hosted Bona Nova SC 400. Establish hierarchy with size and spacing; preserve native editing, selection, zoom and accessible names. Use tabular numerals for changing values.

Apply shared `data-ink` to glyph-only elements. Normal alpha-composited light pigment absorbs the local background hue. Use `label` for the wordmark and field labels, and one `detail` treatment for descriptions and dial values. These share theme-owned strength multipliers over adaptive base ink. Use the default for other small text, `display` for large readouts, and `control` for glyphs on frost. Keep material and focus indicators independent of text opacity; place glyphs above lighting overlays.

Adaptive base ink targets 4.5:1 for small text and 3:1 for large text and required indicators; large regular text means at least 24 CSS pixels. The requested softer field treatment deliberately lowers label/detail opacity below these targets in some areas. Restore base strengths for prefers-contrast: more, and do not claim the softer default meets those contrast thresholds. Atmosphere derives strengths from its current palette, shader grain and dimming; control glyphs also account for frost. Darker local pixels may exceed the target. Filters, masks and blend modes cannot guarantee a contrast ratio.

Define derived color tokens in the theme at the same scope that receives runtime alpha variables; custom properties resolve before inheritance. Keep component colors from overriding shared ink. Validate palette transitions, material states and dimmed extremes numerically, then inspect actual rendered samples. Fades intentionally pass through unreadable intermediate opacity; exiting content must be inert.

Native fields and portaled menus need controlled readable backings when their backdrop is unbounded. Keep placeholders explicit, glyphs sharp, and reduced-transparency/forced-color alternatives readable.
