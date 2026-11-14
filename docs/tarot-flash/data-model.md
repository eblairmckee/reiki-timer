# Tarot Flash data model

The [implementation plan](product-brief.md) uses one local, user-owned library containing all 78 Rider–Waite–Smith (RWS) cards. Keep ownership and persistence behind a service so accounts can be added later without coupling the card UI to storage.

## MVP storage and scope

Use **repository seed data plus IndexedDB**. The deployed app reads and explicitly saves edits in the current browser; editing does not modify repository files.

- Data is scoped to the site's origin and browser profile. Localhost, deployment previews, and production have separate stores; there is no cross-device synchronization.
- Browser storage can be cleared or evicted. Import/export, backup controls, authentication, and a remote backend are outside MVP.
- Keep storage versioned. Initialize atomically and idempotently across tabs, creating starter records only on genuine first use.
- Distinguish absent, damaged, unsupported, and unreadable data. Failed reads or newer deployments must never reset personal content to seed data.

## Entities and ownership

| Entity | Responsibility |
| --- | --- |
| Card catalog | Immutable card identity, RWS default name, arcana/suit/rank, and fixed route order. No seeded meanings or correspondences. |
| Study library | Local ownership, schema version, and correspondence definitions. One active library in MVP. |
| Library card | Editable alternative names and study content for one catalog card within one library, plus revision and timestamps. |
| Illustration manifest | Bundled SVG asset/renderer and descriptive alternative text, keyed by catalog ID. Separate from user edits. |

Enforce one library card per `(libraryId, catalogCardId)`; initialization creates exactly 78. Custom cards/decks are outside MVP, so `catalogCardId` is required.

Ownership belongs to the library. A local owner ID is not authentication; components cannot select arbitrary owners or libraries.

## Catalog and route identity

Use a stable catalog ID (for example, `major-00` or `swords-02`) independently of alternative names, display numerals, and library-card IDs.

Freeze this order for `/tarot-flash/{deckIndex}`:

| Deck index | Catalog order | Display/search numbers |
| --- | --- | --- |
| 1–22 | Majors: The Fool through The World, in RWS order | 0–21; Strength is VIII and Justice is XI. |
| 23–36 | Wands: Ace through King | 1–14 |
| 37–50 | Cups: Ace through King | 1–14 |
| 51–64 | Swords: Ace through King | 1–14 |
| 65–78 | Pentacles: Ace through King | 1–14 |

Within each suit, 1 is Ace; 11–14 are Page, Knight, Queen, King. Use Roman numerals for the title's catalog number/rank, with `0` for The Fool. Court quick-selection controls use icons; their numeric search equivalents remain 11–14. A URL index is never interpreted as the card's printed number in search.

The catalog’s RWS name is the fixed title; title editing is outside MVP. Users may add alternative names without changing any identity, numeral, route, or asset association. Other names start empty.

## Contracts

These are domain contracts; validate persisted runtime values rather than relying on TypeScript alone.

```ts
type Orientation = "upright" | "reversed";
type Suit = "wands" | "cups" | "swords" | "pentacles";

type CatalogCard = {
  id: string;
  deckIndex: number; // Unique integer 1–78; fixed across releases.
  defaultName: string;
} & (
  | { arcana: "major"; number: number } // Integer 0–21.
  | { arcana: "minor"; suit: Suit; rank: number } // Integer 1–14.
);

interface CorrespondenceDefinition {
  id: string;
  label: string;
}

interface StudyLibrary {
  id: string;
  owner: { kind: "local"; id: string };
  name: string;
  schemaVersion: number;
  correspondenceDefinitions: CorrespondenceDefinition[];
  createdAt: string;
  updatedAt: string;
}

interface CardMeaning {
  keywords: string[];
  notes: string;
}

interface CardContent {
  otherNames: string[]; // Ordered personal aliases, shown as a subtitle and included in search.
  correspondences: Record<string, string[]>;
  meanings: {
    upright: CardMeaning;
    reversed: CardMeaning | null;
  };
}

interface LibraryCard {
  id: string;
  libraryId: string;
  catalogCardId: string;
  content: CardContent;
  revision: string; // Opaque concurrency token, not a timestamp comparison.
  createdAt: string;
  updatedAt: string;
}
```

