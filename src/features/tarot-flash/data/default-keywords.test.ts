import { expect, test } from "vitest";
import { catalog } from "./catalog";
import { defaultMeanings, keywordDefaults } from "./default-keywords";
import { createSeed } from "./seed";

test("all 78 cards have sourced upright and reversed keyword lists without blank or duplicate tags", () => {
  expect(Object.keys(keywordDefaults).sort()).toEqual(catalog.map((card) => card.id).sort());
  const sources = new Set<string>();
  for (const card of catalog) {
    const defaults = keywordDefaults[card.id];
    const source = new URL(defaults.source);
    expect(source.hostname).toBe("labyrinthos.co");
    expect(source.pathname.startsWith("/blogs/tarot-card-meanings-list/")).toBe(true);
    sources.add(defaults.source);
    for (const keywords of [defaults.upright, defaults.reversed]) {
      expect(keywords.length).toBeGreaterThanOrEqual(2);
      expect(new Set(keywords.map((keyword) => keyword.toLowerCase())).size).toBe(keywords.length);
      expect(keywords.every((keyword) => keyword.trim() === keyword && keyword.length > 0)).toBe(
        true
      );
    }
  }
  expect(sources.size).toBe(78);
});

test("meanings remain attached to RWS identities, including swapped Thoth trumps and courts", () => {
  expect(keywordDefaults["major-08"].source).toContain("/strength-meaning-");
  expect(keywordDefaults["major-11"].source).toContain("/justice-meaning-");
  expect(keywordDefaults["wands-12"].source).toContain("/knight-of-wands-");
  expect(keywordDefaults["wands-14"].source).toContain("/king-of-wands-");
  expect(keywordDefaults["swords-12"].source).toContain("/knight-of-swords-");
  expect(keywordDefaults["swords-13"].source).toContain("/queen-of-swords-");
});

test("libraries own separate editable keyword arrays for both orientations, with blank notes", () => {
  const first = createSeed("first", "owner", "2026-11-14T00:00:00Z");
  const second = createSeed("second", "owner", "2026-11-14T00:00:00Z");
  for (const [index, card] of first.cards.entries()) {
    const { meanings } = card.content;
    expect(meanings).toEqual(defaultMeanings(catalog[index]));
    expect(meanings.upright.notes).toBe("");
    expect(meanings.reversed?.notes).toBe("");
    meanings.upright.keywords.length = 0;
    meanings.reversed?.keywords.push("personal reversal");
    expect(second.cards[index].content.meanings).toEqual(defaultMeanings(catalog[index]));
    expect(second.cards[index].content.meanings.reversed?.keywords).not.toContain(
      "personal reversal"
    );
  }
});
