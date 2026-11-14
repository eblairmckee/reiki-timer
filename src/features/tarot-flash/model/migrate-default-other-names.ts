import { catalog } from "../data/catalog";
import { defaultOtherNames } from "../data/default-other-names";
import type { LibraryCard } from "./types";

/** Add the newly introduced aliases once; retain personal spelling and ordering. */
export function addDefaultOtherNames(card: LibraryCard): LibraryCard {
  const identity = catalog.find((entry) => entry.id === card.catalogCardId);
  if (!identity) {
    throw new Error("Unknown catalog card");
  }
  const existing = new Set(card.content.otherNames.map((name) => name.trim().toLowerCase()));
  const additions = defaultOtherNames(identity).filter((name) => !existing.has(name.toLowerCase()));
  return additions.length
    ? {
        ...card,
        content: { ...card.content, otherNames: [...card.content.otherNames, ...additions] },
      }
    : card;
}
