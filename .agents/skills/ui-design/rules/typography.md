# Typography and contrast

Use the bundled Bona Nova SC face for headings, field labels, the live countdown and its settings preview. Use Cabin for descriptions, summary text, dialog body copy and dialog actions. The dialog paragraph uses 18px type, and its inline actions inherit that size. Keep copy in sentence case and let the heading font supply its own small caps. Keep lining, tabular figures for timer values and bold only the numeric values in summaries. Verify the computed families on the visible letters, including the frosted button face inside a dialog portal.

Give large primary headings and countdowns a frosted face. Clip a light-to-soft vertical gradient to the letters and repeat it per line. Give countdown figures their normal advance and a small inline paint margin so the gradient covers overhanging strokes, including the final digit. Start with a readable solid color for renderers that cannot clip the gradient. Use dark ink for a word action on a pale frosted surface.

Match the switch track’s lighting on field labels and secondary actions. Keep a continuous light face and place two crisp text shadows outside it, dark above and subtly lit below. Scale the edge with the label size. Descriptions use plain mixed-case ink at 15 CSS pixels or larger. Use softer translucent ink for the shared summary’s type and icons. Calculate its strength for bare atmosphere during playback and recessed glass in the HUD and examples. Apply translucency to the ink alone. Dial numbers use the regular adaptive reading ink. A backed summary gets its depth from the inset edges. Preserve the shared summary’s optional blur and its bare playback presentation.

Check small text at its final ink strength against its actual surface. Use size, spacing and material for hierarchy. The minimum contrast targets are 4.5:1 for small text and 3:1 for large regular text (at least 24 CSS pixels) and essential indicators. Check the lowest-contrast gradient stop as well as solid fills. High contrast, forced colors, reduced transparency and print use readable solid lettering.

Review a label beside its switch, a wrapped description, a one-line summary and the completion heading at their actual reading sizes on warm and cool backgrounds. Look for continuous thin strokes and open counters. Check the summary on bare atmosphere and in its recessed backing.

Define derived color tokens in the theme at the same scope that receives runtime alpha variables; custom properties resolve before inheritance. Keep component colors from overriding shared ink. Validate palette transitions, material states and dimmed extremes numerically, then inspect actual rendered samples. Fades intentionally pass through unreadable intermediate opacity; exiting content must be inert.

Native fields and portaled menus need controlled readable backings when their backdrop is unbounded. Keep placeholders explicit, glyphs sharp, and reduced-transparency/forced-color alternatives readable.
