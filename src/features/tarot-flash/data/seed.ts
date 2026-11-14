import type { CardContent, LibraryCard, StudyLibrary } from "../model/types";
import { catalog } from "./catalog";
import { correspondenceFields } from "./correspondences";

export const schemaVersion = 2;
export function emptyContent(): CardContent {
  return {
    correspondences: { element: [], planet: [], zodiac: [] },
    meanings: { reversed: null, upright: { keywords: [], notes: "" } },
    otherNames: [],
  };
}

export function createSeed(
  id: string,
  ownerId: string,
  now: string
): { library: StudyLibrary; cards: LibraryCard[] } {
  return {
    cards: catalog.map((card) => ({
      catalogCardId: card.id,
      content: emptyContent(),
      createdAt: now,
      id: `${id}:${card.id}`,
      libraryId: id,
      revision: "seed-1",
      updatedAt: now,
    })),
    library: {
      correspondenceDefinitions: correspondenceFields.map(({ id: fieldId, label }) => ({
        id: fieldId,
        label,
      })),
      createdAt: now,
      id,
      name: "My tarot library",
      owner: { id: ownerId, kind: "local" },
      schemaVersion,
      updatedAt: now,
    },
  };
}
