# Tarot Flash implementation plan

## Goal and scope

Build a mobile-first tarot study experience: open a card, recall its meaning, reveal individual fields, and edit personal interpretations. Use the Reiki timer's atmosphere as the only page background, with the existing liquid-glass controls and surfaces on top.

The [original voice notes](archive/product-brief-voice-notes.md) describe the intended experience. Keep the UI limited to the requested card content and controls; do not add branding, onboarding, explanatory panels, empty-state messages, or other unsolicited UI. Retain the specific validation and recovery feedback required below.

- Ship all 78 Rider–Waite–Smith (RWS) cards with names, numbers, and illustrations. Include editable Thoth aliases, element/zodiac/planet defaults, and upright/reversed keywords from the [seed sources](data-model.md#seed-content). Notes start empty. Use Labyrinthos's general keyword tables, deriving 2–3 keywords from the relevant meaning only where a table is missing.
- Keep the catalog title fixed. Support editable Other names, element, zodiac, planet, upright keywords and notes, and optional reversed keywords and notes. Title editing and imagery notes are outside MVP.
- Save edits in the current browser with IndexedDB. Follow the [data model](data-model.md) for identity, ownership, validation, storage, and future account migration.
- Authentication, remote storage/synchronization, import/export, persistent study filters, scoring, spaced repetition, custom cards/decks, and correspondence-field management are outside MVP. Element, zodiac, and planet values are editable; adding new field definitions has no MVP UI.
- Illustrations are part of MVP; all 78 editable assets are available. Use the [illustration brief](illustration-prompt.md) for artwork direction and coordinate asset work with any concurrent app implementation.

## Routes and initial state

- `/tarot-flash` redirects to a random card. There is no separate home screen.
- `/tarot-flash/{deckIndex}` opens a specific card through a shared route/screen. Use the fixed 1–78 [catalog order](data-model.md#catalog-and-route-identity), independently of the numeral printed in the UI.
- Keep Tarot Flash outside the timer layout with its own state. No navigation between the two features is required.
- Support direct links, refresh, and browser Back/Forward. Handle invalid card URLs explicitly.
- Each newly opened card starts upright with all populated study fields concealed. Reversal never carries over to another card.

## Screen structure

Use the same header/footer composition for view and edit. The editor follows the Reiki timer’s spacious label-and-control rows, stacking fields where a narrow viewport needs it. The body scrolls between sticky header and footer; notes may extend below the fold. Account for mobile safe areas and the software keyboard so controls and focused fields remain reachable.

### Header

- Always show the card's display numeral and fixed catalog title. In view mode, show Other names as a comma-separated subtitle beneath the title; omit it when empty. Allow long subtitles to wrap without displacing controls offscreen. The title is not editable in MVP.
- Do not display a “Tarot Flash” title or a separate orientation label.
- Center the title between equal-width control slots. Place secondary frosted Edit at the far left and primary Reverse at the far right. Use generous icon targets (60px for header/footer actions), with clearly sized glyphs.
- Header and footer action buttons are always icon-only, with accessible names. Do not pair an icon with visible button text. The explicitly requested Roman-numeral rank controls, matching-name chips, and clickable validation text retain their own treatments.
- Reverse remains available in both view and edit. It toggles upright/reversed, with distinct icons/states and a restrained morph/transition.
- In edit mode, show a Close icon at the far left in place of Edit; it follows the draft-cancel rules. Keep the title centered and Reverse at the right. Use a checkmark for Save.

### Content order

1. **Illustration:** show the shared illustration in view mode only, without a section label. There is no imagery-notes field. Give the artwork roughly 30% of the initial viewing area, adapting to its detail and available space rather than clipping content.
2. **Correspondences:** individually revealable element, zodiac, and planet values, shared across orientations.
3. **Keywords:** selected orientation's keywords, displayed as noninteractive, fully rounded liquid-glass chips.
4. **Notes:** selected orientation's notes; optional and allowed to extend below the fold.

View mode has no visible field labels. Keep sections and reveal controls accessibly named. Show labels only while editing, without “Upright” or “Reversed” prefixes.

### Footer modes

| Mode | Controls and layout |
| --- | --- |
| Viewing | Search at the left, with the larger share of available width (approximately 50–70%); Shuffle at the right. Both are icon buttons. |
| Searching | Text input occupies the available width. The search icon moves to its right as a separate Submit button, replacing Shuffle. Keep its hit target and glass surface outside the input; never nest pressables. Filter/result rows expand above the input. |
| Editing | Save is the only primary footer action, an icon button at bottom right. Validation/storage feedback occupies space to its left. Search and Shuffle are absent. |

Use the Reiki timer’s existing motion: native foreground transitions for route changes and the shared Scene/AnimatePresence pattern for view/edit changes. Keep the atmosphere continuous, exiting content inert, focus in the active mode, and reduced-motion changes immediate. Use shared motion tokens for local feedback and disclosure.

## Search: typing and buttons together

### Opening and progressive controls

- Opening Search focuses a text input and requests the normal search/text keyboard. Do not implement a numeric keyboard, keyboard-mode switch, or custom software keyboard.
- Show five filter icon buttons above the input: Wands, Cups, Swords, Pentacles, and Major Arcana. Use an attached Olyx/Base UI toggle group: connected segments within one glass surface, left-aligned. Use the same attached treatment and arrow-key navigation for rank/court rows. Allow changing or clearing the active category filter.
- Selecting a minor suit reveals a horizontally scrollable rank row: Roman numerals I–X, then distinct icons for Page, Knight, Queen, and King. Court ranks also accept typed numbers 11–14 respectively.
- Selecting Major Arcana uses the text input and inline autocomplete, without a secondary numeral row. Match names and Roman/Arabic numerals, including 0 for The Fool.
- Selecting a Minor rank button identifies one card and opens it immediately; typing is not required for this path.
- For text search, begin matching after at least one non-whitespace character. The active filter constrains matches. Typing and quick selection remain available together.

### Matching and suggestions

Follow the [search contract](data-model.md#search-contract), including these behaviors:

- Match names, user-added alternative names (including named Minors), and suit/rank queries.
- Treat `2 of swords`, `II of swords`, and `two of swords` as the same card. Support number words, Arabic numbers, Roman numerals, Ace/one, and court names, both in full queries and under an active filter.
- A suit-only query such as `swords` is incomplete. Prompt for a rank or specific card name; submitting it must not arbitrarily choose a card.
- Show the first matching name as inline autocomplete inside the input, visually separating the completion from the user's typed text without overwriting it.
- When there are multiple matching names, show a compact, horizontally scrollable chip row immediately above the input, pushing the filter rows upward. In the fullest state, the order is category row, rank row, matching-name row, input.
- Keep suggestion chips separate, fully rounded, and translucent with the liquid-glass button variant. Bound/truncate labels while retaining the full accessible name. Preserve separate matches for different names of the same card; do not deduplicate results by card.
- The input's clear X uses the foreground color and remains a separately focusable sibling of the input. Clearing the query keeps focus in the input and preserves the selected category.
- Activating a chip opens its card. Enter or Submit accepts the current inline suggestion, initially the first match. Close search and animate back to the viewing footer after successful selection.
- Provide clear incomplete-query/no-match feedback. Dismiss search on outside pointer interaction, focus leaving the footer, or Escape; no Close button. Interacting with filters/results/input/Submit keeps search open until selection. Canceling search keeps the current card and shuffle history; Escape returns focus to Search, while outside interaction preserves the user's new focus target.
- Do not add a search heading, introductory instructions, or a visible match-count summary.

## Studying and shuffling

### Field reveal

- Initially, card identity and the illustration are exposed. Each populated study section, including default correspondences, is concealed behind an interactive skeleton/reveal surface.
- Activate each surface independently to reveal its content. Concealment is a study state, distinct from data loading.
- Use each item's actual responsive geometry in both states: identical width, height, padding, borders, radius, and wrapping, with no reveal layout shift. Keyword skeletons are individual fully rounded pills matching their tags; correspondence values and notes retain their own shapes. Keep concealed content in layout so content/viewport changes need no measured estimates.
- Center a very translucent category icon on each skeleton: planet, zodiac wheel, four alchemical elements, keyword tag, or notes. Category hints must not expose the answer. Prefer Hugeicons; use matching custom strokes for the zodiac wheel and four-element symbol.
- Use actual backdrop blur with a light translucent tint so skeletons follow the atmosphere behind them. A faint 28-second glint adds a slow interaction cue; avoid opaque moving gradients and raised/bubbly rims. Preserve hover, pressed and focus states. Disable shimmer for reduced motion; reveal fades without changing layout.
- Concealed answers must also be hidden from assistive technology until revealed. The always-visible illustration retains its accessible description. Keep reveal controls meaningfully labeled.
- Empty study fields render no section, skeleton, placeholder, message, or guidance. Empty starter cards remain viewable without validation errors. Reveal controls are visually skeletons, with accessible labels rather than visible “Reveal” instructions.
- On orientation changes, preserve shared-section reveal state and conceal the newly selected keywords/notes. Returning to an orientation conceals its meanings again. Shared artwork/correspondences remain the same data.
- Reverse remains usable without a configured reversed meaning. Leave absent reversed fields empty without a message or substituted upright content.

### Shuffle session

- Shuffle always samples all 78 cards, regardless of search filters or how much study content is configured.
- Maintain a visited-card set for the current tab/library and retain it across refreshes. The initially opened/current card counts as visited; revealing fields or reversing does not create another visit.
- Choose randomly from unvisited cards. When exhausted, start a new pass with the current card already marked visited, avoiding an immediate repeat.
- Successfully opening a search result starts a fresh pass with that selected card marked visited. Changing filters, typing, or canceling search alone does not reset the pass.
- Browser Back/Forward marks the opened card visited without resetting the pass. Save/Cancel is not card navigation and does not reset shuffle history.
- Keep this transient session separate from saved card content; it is not study analytics or persistent filtering.

## Editing and saving

- Create a draft of the full card; reveal all editable content. Edit Other names, correspondences, keywords, and notes in that order. Do not show the illustration, a Symbology & imagery label, or an imagery-notes field while editing.
- Use glass multi-select controls for Element (Fire, Water, Air, Earth), Zodiac (the twelve signs, Aries through Pisces), and Planet (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto). Draw elemental icons as alchemical triangles: upright Fire/Air, inverted Water/Earth, with a crossbar for Air/Earth. Preserve existing stored values while limiting new choices to these catalogs. All three fields remain optional. Start with the sourced defaults where assigned; preserve saved personal choices, including cleared values.
- Use Hugeicons zodiac glyphs and matching planetary symbols where available; provide custom astrological glyphs for the missing planets. Options show their icon and name. Selected form values show only the icon when one exists, keeping an accessible name and hover title; older values without an icon retain their text. Open menus use the textarea's translucent tint and stronger backdrop blur. Keyword selections remain separate, rounded liquid-glass chips with foreground-colored remove icons.
- Other names uses the same removable-chip, free-entry combobox as Keywords. A comma immediately commits the typed value; comma-separated paste adds multiple values. Ignore blank and duplicate entries.
- Keywords use a glass multi-select combobox: suggest existing personal keywords across the library, allow adding a new keyword, and show individually removable selections. Adapt the Olyx/Base UI composition and keyboard behavior. Keep labels simply “Keywords” and “Notes” in both orientations; do not append “Optional” to Notes.
- Reverse selects which meaning to edit and preserves both orientations' draft values. Shared editable fields stay visible but disabled while reversed; edit them in upright mode. Bundled artwork is shown only in view mode.
- Reversed content is entirely optional. Adding reversed notes without keywords is valid; neither field becomes required when the other is entered.
- Saving requires at least one nonblank **upright keyword**. Notes and correspondences are optional. Follow the [validation rules](data-model.md#validation-and-empty-cards); defaults satisfy this requirement, while removing every upright keyword disables Save.
- Show validation when entering edit mode and update it as values change. Disable Save while invalid or saving. Empty reversed content must never disable Save.
- Place concise validation feedback to the left of Save and associate it with the actual field. Activating the message selects the appropriate orientation, scrolls to the field, and focuses it. For a missing upright keyword while viewing reversed edits, switch to upright.
- Save explicitly persists the entire draft, including both meanings, as one operation. On success return to the same card and selected orientation in view mode, with study sections concealed.
- Do not add a visible success notice or editing guidance panel. Accessible status announcements and input-format descriptions may remain available to assistive technology.
- Cancel discards the draft and returns to the saved card. Confirm discarding unsaved changes when canceling or navigating away; preserve the draft if the user stays.
- Storage failures and stale-revision conflicts preserve the draft and offer deliberate recovery. Do not silently overwrite newer data or reset to starter content. Prevent duplicate saves and ignore results from obsolete navigation/requests.

## Illustrations and visual treatment

Use the [illustration prompt](illustration-prompt.md) as the artwork specification. Every catalog card has its own RWS-based SVG in `src/features/tarot-flash/assets/illustrations/`. The [artwork guide](artwork/README.md) documents the source references, current card mapping, and SVG comparison gallery.

- Use the same Atmosphere component as the Reiki timer across all Tarot Flash states. Keep the screen, header, footer, and content canvas transparent; do not add an opaque page panel, alternate background, or header/footer bands. Apply liquid-glass material to controls, inputs, and reveal surfaces.
- Integrate genuine editable SVG strokes with consistent viewBox/margins, unfilled shapes where appropriate, and rounded caps/joins.
- Default to white, 2.25-unit strokes at 0.7 opacity. Remove the offset/recess and metallic highlight treatment. Primary symbol fills use 0.65 opacity; secondary context fills use 0.2. Composite each opacity layer together so overlapping contour fragments do not create dark or bright joints.
- Remove clothing wrinkles and folds while keeping individual garments and overlapping layers distinct. Leave human faces empty without eyes, nose lines, mouths, or other facial marks; preserve animal facial features, head silhouettes, and gestures. Fill every minor-arcana suit symbol with the primary treatment. Aces' hands, court-card horses, and useful court-specific clues use secondary fill. In major arcana, reserve primary fill for small objects, use secondary fill for larger clues, and aim for at most 30% total fill coverage. Keep linear symbols such as infinity signs unfilled; see the [illustration direction](illustration-prompt.md#fill-hierarchy-and-review).
- Use the [editable SVG playground](artwork/svg-review.html) for visual review: all 78 assets, the same application Atmosphere and illustration renderer, color and opacity controls, optional edge glow, and source comparison. Stroke width defaults to 2.25 with a 0.5–3.5 slider range. Edge glow ranges from 0–3px and starts off. Preview controls do not modify saved card content or asset files.
- Apply translucent material effects at rendering time. Preserve legibility over the actual surface and provide solid-stroke contrast/reduced-transparency fallbacks.
- Map assets to stable catalog IDs as described in [illustration assets](data-model.md#illustration-assets). Ship the illustration integration with MVP; missing assets are an outstanding delivery dependency, not a reason to remove artwork from scope.
- Do not add missing-artwork or loading-artwork copy to the card. Reserve an available asset's space while it loads. SVG reconstruction is owned by the separate artwork session.
- Keep footer transformations, filter-row insertion/removal, reveal, and reversal smooth but snappy. Preserve spatial continuity and support reduced motion without depending on animation to communicate state.

## Implementation sequence and acceptance

Follow repository guidance in [AGENTS.md](../../AGENTS.md). Reuse existing design-system contracts; keep tarot rules, content, state, and I/O feature-owned. Use the [data model's placement](data-model.md#repository-placement) to organize implementation.

1. Build the catalog, seed library with correspondence defaults, validation, IndexedDB service, and identity-based asset mapping.
2. Add the isolated routes and shared view/edit composition, with loading and storage-error recovery. Leave empty study fields empty.
3. Implement normalized search, progressive controls, reveal/orientation state, and shuffle sessions.
4. Complete draft editing, validation focus, save/conflict recovery, and illustration integration.
5. Verify the product behaviors below and follow the repository's current verification requirements. Use the existing dev server at `http://localhost:5173` in the in-app browser for visual checks of implemented UI.

| Acceptance area | Required evidence |
| --- | --- |
| Catalog and storage | Exactly 78 stable identities/routes; sourced correspondence and upright/reversed keyword defaults with blank notes; saved edits survive reload and seed updates after the authorized one-time test-content replacement; initialization is safe across tabs. |
| Search | All three forms of “two of swords” resolve identically; Minor quick rows and Major autocomplete work; aliases remain separate results; incomplete/no-match queries and dismissal work. |
| Study | Independent reveals, stable height, hidden answers, upright-on-navigation, absent fields without added messages, and no-repeat shuffle/reset/exhaustion behavior. |
| Editing | Seeds with no personal meanings open; upright keywords gate Save; reversed fields never become required; drafts survive toggles/failures; error links focus the right orientation/field; conflicts do not overwrite. |
| Mobile and accessibility | Sticky controls remain reachable with keyboard/safe areas; long names/chips/notes fit; keyboard activation/focus, ordinary/reduced motion, and SVG contrast are checked. |
| Integration | Direct links and Back/Forward work; all 78 illustrations map correctly; Tarot Flash does not change the timer's flow. |
| Appearance | Atmosphere is the only page background; controls use liquid glass; header/footer actions are icon-only; no product title or unsolicited UI. |
