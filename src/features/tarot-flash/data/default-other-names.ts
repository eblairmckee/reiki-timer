import type { CatalogCard } from "../model/types";
import { rankNames } from "./catalog";

// Labyrinthos: Tarot Deck Types — Rider Waite Smith vs. Marseille vs. Thoth.
// https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/tarot-deck-types-rider-waite-smith-vs-marseille-vs-thoth
// Match equivalent cards by identity, not Thoth numbering (Strength/Justice swap).
const majorNames: Readonly<Record<string, string>> = {
  "major-01": "Magus",
  "major-08": "Lust",
  "major-10": "Fortune",
  "major-11": "Adjustment",
  "major-14": "Art",
  "major-20": "Aeon",
  "major-21": "Universe",
};
const courtNames: Readonly<Record<number, string>> = {
  11: "Princess",
  12: "Prince",
  14: "Knight",
};

/** Only distinct names from the source's equivalence tables; never replace RWS titles. */
export function defaultOtherNames(card: CatalogCard): string[] {
  if (card.arcana === "major") {
    const name = majorNames[card.id];
    return name ? [name] : [];
  }
  const rank = courtNames[card.rank] ?? rankNames[card.rank - 1];
  const suit =
    card.suit === "pentacles" ? "Disks" : `${card.suit[0].toUpperCase()}${card.suit.slice(1)}`;
  const name = `${rank} of ${suit}`;
  return name === card.defaultName ? [] : [name];
}