Correspondence definitions use stable IDs `element`, `zodiac`, and `planet`, each storing text arrays and multiple values. The editor offers fixed choice lists while preserving previously saved values. MVP edits these values only; new field definitions have no UI.

Other names and correspondences are shared across orientations. Upright and reversed meanings are independent; reversed content never silently falls back to upright content.

### Seed content

For every catalog card, initialize:

- `otherNames`: an empty array; the title comes from `CatalogCard.defaultName`.
- `correspondences`: empty element/zodiac/planet arrays.
- `meanings.upright`: empty keywords and notes.
- `meanings.reversed`: `null`.
- Stable library/card IDs, an initial revision, and valid timestamps.

Artwork ships separately and does not populate editable study fields. Do not insert card names as placeholder keywords or seed researched meanings.

## Validation and empty cards

Separate **stored-record validity** from **editor save validity**:

| Boundary | Rule |
| --- | --- |
| Seed/read/migration | Empty study content is structurally valid and may be viewed. Validate types, identifiers, relationships, catalog ranges, schema version, revisions, and timestamps. |
| Editor save | Require at least one nonblank upright keyword. Other names, notes, correspondences, and all reversed content are optional. |
| Reversed meaning | `null` means unconfigured. Either reversed keywords or notes may be entered independently; no reversed keyword requirement is introduced. Normalize both-empty content to `null` on save. |
| Other names and list values | Trim list entries and ignore blanks. Free-entry controls commit on comma and split comma-separated paste, ignoring duplicates. The catalog title is always displayed/searchable independently of aliases. |

The save rule applies to the whole draft, even when only a shared field or reversed meaning was edited. A blank starter card therefore opens normally, but entering its editor immediately shows the missing-upright-keyword error and disables Save.

Return field-addressable errors for orientation selection and focus. Validate runtime data as `unknown`; preserve valid empty values and report malformed records separately.

## Data-to-UI service

Resolve the active local library at the feature boundary. All operations are asynchronous and scoped to that library; components do not call IndexedDB directly.

| Operation | Contract |
| --- | --- |
| `initializeLibrary()` | Idempotently open/migrate the existing library or create the empty seed library on genuine first use. Return explicit initialization/storage/schema failures. |
| `getLibrary()` | Return library metadata and correspondence definitions. |
| `listCards()` | Return the active library's saved card records, including cards with empty meanings. |
| `getCard(catalogCardId)` | Return the active library's record for a catalog identity, or an explicit missing result. |
| `saveCard(cardId, content, expectedRevision)` | Validate and save the whole content draft. Return the saved record or field validation, stale-revision conflict, missing-record, or storage failure. |

Routes resolve `deckIndex` through the catalog, then read the corresponding library card by `catalogCardId`. Screens combine catalog identity, saved content, and illustration metadata; they do not persist a duplicate UI projection.

### Persistence and drafts

- Drafts contain all shared content and both meanings. Present `null` reversed content as empty editor fields without mutating storage.
- Correspondence arrays remain storage-compatible. New Element selections come from Fire/Water/Air/Earth; Zodiac selections come from the twelve signs; Planet selections come from Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto. Older free-text values remain visible and removable, without being silently discarded on save. Keywords remain user-authored strings; the combobox derives suggestions from saved library meanings and supports new values without seeding interpretations.
- Schema 2 replaces `names` with `otherNames` and removes `imagery`. Initialization migrates schema 1 in one transaction, removes the catalog title from aliases, preserves personal aliases/meanings/correspondences and all identities, and rotates revisions to reject stale saves. Invalid records abort the migration without partial writes; initialization never reseeds existing data.
- Records without `planet` treat it as empty. Initialization adds missing Planet metadata. Saving includes its Planet array; missing and empty Planet values are equivalent for draft-change detection.
- Explicit Save checks `expectedRevision` and writes the whole draft in one transaction, returning the new revision/timestamps. UI-only revision checks are insufficient.
- Validation/storage failures and conflicts preserve the draft and saved content. Recovery must not silently overwrite newer data; Cancel restores the saved snapshot. There is no autosave.
- Scope pending/error state and async results to their owning card/operation; obsolete completions must not update another screen.
- Schema migrations preserve card IDs and user edits. New seed versions are not migrations and never reset existing content.

## Search contract

