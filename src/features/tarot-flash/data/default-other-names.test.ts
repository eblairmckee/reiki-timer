import { expect, test } from "vitest";
import { catalog } from "./catalog";
import { defaultOtherNames } from "./default-other-names";
import { createSeed } from "./seed";

test("Labyrinthos aliases follow equivalent card identities rather than Thoth numbers", () => {
  expect(
    catalog
      .filter((card) => card.arcana === "major")
      .flatMap((card) => defaultOtherNames(card).map((name) => [card.defaultName, name]))
  ).toEqual([
    ["The Magician", "Magus"],
    ["Strength", "Lust"],
    ["Wheel of Fortune", "Fortune"],
    ["Justice", "Adjustment"],
    ["Temperance", "Art"],
    ["Judgement", "Aeon"],
    ["The World", "Universe"],
  ]);
});

test("court ranks and Disks combine correctly, without aliases identical to RWS titles", () => {
  const aliases = Object.fromEntries(
    catalog.map((card) => [card.defaultName, defaultOtherNames(card)])
  );
  expect(aliases).toMatchObject({
    "Ace of Pentacles": ["Ace of Disks"],
    "King of Pentacles": ["Knight of Disks"],
    "King of Swords": ["Knight of Swords"],
    "Knight of Cups": ["Prince of Cups"],
    "Knight of Pentacles": ["Prince of Disks"],
    "Page of Pentacles": ["Princess of Disks"],
    "Page of Wands": ["Princess of Wands"],
    "Queen of Cups": [],
    "Queen of Pentacles": ["Queen of Disks"],
    "Ten of Pentacles": ["Ten of Disks"],
    "The High Priestess": [],
    "Two of Wands": [],
  });
  expect(Object.values(aliases).filter((names) => names.length)).toHaveLength(30);
  for (const card of catalog) {
    expect(defaultOtherNames(card)).not.toContain(card.defaultName);
  }
});

test("seed aliases are editable library values with no shared arrays or runtime fallback", () => {
  const first = createSeed("a", "owner", "2026-11-14T00:00:00Z");
  const second = createSeed("b", "owner", "2026-11-14T00:00:00Z");
  expect(first.cards[1].content.otherNames).toEqual(["Magus"]);
  first.cards[1].content.otherNames.length = 0;
  expect(second.cards[1].content.otherNames).toEqual(["Magus"]);
  expect(defaultOtherNames(catalog[1])).toEqual(["Magus"]);
});
