import { catalog } from "../data/catalog";
import { defaultMeanings } from "../data/default-keywords";
import type { LibraryCard } from "./types";

/** Schema 5 intentionally replaces the MVP's test keywords and notes once.
 * Later user edits are never passed through this migration again. */
export function replaceDefaultMeanings(card: LibraryCard): LibraryCard {
  const identity = catalog.find((entry) => entry.id === card.catalogCardId);
  if (!identity) {
    throw new Error("Unknown catalog card");
  }
  return { ...card, content: { ...card.content, meanings: defaultMeanings(identity) } };
}
