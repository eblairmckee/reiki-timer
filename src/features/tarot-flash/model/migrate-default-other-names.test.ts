import { expect, test } from "vitest";
import { createSeed, emptyContent } from "../data/seed";
import { addDefaultOtherNames } from "./migrate-default-other-names";

test("existing cards gain a Thoth alias without replacing any personal content", () => {
  const original = {
    ...createSeed("library", "owner", "2026-11-14T00:00:00Z").cards[1],
    content: emptyContent(),
  };
  original.content.otherNames = ["My magician"];
  original.content.meanings.upright = { keywords: ["Personal"], notes: "My notes" };
  const updated = addDefaultOtherNames(original);
  expect(updated.content.otherNames).toEqual(["My magician", "Magus"]);
  expect(original.content.otherNames).toEqual(["My magician"]);
  expect({ ...updated, content: original.content }).toEqual(original);
  expect(updated.content.meanings).toBe(original.content.meanings);
  expect(updated.content.correspondences).toBe(original.content.correspondences);
  expect(addDefaultOtherNames(updated)).toBe(updated);
});

test("matching aliases preserve the user's spelling and cards without aliases are unchanged", () => {
  const seed = createSeed("library", "owner", "2026-11-14T00:00:00Z");
  seed.cards[1].content.otherNames = [" MAGUS "];
  expect(addDefaultOtherNames(seed.cards[1])).toBe(seed.cards[1]);
  expect(addDefaultOtherNames(seed.cards[0])).toBe(seed.cards[0]);
});
