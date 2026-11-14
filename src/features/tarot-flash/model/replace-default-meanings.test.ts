import { expect, test } from "vitest";
import { catalog } from "../data/catalog";
import { defaultMeanings } from "../data/default-keywords";
import { createSeed, emptyContent } from "../data/seed";
import { replaceDefaultMeanings } from "./replace-default-meanings";

test("the requested one-time replacement overwrites test keywords and notes for both orientations", () => {
  const [original] = createSeed("library", "owner", "2026-11-14T00:00:00Z").cards;
  original.content.meanings = {
    reversed: { keywords: ["test reversed"], notes: "test reversed notes" },
    upright: { keywords: ["test upright"], notes: "test notes" },
  };
  original.content.otherNames = ["My alias"];
  original.content.correspondences = { element: [], planet: [], zodiac: ["Custom association"] };
  const snapshot = structuredClone(original);
  const replaced = replaceDefaultMeanings(original);
  expect(replaced.content.meanings).toEqual(defaultMeanings(catalog[0]));
  expect({
    ...replaced,
    content: { ...replaced.content, meanings: snapshot.content.meanings },
  }).toEqual(snapshot);
  expect(original).toEqual(snapshot);
});

test("blank and null meanings receive independent upright and reversed lists", () => {
  const { cards } = createSeed("library", "owner", "2026-11-14T00:00:00Z");
  for (const [index, card] of cards.entries()) {
    card.content.meanings = emptyContent().meanings;
    expect(replaceDefaultMeanings(card).content.meanings).toEqual(defaultMeanings(catalog[index]));
  }
});
