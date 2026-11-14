import { catalog } from "../data/catalog";
import { defaultCorrespondences } from "../data/default-correspondences";
import type { CardMeaning, LibraryCard } from "./types";

function hasMeaning(meaning: CardMeaning) {
  return meaning.keywords.some((keyword) => keyword.trim()) || meaning.notes.trim().length > 0;
}

/** Schema 3 fills only completely blank study records. Existing schemas have no
 * per-field edit history, so even blank fields on a personalized card are preserved. */
export function addDefaultCorrespondences(card: LibraryCard): LibraryCard {
  const { content } = card;
  if (
    content.otherNames.some((name) => name.trim()) ||
    Object.values(content.correspondences).some((values) => values.some((value) => value.trim())) ||
    hasMeaning(content.meanings.upright) ||
    (content.meanings.reversed !== null && hasMeaning(content.meanings.reversed))
  ) {
    return card;
  }
  const identity = catalog.find((entry) => entry.id === card.catalogCardId);
  if (!identity) {
    throw new Error(`Unknown card ${card.catalogCardId}`);
  }
  return {
    ...card,
    content: {
      ...content,
      correspondences: { ...content.correspondences, ...defaultCorrespondences(identity) },
    },
  };
}
