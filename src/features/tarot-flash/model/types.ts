export type Orientation = "upright" | "reversed";
export type Suit = "wands" | "cups" | "swords" | "pentacles";
export type Category = Suit | "major";

export type CatalogCard = {
  id: string;
  deckIndex: number;
  defaultName: string;
} & ({ arcana: "major"; number: number } | { arcana: "minor"; suit: Suit; rank: number });

export interface StudyLibrary {
  correspondenceDefinitions: { id: string; label: string }[];
  createdAt: string;
  id: string;
  name: string;
  owner: { kind: "local"; id: string };
  schemaVersion: number;
  updatedAt: string;
}

export interface CardMeaning {
  keywords: string[];
  notes: string;
}

export interface CardContent {
  correspondences: Record<string, string[]>;
  meanings: { upright: CardMeaning; reversed: CardMeaning | null };
  /** Personal aliases; the catalog owns the fixed card title. */
  otherNames: string[];
}

export interface LibraryCard {
  catalogCardId: string;
  content: CardContent;
  createdAt: string;
  id: string;
  libraryId: string;
  revision: string;
  updatedAt: string;
}

export interface FieldError {
  field: "upright-keywords";
  message: string;
  orientation: "upright";
}

export type SaveResult =
  | { kind: "saved"; card: LibraryCard }
  | { kind: "validation"; errors: FieldError[] }
  | { kind: "conflict"; current: LibraryCard }
  | { kind: "missing" }
  | { kind: "storage"; message: string };

/** Ownership is resolved internally; UI callers cannot choose a library or owner. */
export interface TarotService {
  close: () => void;
  getCard: (catalogCardId: string) => Promise<LibraryCard | null>;
  getLibrary: () => Promise<StudyLibrary>;
  initializeLibrary: () => Promise<StudyLibrary>;
  listCards: () => Promise<LibraryCard[]>;
  saveCard: (cardId: string, content: CardContent, expectedRevision: string) => Promise<SaveResult>;
}
