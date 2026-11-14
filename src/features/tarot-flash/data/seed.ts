import type { CardContent, LibraryCard, StudyLibrary } from "../model/types";
import { catalog } from "./catalog";
import { correspondenceFields } from "./correspondences";
import { defaultCorrespondences } from "./default-correspondences";
import { defaultMeanings } from "./default-keywords";
import { defaultOtherNames } from "./default-other-names";

export const schemaVersion = 5;
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
      content: {
        ...emptyContent(),
        correspondences: defaultCorrespondences(card),
        meanings: defaultMeanings(card),
        otherNames: defaultOtherNames(card),
      },
      createdAt: now,
      id: `${id}:${card.id}`,
      libraryId: id,
      revision: "seed-4",
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
