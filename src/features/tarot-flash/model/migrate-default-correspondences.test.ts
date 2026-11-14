import { expect, test } from "vitest";
import { createSeed, emptyContent } from "../data/seed";
import { addDefaultCorrespondences } from "./migrate-default-correspondences";
import type { CardContent, LibraryCard } from "./types";

function blankCard(content = emptyContent()): LibraryCard {
  return {
    ...createSeed("library", "owner", "2026-11-14T00:00:00Z").cards[0],
    content,
    revision: "seed-1",
  };
}

test("blank records gain defaults without mutating their identities, meanings, or source", () => {
  const original = blankCard();
  const updated = addDefaultCorrespondences(original);
  expect(updated.content.correspondences).toEqual({
    element: ["Air"],
    planet: ["Uranus"],
    zodiac: [],
  });
  expect(original.content).toEqual(emptyContent());
  expect({ ...updated, content: original.content }).toEqual(original);
  expect(updated.content.meanings).toBe(original.content.meanings);
  expect(addDefaultCorrespondences(updated)).toBe(updated);
});

test.each([
  (content: CardContent) => {
    content.otherNames = ["Traveler"];
  },
  (content: CardContent) => {
    content.correspondences.element = ["Water"];
  },
  (content: CardContent) => {
    content.correspondences.custom = ["Personal association"];
  },
  (content: CardContent) => {
    content.meanings.upright.keywords = ["Beginnings"];
  },
  (content: CardContent) => {
    content.meanings.upright.notes = "My notes";
  },
  (content: CardContent) => {
    content.meanings.reversed = { keywords: [], notes: "My reversal" };
  },
])(
  "personal content preserves the whole card, including deliberately blank correspondences (%#)",
  (personalize) => {
    const content = emptyContent();
    personalize(content);
    const original = blankCard(content);
    expect(addDefaultCorrespondences(original)).toBe(original);
  }
);
