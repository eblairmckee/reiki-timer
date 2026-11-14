import { catalog, inCategory, numerals } from "../data/catalog";
import type { CatalogCard, Category, LibraryCard } from "./types";

export interface Suggestion {
  catalogCardId: string;
  deckIndex: number;
  id: string;
  label: string;
}
export interface SearchResult {
  status: "empty" | "incomplete" | "matches" | "none";
  suggestions: Suggestion[];
}
const whitespace = /\s+/gu;
const numberWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
  "twenty-one",
];
const suitWords = new Map<string, Category>([
  ["wand", "wands"],
  ["wands", "wands"],
  ["cup", "cups"],
  ["cups", "cups"],
  ["sword", "swords"],
  ["swords", "swords"],
  ["pentacle", "pentacles"],
  ["pentacles", "pentacles"],
  ["major", "major"],
  ["majors", "major"],
  ["major arcana", "major"],
]);
const numbers = new Map<string, number>([
  ...numberWords.map((name, index): [string, number] => [name, index]),
  ...numerals.map((name, index): [string, number] => [name.toLowerCase(), index]),
  ["ace", 1],
  ["page", 11],
  ["knight", 12],
  ["queen", 13],
  ["king", 14],
  ["twenty one", 21],
]);
export function normalizeQuery(value: string) {
  return value.trim().toLowerCase().replace(whitespace, " ");
}
const arabicNumber = /^\d{1,2}$/u;
function parseNumber(value: string) {
  if (arabicNumber.test(value)) {
    return Number(value);
  }
  return numbers.get(value);
}
function rankedQuery(query: string) {
  if (suitWords.has(query)) {
    return { category: suitWords.get(query), rank: undefined };
  }
  const parts = query.split(" ").filter((part) => part !== "of");
  const suit = parts.find((part) => suitWords.has(part));
  return {
    category: suit ? suitWords.get(suit) : undefined,
    rank: parseNumber(parts.filter((part) => part !== suit && part !== "arcana").join(" ")),
  };
}
function nameScore(name: string, query: string) {
  if (name === query) {
    return 0;
  }
  if (name.startsWith(query)) {
    return 1;
  }
  if (name.includes(query)) {
    return 2;
  }
  return 3;
}
function savedNames(card: CatalogCard, records: ReadonlyMap<string, LibraryCard>) {
  const names =
    records
      .get(card.id)
      ?.content.otherNames.map((name) => name.trim())
      .filter(Boolean) ?? [];
  return [...new Set([card.defaultName, ...names])];
}
function rankSuggestions(
  rank: number,
  category: Category | null,
  filter: Category | null,
  records: ReadonlyMap<string, LibraryCard>
): Suggestion[] {
  return catalog
    .filter(
      (card) =>
        inCategory(card, filter) &&
        inCategory(card, category) &&
        (card.arcana === "major" ? card.number : card.rank) === rank
    )
    .map((card) => ({
      catalogCardId: card.id,
      deckIndex: card.deckIndex,
      id: `${card.id}:0`,
      label: savedNames(card, records)[0],
    }));
}
export function searchCards(
  query: string,
  filter: Category | null,
  records: readonly LibraryCard[]
): SearchResult {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return { status: "empty", suggestions: [] };
  }
  const parsed = rankedQuery(normalized);
  if (suitWords.has(normalized)) {
    return { status: "incomplete", suggestions: [] };
  }
  const byId = new Map(records.map((card) => [card.catalogCardId, card]));
  if (parsed.rank !== undefined) {
    const suggestions = rankSuggestions(parsed.rank, parsed.category ?? null, filter, byId);
    return { status: suggestions.length ? "matches" : "none", suggestions };
  }
  const matches: (Suggestion & { score: number; nameIndex: number })[] = [];
  for (const card of catalog.filter((item) => inCategory(item, filter))) {
    const names = savedNames(card, byId);
    for (const [nameIndex, label] of names.entries()) {
      const name = normalizeQuery(label);
      const score = nameScore(name, normalized);
      if (score < 3) {
        matches.push({
          catalogCardId: card.id,
          deckIndex: card.deckIndex,
          id: `${card.id}:${nameIndex}`,
          label,
          nameIndex,
          score,
        });
      }
    }
  }
  matches.sort(
    (a, b) => a.score - b.score || a.deckIndex - b.deckIndex || a.nameIndex - b.nameIndex
  );
  return { status: matches.length ? "matches" : "none", suggestions: matches };
}
