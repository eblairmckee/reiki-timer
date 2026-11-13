# Tarot Flash implementation plan

## Goal and scope

Build a mobile-first tarot study experience: open a card, recall its meaning, reveal individual fields, and edit personal interpretations in the same layout. Use the app's existing liquid-glass design system.

- Ship all 78 Rider–Waite–Smith (RWS) cards with names, numbers, and illustrations. All user-authored study fields start empty; do not seed meanings or placeholder keywords.
- Support multiple editable names, element, zodiac, symbology/imagery text, upright keywords and notes, and optional reversed keywords and notes.
- Save edits in the current browser with IndexedDB. Follow the [data model](data-model.md) for identity, ownership, validation, storage, and future account migration.
- Authentication, remote storage/synchronization, import/export, persistent study filters, scoring, spaced repetition, custom cards/decks, and correspondence-field management are outside MVP. Element and zodiac values are editable; adding new field definitions has no MVP UI.
- Illustrations are part of MVP and are being produced in a separate session using the [illustration brief](illustration-prompt.md). Coordinate asset integration without modifying that session's prompt or in-progress outputs.

## Routes and initial state

- `/tarot-flash` redirects to a random card. There is no separate home screen.
- `/tarot-flash/{deckIndex}` opens a specific card through a shared route/screen. Use the fixed 1–78 [catalog order](data-model.md#catalog-and-route-identity), independently of the numeral printed in the UI.
- Keep Tarot Flash outside the timer layout with its own state. No navigation between the two features is required.
- Support direct links, refresh, and browser Back/Forward. Handle invalid card URLs explicitly.
- Each newly opened card starts upright with all populated study fields concealed. Reversal never carries over to another card.

## Screen structure

Use one core composition for view and edit, keeping field positions and hierarchy consistent. The body scrolls between sticky header and footer; notes may extend below the fold. Account for mobile safe areas and the software keyboard so controls and focused fields remain reachable.

### Header

- Always show the card's display numeral and all configured names, comma-separated. Allow long/multiple names to wrap without displacing controls offscreen; use the catalog name when no custom names remain.
- Position controls to the right of the title: secondary Edit next to it, primary Reverse at the far right.
- Reverse remains available in both view and edit. It toggles upright/reversed, with distinct icons/states and a restrained morph/transition.
- In edit mode, provide Cancel in place of Edit. Keep the title and Reverse control in the same overall layout.

### Content order

1. **Symbology and imagery:** shared illustration and editable descriptive text, grouped as one revealable section. Give the artwork roughly 30% of the initial viewing area, adapting to its detail and available space rather than clipping content.
2. **Correspondences:** individually revealable element and zodiac values, shared across orientations.
3. **Keywords:** selected orientation's keywords, displayed as noninteractive chips with a secondary/recessed treatment distinct from search-result chips.
4. **Notes:** selected orientation's notes; optional and allowed to extend below the fold.

### Footer modes

| Mode | Controls and layout |
| --- | --- |
| Viewing | Search at the left, with the larger share of available width (approximately 50–70%); Shuffle at the right. The resting search affordance is an icon control. |
| Searching | Text input occupies the available width. The search icon moves to its right end and becomes Submit, replacing Shuffle. Filter/result rows expand above the input. |
| Editing | Save is the only primary footer action, at bottom right. Validation/storage feedback occupies space to its left. Search and Shuffle are absent. |

Animate transitions between these modes, keeping the change of available actions clear.

## Search: typing and buttons together

### Opening and progressive controls

- Opening Search focuses a text input and requests the normal search/text keyboard. Do not implement a numeric keyboard, keyboard-mode switch, or custom software keyboard.
- Show five filter icon buttons above the input: Wands, Cups, Swords, Pentacles, and Major Arcana. Allow changing or clearing the active filter.
- Selecting a minor suit reveals a horizontally scrollable rank row: Roman numerals I–X, then distinct icons for Page, Knight, Queen, and King. Court ranks also accept typed numbers 11–14 respectively.
- Selecting Major Arcana reveals a horizontally scrollable numeral row: 0 for The Fool, then I–XXI.
- Selecting a rank/numeral button identifies one card and opens it immediately; typing is not required for this path.
- For text search, begin matching after at least one non-whitespace character. The active filter constrains matches. Typing and quick selection remain available together.

### Matching and suggestions

Follow the [search contract](data-model.md#search-contract), including these behaviors:

- Match names, user-added alternative names (including named Minors), and suit/rank queries.
- Treat `2 of swords`, `II of swords`, and `two of swords` as the same card. Support number words, Arabic numbers, Roman numerals, Ace/one, and court names, both in full queries and under an active filter.
- A suit-only query such as `swords` is incomplete. Prompt for a rank or specific card name; submitting it must not arbitrarily choose a card.
- Show the first matching name as inline autocomplete inside the input, visually separating the completion from the user's typed text without overwriting it.
- When there are multiple matching names, show a compact, horizontally scrollable chip row immediately above the input, pushing the filter rows upward. In the fullest state, the order is category row, rank row, matching-name row, input.
- Keep chips compact with bounded/truncated labels while retaining the full accessible name. Preserve separate matches for different names of the same card; do not deduplicate results by card.
- Activating a chip opens its card. Enter or Submit accepts the current inline suggestion, initially the first match. Close search and animate back to the viewing footer after successful selection.
- Provide clear incomplete-query/no-match feedback and an accessible way to dismiss search, including touch and Escape. Canceling search keeps the current card and shuffle history; return focus appropriately.

## Studying and shuffling

### Field reveal

- Initially, only card identity is exposed. Each populated study section is concealed behind an interactive skeleton/reveal surface.
- Activate each surface independently to reveal its content. Concealment is a study state, distinct from data loading.
- Reserve the revealed content's actual responsive height to prevent layout shifts; the concealed shape may hint at the amount of content. Recalculate appropriately for orientation/content/viewport changes.
- Provide hover, pressed, and visible keyboard-focus states. Use a subtle shimmer/fade for reveal, respecting reduced motion.
- Concealed answers, including descriptive illustration alternatives, must also be hidden from assistive technology until revealed. Keep reveal controls meaningfully labeled.
- Empty study fields have no fake reveal content. Empty starter cards are viewable without validation errors; provide concise guidance toward Edit where useful.
- On orientation changes, preserve shared-section reveal state and conceal the newly selected keywords/notes. Returning to an orientation conceals its meanings again. Shared artwork/text/correspondences remain the same data.
- Reverse remains usable without a configured reversed meaning. Show a clear empty state without substituting upright keywords or notes.

### Shuffle session

- Shuffle always samples all 78 cards, regardless of search filters or how much study content is configured.
- Maintain a visited-card set for the current tab/library and retain it across refreshes. The initially opened/current card counts as visited; revealing fields or reversing does not create another visit.
- Choose randomly from unvisited cards. When exhausted, start a new pass with the current card already marked visited, avoiding an immediate repeat.
- Successfully opening a search result starts a fresh pass with that selected card marked visited. Changing filters, typing, or canceling search alone does not reset the pass.
- Browser Back/Forward marks the opened card visited without resetting the pass. Save/Cancel is not card navigation and does not reset shuffle history.
- Keep this transient session separate from saved card content; it is not study analytics or persistent filtering.

## Editing and saving

- Create a draft of the full card; reveal all editable content. Edit names, correspondences, imagery text, and meanings in the same content order used for studying.
- Reverse selects which meaning to edit and preserves both orientations' draft values. Shared editable fields stay visible but disabled while reversed; edit them in upright mode. Bundled artwork is a reference asset, not an upload/edit field.
- Reversed content is entirely optional. Adding reversed notes without keywords is valid; neither field becomes required when the other is entered.
- Saving requires at least one nonblank **upright keyword**. Notes and correspondences are optional. Follow the [validation rules](data-model.md#validation-and-empty-cards); an untouched seed record may be read even though its editor cannot yet be saved.
- Show validation when entering edit mode and update it as values change. Disable Save while invalid or saving. Empty reversed content must never disable Save.
- Place concise validation feedback to the left of Save and associate it with the actual field. Activating the message selects the appropriate orientation, scrolls to the field, and focuses it. For a missing upright keyword while viewing reversed edits, switch to upright.
- Save explicitly persists the entire draft, including both meanings, as one operation. On success return to the same card and selected orientation in view mode, with study sections concealed.
- Cancel discards the draft and returns to the saved card. Confirm discarding unsaved changes when canceling or navigating away; preserve the draft if the user stays.
- Storage failures and stale-revision conflicts preserve the draft and offer deliberate recovery. Do not silently overwrite newer data or reset to starter content. Prevent duplicate saves and ignore results from obsolete navigation/requests.

## Illustrations and visual treatment

Use the [illustration prompt](illustration-prompt.md) as the artwork specification. Every catalog card needs its own RWS-based illustration; source image sheets are intermediate assets.

- Integrate genuine editable SVG strokes with consistent viewBox/margins, unfilled shapes where appropriate, and rounded caps/joins.
- Drive the main stroke and slight offset highlight through the existing `--sys-color-etch-ink` and `--sys-color-etch-light` tokens, matching the dial's etched appearance. Keep color, opacity, and stroke width controllable in the interface.
- Apply translucent material effects at rendering time. Preserve legibility over the actual surface and provide solid-stroke contrast/reduced-transparency fallbacks.
- Map assets to stable catalog IDs as described in [illustration assets](data-model.md#illustration-assets). Ship the illustration integration with MVP; missing assets are an outstanding delivery dependency, not a reason to remove artwork from scope.
- Keep footer transformations, filter-row insertion/removal, reveal, and reversal smooth but snappy. Preserve spatial continuity and support reduced motion without depending on animation to communicate state.

## Implementation sequence and acceptance

Follow repository guidance in [AGENTS.md](../../AGENTS.md). Reuse existing design-system contracts; keep tarot rules, content, state, and I/O feature-owned. Use the [data model's placement](data-model.md#repository-placement) to organize implementation.

1. Build the catalog, empty seed library, validation, IndexedDB service, and identity-based asset mapping.
2. Add the isolated routes and shared view/edit composition, with loading, missing-data, storage-error, and empty states.
3. Implement normalized search, progressive controls, reveal/orientation state, and shuffle sessions.
4. Complete draft editing, validation focus, save/conflict recovery, and illustration integration.
5. Verify the product behaviors below and follow the repository's current verification requirements. Use the existing dev server at `http://localhost:5173` in the in-app browser for visual checks of implemented UI.

| Acceptance area | Required evidence |
| --- | --- |
| Catalog and storage | Exactly 78 stable identities/routes; blank first-run content; saved edits survive reload and seed updates; initialization is safe across tabs. |
| Search | All three forms of “two of swords” resolve identically; Major and Minor quick rows work; aliases remain separate results; incomplete/no-match queries and dismissal work. |
| Study | Independent reveals, stable height, hidden answers, upright-on-navigation, optional reversed empty state, and no-repeat shuffle/reset/exhaustion behavior. |
| Editing | Empty seeds open; upright keywords gate Save; reversed fields never become required; drafts survive toggles/failures; error links focus the right orientation/field; conflicts do not overwrite. |
| Mobile and accessibility | Sticky controls remain reachable with keyboard/safe areas; long names/chips/notes fit; keyboard activation/focus, ordinary/reduced motion, and SVG contrast are checked. |
| Integration | Direct links and Back/Forward work; all 78 illustrations map correctly; Tarot Flash does not change the timer's flow. |
