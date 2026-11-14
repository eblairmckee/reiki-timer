# Tarot Flash artwork

78 Rider–Waite–Smith illustrations are available as editable SVG strokes in [the application asset directory](../../../src/features/tarot-flash/assets/illustrations/), one file per catalog ID. The original references remain here as 20 transparent PNG sheets and 9 individual revisions. Sheet 00 retains the four approved style samples.

Open [the SVG comparison gallery](http://localhost:5173/docs/tarot-flash/artwork/svg-review.html) with the development server running to compare each reconstruction with its source, browse by suit, and adjust stroke width or color.

Open [the review gallery](index.html) for the complete deck or select a source sheet or revised card. It supplies a white viewing surface without modifying the transparent artwork. With the existing development server running, open [the local gallery](http://localhost:5173/docs/tarot-flash/artwork/index.html). The gallery also opens directly as a local file and has no external dependencies.

## Files and identity

- `sheets/`: original generated PNG sheets, named by batch and stable card IDs. Some cells have been superseded by individual revisions.
- `cards/`: individual replacements for symbol-count clarity or composition. These are full-image references.
- [manifest.json](manifest.json): all 78 catalog IDs, fixed deck indexes, source/SVG paths, zero-based cell positions, pixel crop rectangles, the common style prompt, and card subject prompts.
- [index.html](index.html): a static review gallery showing only the current reference for each card. Sheet-based cards use clipped viewports; no pixels are rewritten.
- [svg-review.html](svg-review.html): the editable SVG playground. It renders all 78 cards with the same Atmosphere, illustration renderer, white strokes and fill layers as the app. Filter by suit, card or fill study; adjust color, stroke/fill opacity, edge glow, card size and the background palette; optionally compare with the source. Stroke width defaults to 2.25 and ranges from 0.5 to 3.5. Edge glow ranges from 0–3px and starts off. Preview settings do not edit assets. Open through the development server.

All source images are 1024 × 1536 pixels. Original sheets have a 2 × 2 grid of 512 × 768 portrait cells, ordered top left, top right, bottom left, bottom right. Sheet 19 has two unused lower cells. Individual revisions use the entire 1024 × 1536 image.

The manifest is authoritative: look up `cards[catalogCardId].sheetId`, then resolve the file in `sheets`. Read each source's `columns` and `rows`; revision sources are 1 × 1. Each source lists both its original `cards` and its currently selected `activeCards`. Use the per-card mapping rather than extracting every original sheet cell. Card identity and route order follow the [data model](../data-model.md#catalog-and-route-identity).

## Editable SVGs

The 78 files at `src/features/tarot-flash/assets/illustrations/<catalogCardId>.svg` contain editable Bézier paths, descriptive titles and alternatives, and a shared `0 0 240 360` viewBox. Contours fit within a centered 216 × 324 area without changing their proportions. Groups separate semantic fills, closed contours, open contours, and isolated point details; individual paths have IDs for editing. The approved [fill hierarchy](../illustration-prompt.md#fill-hierarchy-and-review) applies throughout the deck: all suit symbols receive primary fill; aces’ hands and court-card context receive secondary fill. Major arcana reserve primary fill for small objects, use secondary fill for larger clues, and aim for at most 30% filled area. Linear symbols stay unfilled. Human facial features and clothing-fold detail are removed; garment boundaries and animal features remain.

The existing [illustration manifest](../../../src/features/tarot-flash/data/illustrations.ts) loads SVGs by catalog identity. The application parser reads geometry, descriptive alternatives and explicit fill roles. The renderer applies white strokes at width 2.25 and opacity 0.7, primary fills at 0.65, and secondary fills at 0.2, without offset/recess effects. Standalone source files retain `currentColor`, rounded caps/joins and their neutral source stroke defaults. No raster images, filled automatic outlines, filters, or baked-in glass effects are embedded.

Initial reconstruction followed the current source mapping: alpha thresholding, centerline thinning, removal of short terminal artifacts, joining contiguous contours, and cubic curve fitting with a 0.32-viewBox-unit tolerance. The subsequent simplification and fill pass edits those vectors while preserving the original PNG references. Fill-only silhouettes join existing contours, with closed boundaries for cropped or open symbols. Two stray fragments from adjacent sheet cells were removed from the Hierophant and Queen of Cups.

All 78 assets are covered by [loader and parser checks](../../../src/features/tarot-flash/data/illustrations.test.ts). The SVG gallery supports visual comparison; it is not an application route or a second runtime manifest. Keep future changes aligned with the [illustration specification](../illustration-prompt.md).

## Current card-to-source mapping

| Deck index | Catalog ID | Card | SVG | Source | Cell |
| --- | --- | --- | --- | --- | --- |
| 1 | `major-00` | The Fool | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-00.svg) | [00](sheets/00-style-sample.png) | Top left |
| 2 | `major-01` | The Magician | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-01.svg) | [01](sheets/01-major-01-to-major-04.png) | Top left |
| 3 | `major-02` | The High Priestess | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-02.svg) | [01](sheets/01-major-01-to-major-04.png) | Top right |
| 4 | `major-03` | The Empress | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-03.svg) | [01](sheets/01-major-01-to-major-04.png) | Bottom left |
| 5 | `major-04` | The Emperor | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-04.svg) | [01](sheets/01-major-01-to-major-04.png) | Bottom right |
| 6 | `major-05` | The Hierophant | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-05.svg) | [02](sheets/02-major-05-to-major-08.png) | Top left |
| 7 | `major-06` | The Lovers | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-06.svg) | [02](sheets/02-major-05-to-major-08.png) | Top right |
| 8 | `major-07` | The Chariot | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-07.svg) | [02](sheets/02-major-05-to-major-08.png) | Bottom left |
| 9 | `major-08` | Strength | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-08.svg) | [02](sheets/02-major-05-to-major-08.png) | Bottom right |
| 10 | `major-09` | The Hermit | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-09.svg) | [03](sheets/03-major-09-to-major-12.png) | Top left |
| 11 | `major-10` | Wheel of Fortune | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-10.svg) | [03](sheets/03-major-09-to-major-12.png) | Top right |
| 12 | `major-11` | Justice | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-11.svg) | [03](sheets/03-major-09-to-major-12.png) | Bottom left |
| 13 | `major-12` | The Hanged Man | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-12.svg) | [03](sheets/03-major-09-to-major-12.png) | Bottom right |
| 14 | `major-13` | Death | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-13.svg) | [04](sheets/04-major-13-to-major-17.png) | Top left |
| 15 | `major-14` | Temperance | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-14.svg) | [04](sheets/04-major-13-to-major-17.png) | Top right |
| 16 | `major-15` | The Devil | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-15.svg) | [04](sheets/04-major-13-to-major-17.png) | Bottom left |
| 17 | `major-16` | The Tower | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-16.svg) | [00](sheets/00-style-sample.png) | Bottom right |
| 18 | `major-17` | The Star | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-17.svg) | [Revised](cards/major-17.png) | Whole image |
| 19 | `major-18` | The Moon | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-18.svg) | [05](sheets/05-major-18-to-major-21.png) | Top left |
| 20 | `major-19` | The Sun | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-19.svg) | [05](sheets/05-major-18-to-major-21.png) | Top right |
| 21 | `major-20` | Judgement | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-20.svg) | [05](sheets/05-major-18-to-major-21.png) | Bottom left |
| 22 | `major-21` | The World | [SVG](../../../src/features/tarot-flash/assets/illustrations/major-21.svg) | [05](sheets/05-major-18-to-major-21.png) | Bottom right |
| 23 | `wands-01` | Ace of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-01.svg) | [06](sheets/06-wands-01-to-wands-04.png) | Top left |
| 24 | `wands-02` | Two of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-02.svg) | [06](sheets/06-wands-01-to-wands-04.png) | Top right |
| 25 | `wands-03` | Three of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-03.svg) | [06](sheets/06-wands-01-to-wands-04.png) | Bottom left |
| 26 | `wands-04` | Four of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-04.svg) | [06](sheets/06-wands-01-to-wands-04.png) | Bottom right |
| 27 | `wands-05` | Five of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-05.svg) | [Revised](cards/wands-05.png) | Whole image |
| 28 | `wands-06` | Six of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-06.svg) | [07](sheets/07-wands-05-to-wands-08.png) | Top right |
| 29 | `wands-07` | Seven of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-07.svg) | [07](sheets/07-wands-05-to-wands-08.png) | Bottom left |
| 30 | `wands-08` | Eight of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-08.svg) | [Revised](cards/wands-08.png) | Whole image |
| 31 | `wands-09` | Nine of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-09.svg) | [08](sheets/08-wands-09-to-wands-12.png) | Top left |
| 32 | `wands-10` | Ten of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-10.svg) | [Revised](cards/wands-10.png) | Whole image |
| 33 | `wands-11` | Page of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-11.svg) | [08](sheets/08-wands-09-to-wands-12.png) | Bottom left |
| 34 | `wands-12` | Knight of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-12.svg) | [08](sheets/08-wands-09-to-wands-12.png) | Bottom right |
| 35 | `wands-13` | Queen of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-13.svg) | [09](sheets/09-wands-13-to-cups-02.png) | Top left |
| 36 | `wands-14` | King of Wands | [SVG](../../../src/features/tarot-flash/assets/illustrations/wands-14.svg) | [09](sheets/09-wands-13-to-cups-02.png) | Top right |
| 37 | `cups-01` | Ace of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-01.svg) | [09](sheets/09-wands-13-to-cups-02.png) | Bottom left |
| 38 | `cups-02` | Two of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-02.svg) | [09](sheets/09-wands-13-to-cups-02.png) | Bottom right |
| 39 | `cups-03` | Three of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-03.svg) | [10](sheets/10-cups-03-to-cups-06.png) | Top left |
| 40 | `cups-04` | Four of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-04.svg) | [10](sheets/10-cups-03-to-cups-06.png) | Top right |
| 41 | `cups-05` | Five of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-05.svg) | [10](sheets/10-cups-03-to-cups-06.png) | Bottom left |
| 42 | `cups-06` | Six of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-06.svg) | [10](sheets/10-cups-03-to-cups-06.png) | Bottom right |
| 43 | `cups-07` | Seven of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-07.svg) | [11](sheets/11-cups-07-to-cups-10.png) | Top left |
| 44 | `cups-08` | Eight of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-08.svg) | [11](sheets/11-cups-07-to-cups-10.png) | Top right |
| 45 | `cups-09` | Nine of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-09.svg) | [11](sheets/11-cups-07-to-cups-10.png) | Bottom left |
| 46 | `cups-10` | Ten of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-10.svg) | [11](sheets/11-cups-07-to-cups-10.png) | Bottom right |
| 47 | `cups-11` | Page of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-11.svg) | [12](sheets/12-cups-11-to-swords-01.png) | Top left |
| 48 | `cups-12` | Knight of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-12.svg) | [12](sheets/12-cups-11-to-swords-01.png) | Top right |
| 49 | `cups-13` | Queen of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-13.svg) | [00](sheets/00-style-sample.png) | Bottom left |
| 50 | `cups-14` | King of Cups | [SVG](../../../src/features/tarot-flash/assets/illustrations/cups-14.svg) | [12](sheets/12-cups-11-to-swords-01.png) | Bottom left |
| 51 | `swords-01` | Ace of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-01.svg) | [12](sheets/12-cups-11-to-swords-01.png) | Bottom right |
| 52 | `swords-02` | Two of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-02.svg) | [00](sheets/00-style-sample.png) | Top right |
| 53 | `swords-03` | Three of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-03.svg) | [13](sheets/13-swords-03-to-swords-06.png) | Top left |
| 54 | `swords-04` | Four of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-04.svg) | [13](sheets/13-swords-03-to-swords-06.png) | Top right |
| 55 | `swords-05` | Five of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-05.svg) | [13](sheets/13-swords-03-to-swords-06.png) | Bottom left |
| 56 | `swords-06` | Six of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-06.svg) | [Revised](cards/swords-06.png) | Whole image |
| 57 | `swords-07` | Seven of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-07.svg) | [14](sheets/14-swords-07-to-swords-10.png) | Top left |
| 58 | `swords-08` | Eight of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-08.svg) | [Revised](cards/swords-08.png) | Whole image |
| 59 | `swords-09` | Nine of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-09.svg) | [14](sheets/14-swords-07-to-swords-10.png) | Bottom left |
| 60 | `swords-10` | Ten of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-10.svg) | [14](sheets/14-swords-07-to-swords-10.png) | Bottom right |
| 61 | `swords-11` | Page of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-11.svg) | [Revised](cards/swords-11.png) | Whole image |
| 62 | `swords-12` | Knight of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-12.svg) | [Revised](cards/swords-12.png) | Whole image |
| 63 | `swords-13` | Queen of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-13.svg) | [15](sheets/15-swords-11-to-swords-14.png) | Bottom left |
| 64 | `swords-14` | King of Swords | [SVG](../../../src/features/tarot-flash/assets/illustrations/swords-14.svg) | [15](sheets/15-swords-11-to-swords-14.png) | Bottom right |
| 65 | `pentacles-01` | Ace of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-01.svg) | [16](sheets/16-pentacles-01-to-pentacles-04.png) | Top left |
| 66 | `pentacles-02` | Two of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-02.svg) | [16](sheets/16-pentacles-01-to-pentacles-04.png) | Top right |
| 67 | `pentacles-03` | Three of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-03.svg) | [16](sheets/16-pentacles-01-to-pentacles-04.png) | Bottom left |
| 68 | `pentacles-04` | Four of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-04.svg) | [16](sheets/16-pentacles-01-to-pentacles-04.png) | Bottom right |
| 69 | `pentacles-05` | Five of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-05.svg) | [17](sheets/17-pentacles-05-to-pentacles-08.png) | Top left |
| 70 | `pentacles-06` | Six of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-06.svg) | [17](sheets/17-pentacles-05-to-pentacles-08.png) | Top right |
| 71 | `pentacles-07` | Seven of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-07.svg) | [17](sheets/17-pentacles-05-to-pentacles-08.png) | Bottom left |
| 72 | `pentacles-08` | Eight of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-08.svg) | [17](sheets/17-pentacles-05-to-pentacles-08.png) | Bottom right |
| 73 | `pentacles-09` | Nine of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-09.svg) | [Revised](cards/pentacles-09.png) | Whole image |
| 74 | `pentacles-10` | Ten of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-10.svg) | [18](sheets/18-pentacles-09-to-pentacles-12.png) | Top right |
| 75 | `pentacles-11` | Page of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-11.svg) | [18](sheets/18-pentacles-09-to-pentacles-12.png) | Bottom left |
| 76 | `pentacles-12` | Knight of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-12.svg) | [18](sheets/18-pentacles-09-to-pentacles-12.png) | Bottom right |
| 77 | `pentacles-13` | Queen of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-13.svg) | [19](sheets/19-pentacles-13-to-pentacles-14.png) | Top left |
| 78 | `pentacles-14` | King of Pentacles | [SVG](../../../src/features/tarot-flash/assets/illustrations/pentacles-14.svg) | [19](sheets/19-pentacles-13-to-pentacles-14.png) | Top right |
