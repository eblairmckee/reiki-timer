# Tarot Flash — illustration direction and production brief

Generated source sheets, the card-to-cell mapping, and source/SVG comparison galleries live in [artwork/](artwork/README.md). The 78 editable reconstructions are in `src/features/tarot-flash/assets/illustrations/`, named by catalog ID. Use the requirements below for ongoing artwork edits.

Create a cohesive collection of 78 minimal illustrations based on
Rider–Waite–Smith tarot imagery for a mobile-first tarot study app.

## Visual direction

The finished illustrations should sit quietly within the app's Atmosphere background,
complementing the liquid-glass interface without metallic highlights or offset recess effects.

Generate clean source line art that can later be reconstructed as editable
SVG strokes. Apply the glass material during SVG/CSS integration.

- Use restrained contour drawing with smooth curves, rounded line endings,
  and consistent stroke weight.
- Preserve a subtle human quality without sketchy or repeated strokes.
- Use generous negative space and sparse interior detail.
- Leave human faces empty: no eyes, eyebrows, nose lines, mouths, or small facial marks. Preserve animal facial features, including animal-headed figures. Keep head silhouettes and profiles recognizable.
- Remove wrinkles, fold lines, and incidental fabric detail. Keep individual clothing items visibly separate: retain garment edges, hems, cuffs, belts, and boundaries between overlapping layers.
- Retain each card’s recognizable composition, essential figures, objects,
  gestures, and symbolic relationships.
- Preserve meaningful object counts, especially numbered suit symbols.
- Keep the imagery readable at mobile display sizes.
- Use upright RWS compositions throughout.

## Source artwork

- Use one solid dark line color on a transparent background.
- Keep general figures and scenery unfilled; isolate the semantic symbol silhouettes described below.
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

Apply white strokes at width 2.25 and opacity 0.7 in the interface. Use primary
fills at 0.65 opacity and secondary fills at 0.2. Do not add offset highlights,
recess depth, or metallic edges. The playground offers an optional, centered edge
glow (0–3px, off by default). Preserve a solid-stroke fallback for
increased contrast or reduced-transparency preferences.

## Fill hierarchy and review

- **Minor arcana:** every wand, cup, sword, or pentacle receives primary fill; preserve the exact symbol count and necessary negative space inside the symbol.
- **Aces:** the hand emerging from the cloud receives secondary fill in all four suits. Keep the cloud unfilled.
- **Court cards:** keep the suit symbol primary. Horses on knights receive secondary fill. Choose secondary clues individually for the other courts rather than filling every accessory. Candidates already present in the artwork include the Queen of Wands' cat and sunflower, the Page of Cups' fish, the Queen of Swords' butterfly, and the Queen of Pentacles' rabbit.
- **Major arcana:** reserve primary fill for small focal objects. Larger clues use secondary fill, and total filled area should stay around or below 30% of the illustration. Leave most of the composition open; do not fill every symbol simply because it carries meaning. For example, the Empress's scepter is primary and her heart shield is secondary; Strength's lion and the Chariot's body are secondary. On Wheel of Fortune, emphasize the small hub, sword, and books rather than filling the entire wheel and surrounding creatures.
- Keep linear symbols, such as infinity signs and the Devil's outlined pentagram, unfilled. Preserve negative spaces within objects and between limbs.
- Author `data-fill="primary"` or `data-fill="secondary"` on semantic SVG geometry. A fill-only silhouette can use `data-outline="none"` to avoid adding another contour over existing strokes. The application owns color and opacity; these are not baked into reference images.

The [SVG playground](artwork/svg-review.html) uses the actual app renderer and
Atmosphere. It opens with all 78 cards, offers a **Fill studies** subset, and
retains source comparison. Stroke width ranges from 0.5 to 3.5, defaulting to 2.25.
Its controls are local previews; changing them does not write assets or card data.

Reference examples from the approved studies:

| Card | Primary fill | Secondary fill |
| --- | --- | --- |
| Eight of Wands | All eight staffs and their leaves | None |
| The High Priestess | Lunar disk and lower crescent | Pomegranates |
| The Hermit | Lantern's star | Walking staff |
| The Tower | Lightning bolt | Falling crown |

The hierarchy is applied to all 78 SVGs. Every minor-arcana suit symbol has primary
fill, with the pentacle's star filled and its disk left open. All 16 court cards
also have secondary context fills: horses for knights; feathers, clouds, fish,
flowers, animals, or throne symbols for the other courts. Human faces and clothing
detail are simplified across the deck while garment boundaries and animal features remain.
