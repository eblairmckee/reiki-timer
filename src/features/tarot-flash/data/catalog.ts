import type { CatalogCard, Category, Suit } from "../model/types";

const majorNames = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];
export const suits: readonly Suit[] = ["wands", "cups", "swords", "pentacles"];
export const rankNames = [
  "Ace",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Page",
  "Knight",
  "Queen",
  "King",
];
export const numerals = [
  "0",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
];

/** Frozen route order. New display names must never reorder this catalog. */
export const catalog: readonly CatalogCard[] = [
  ...majorNames.map(
    (defaultName, number): CatalogCard => ({
      arcana: "major",
      deckIndex: number + 1,
      defaultName,
      id: `major-${String(number).padStart(2, "0")}`,
      number,
    })
  ),
  ...suits.flatMap((suit, suitIndex) =>
    rankNames.map(
      (name, index): CatalogCard => ({
        arcana: "minor",
        deckIndex: 23 + suitIndex * 14 + index,
        defaultName: `${name} of ${suit[0].toUpperCase()}${suit.slice(1)}`,
        id: `${suit}-${String(index + 1).padStart(2, "0")}`,
        rank: index + 1,
        suit,
      })
    )
  ),
];

const routeIndex = /^[1-9]\d?$/u;
export function cardAtIndex(value: string) {
  if (!routeIndex.test(value)) {
    return;
  }
  return catalog.find((card) => card.deckIndex === Number(value));
}

export function inCategory(card: CatalogCard, category: Category | null) {
  return (
    !category ||
    (category === "major"
      ? card.arcana === "major"
      : card.arcana === "minor" && card.suit === category)
  );
}

export function displayNumeral(card: CatalogCard) {
  return numerals[card.arcana === "major" ? card.number : card.rank];
}