Derive search from catalog titles and saved Other names, without a persisted search index or unsaved drafts. See [search behavior](product-brief.md#search-typing-and-buttons-together) for controls and presentation.

- Match names case-insensitively with normalized whitespace. Support name prefixes/partial matches for autocomplete.
- Normalize complete number tokens: Arabic, Roman, and spelled-out forms. `2 of swords`, `II of swords`, and `two of swords` identify the same catalog card. Recognize Ace/one and Page/Knight/Queen/King as ranks 1 and 11–14 respectively.
- Recognize singular/plural suits. Use category/suit context to resolve ranks; otherwise return candidates across the catalog. Suit-only queries remain incomplete. Roman-letter substrings inside names are not number tokens.
- Filters constrain matching; quick-selection buttons directly resolve identities. Preserve catalog-title and suit/rank lookup when aliases change.
- Return name-level suggestions with a stable card ID and matched label. Different matching names for one card remain separate suggestions; do not deduplicate by card ID.
- Prefer exact matches, then prefixes, then other partial matches; break ties by catalog order and saved name order. The first result supplies the initial inline completion.
- Label numeric/rank matches with the fixed catalog title.

## Study and session state

Keep study state separate from persisted interpretations:

| State | Ownership and lifetime |
| --- | --- |
| Current card | Route/catalog identity. Direct navigation and Back/Forward resolve saved content. |
| Orientation | Current card view/editor; upright on each card navigation, retained while toggling view/edit on that card. |
| Revealed fields | Current card view. Reset on card navigation or return from editing; keep shared reveals on reversal, reset orientation-specific reveals on every reversal. |
| Search query/filter | Open search interaction; no persistent filter preferences or restriction of Shuffle. |
| Visited cards | Current tab/library, retained across refreshes; separate from IndexedDB card records. |
| Editor draft | Current edit interaction; retained across orientation toggles and failed saves, discarded only through explicit save/cancel/navigation policy. |

Store visited catalog IDs in validated, library-scoped tab-session storage. Apply the [shuffle/reset rules](product-brief.md#shuffle-session). Failure to restore transient session data may start a fresh pass without changing saved interpretations.

Reveal targets identify card and field, plus orientation for keywords/notes. The illustration is visible only in view mode; element, zodiac, and planet are independent targets. Exclude empty fields. There is no score, assessment history, or spaced-repetition model.

## Illustration assets

Follow the separate [illustration prompt](illustration-prompt.md). Keep the 78 bundled illustrations and their manifest outside IndexedDB and editable `CardContent`.

- Map stable `catalogCardId` to an SVG asset/renderer and descriptive alternative text. Generated reference sheets and their ID-to-cell mapping live in [artwork/](artwork/README.md), separate from the runtime SVG manifest.
- Use one asset per card, shared across orientations, with real vector strokes accepting application color/opacity/stroke tokens.
- Distinguish asset loading/failure from study concealment; the illustration and its descriptive alternative are visible by default in view mode and absent from the editor.

## Repository placement

| Path | Responsibility |
| --- | --- |
| `src/routes/` | Thin Tarot Flash route adapters outside the timer layout. |
| `src/features/tarot-flash/model/` | Contracts, validation, search normalization, shuffle rules, and schema migrations. |
| `src/features/tarot-flash/data/` | Fixed catalog, versioned empty seed library, and illustration manifest. |
| `src/features/tarot-flash/services/` | IndexedDB initialization/reads/writes, migration I/O, and tab-session storage. |
| `src/features/tarot-flash/state/`, `hooks/` | Feature state and React lifetimes where needed. |
| `src/features/tarot-flash/screens/`, `components/` | Route composition and tarot-specific UI. Reuse shared design-system public contracts. |

Place finished SVG assets in `src/features/tarot-flash/assets/illustrations/`, named by catalog ID. Keep generated raster references in [docs/tarot-flash/artwork/](artwork/README.md). Keep model code independent of React, components, and browser I/O. Create directories only as populated concerns need them.

## Adding accounts later

1. Extend library ownership to an authenticated user and transfer the existing local library through an explicit migration flow.
2. Preserve library-card/catalog identities and personal content.
3. Replace the local persistence implementation with a remote implementation behind the same UI-facing service responsibilities.
4. Resolve ownership from the authenticated session and enforce it on the server; a client-supplied owner ID is never authorization.

Account migration and synchronization require future implementation. They do not require MVP auth, backup/import UI, or multiple-library management.

## Storage references

- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
