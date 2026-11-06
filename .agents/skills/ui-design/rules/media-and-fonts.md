# Media and font delivery

Reserve an image's layout space with intrinsic dimensions or a known aspect ratio. Use the application's image component and responsive delivery features where available. Lazy-load offscreen images; keep the primary visible image eager, and assign high fetch priority only to a genuine critical image.

For animated imagery, choose an efficient supported format and retain a still fallback. Decorative video loops should be muted and play inline. Give meaningful media accessible alternatives and keep its controls operable, following the [accessibility contract](../../testing/rules/accessibility.md).

Use the framework's font loader when available. Load the weights and subsets the interface uses, provide a usable fallback, and choose a font-display strategy that keeps text readable. Preload genuinely critical resources and preconnect only to origins used on the critical path. Check loading and layout stability before adding further hints.
