import { catalog } from "../data/catalog";
import { correspondenceFields } from "../data/correspondences";
import { schemaVersion } from "../data/seed";
import type { CardContent, CardMeaning, FieldError, LibraryCard, StudyLibrary } from "./types";

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function identifier(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function timestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function isMeaning(value: unknown): value is CardMeaning {
  return isObject(value) && strings(value.keywords) && typeof value.notes === "string";
}
export function isContent(value: unknown): value is CardContent {
  return (
    isObject(value) &&
    strings(value.otherNames) &&
    isObject(value.correspondences) &&
    strings(value.correspondences.element) &&
    strings(value.correspondences.zodiac) &&
    Object.values(value.correspondences).every(strings) &&
    isObject(value.meanings) &&
    isMeaning(value.meanings.upright) &&
    (value.meanings.reversed === null || isMeaning(value.meanings.reversed))
  );
}
export function isLibrary(value: unknown): value is StudyLibrary {
  const definitions = isObject(value) ? value.correspondenceDefinitions : undefined;
  return (
    isObject(value) &&
    identifier(value.id) &&
    isObject(value.owner) &&
    value.owner.kind === "local" &&
    identifier(value.owner.id) &&
    typeof value.name === "string" &&
    value.schemaVersion === schemaVersion &&
    timestamp(value.createdAt) &&
    timestamp(value.updatedAt) &&
    Array.isArray(definitions) &&
    (definitions.length === 2 || definitions.length === 3) &&
    definitions.every((item) => isObject(item) && identifier(item.id) && identifier(item.label)) &&
    new Set(definitions.map((item) => item.id)).size === definitions.length &&
    definitions.every((item) => correspondenceFields.some((field) => field.id === item.id)) &&
    ["element", "zodiac"].every((id) =>
      definitions.some((item: unknown) => isObject(item) && item.id === id)
    )
  );
}
export function isLibraryCard(value: unknown, libraryId: string): value is LibraryCard {
  return (
    isObject(value) &&
    identifier(value.id) &&
    value.libraryId === libraryId &&
    catalog.some((card) => card.id === value.catalogCardId) &&
    identifier(value.revision) &&
    timestamp(value.createdAt) &&
    timestamp(value.updatedAt) &&
    isContent(value.content)
  );
}
export function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}
export function normalizeContent(content: CardContent): CardContent {
  const { reversed } = content.meanings;
  const cleaned = reversed && {
    keywords: cleanList(reversed.keywords),
    notes: reversed.notes.trim(),
  };
  return {
    correspondences: Object.fromEntries(
      Object.entries({ planet: [], ...content.correspondences }).map(([id, values]) => [
        id,
        cleanList(values),
      ])
    ),
    meanings: {
      reversed: cleaned && (cleaned.keywords.length > 0 || cleaned.notes) ? cleaned : null,
      upright: {
        keywords: cleanList(content.meanings.upright.keywords),
        notes: content.meanings.upright.notes.trim(),
      },
    },
    otherNames: cleanList(content.otherNames),
  };
}
export function validateDraft(content: CardContent): FieldError[] {
  return cleanList(content.meanings.upright.keywords).length
    ? []
    : [
        {
          field: "upright-keywords",
          message: "Add an upright keyword to save.",
          orientation: "upright",
        },
      ];
}

export function hasDraftChanges(draft: CardContent | null, saved: CardContent) {
  return (
    draft !== null &&
    JSON.stringify(normalizeContent(draft)) !== JSON.stringify(normalizeContent(saved))
  );
}
