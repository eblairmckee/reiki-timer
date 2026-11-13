# Tarot Flash — illustration direction and production brief

Create a cohesive collection of 78 minimal illustrations based on
Rider–Waite–Smith tarot imagery for a mobile-first tarot study app.

## Visual direction

The finished illustrations should feel delicately etched into glass,
complementing a liquid-glass interface and its fine, translucent dial markings.

Generate clean source line art that can later be reconstructed as editable
SVG strokes. Apply the glass material during SVG/CSS integration.

- Use restrained contour drawing with smooth curves, rounded line endings,
  and consistent stroke weight.
- Preserve a subtle human quality without sketchy or repeated strokes.
- Use generous negative space and sparse interior detail.
- Retain each card’s recognizable composition, essential figures, objects,
  gestures, and symbolic relationships.
- Preserve meaningful object counts, especially numbered suit symbols.
- Keep the imagery readable at mobile display sizes.
- Use upright RWS compositions throughout.

## Source artwork

- Use one solid dark line color on a transparent background.
- Keep shapes unfilled wherever possible.
- Leave clear separation between nearby lines.
- Avoid gradients, shading, crosshatching, paper texture, glow, blur,
  baked-in translucency, shadows, or simulated glass backgrounds.
- Exclude titles, numerals, lettering, card borders, and sticker outlines.
- Simplify secondary scenery while preserving useful visual study clues.

## Sheet composition

- Arrange illustrations in a regular grid with equal-sized portrait cells.
- Maintain consistent apparent scale, stroke weight, and internal margins.
- Leave generous transparent gutters for reliable extraction.
- Keep every illustration entirely within its cell.
- Provide the card-to-cell mapping separately as text.
- Produce the full collection in small batches after establishing the style,
  maintaining enough resolution to inspect individual strokes.

## First style sample

Begin with a 2 × 2 sheet in this order:

1. The Fool
2. Two of Swords
3. Queen of Cups
4. The Tower

Use this sample to establish the balance between recognizable RWS imagery,
minimal detail, and consistent line work before extending the collection.

## Final SVG production requirements

The image-generation output is a visual reference. The final application
assets must contain genuine editable vector paths.

- Reconstruct line centerlines as stroked paths; avoid embedding raster
  images or converting every line into a filled outline.
- Use consistent viewBox dimensions and deliberate path grouping.
- Support CSS-controlled stroke color, width, and opacity.
- Use rounded caps and joins, with unfilled shapes where appropriate.
- Keep essential geometry separate from decorative material effects.

Match the existing dial’s etched treatment using:
- A main stroke driven by `--sys-color-etch-ink`.
- A subtly offset highlight driven by `--sys-color-etch-light`.
- Reduced emphasis for secondary details.

Apply these effects in the interface, with sufficient contrast over the
actual background. Preserve a clear, solid-stroke fallback for increased
contrast or reduced-transparency preferences.