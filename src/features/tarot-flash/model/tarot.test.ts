import { describe, expect, test } from "vitest";
import { cardAtIndex, catalog, displayNumeral } from "../data/catalog";
import { createSeed, emptyContent } from "../data/seed";
import { createShuffleSession } from "../services/shuffle-session";
import { searchCards } from "./search";
import { nextShuffle, restoreVisits } from "./shuffle";
import {
  hasDraftChanges,
  isContent,
  isLibrary,
  isLibraryCard,
  normalizeContent,
  validateDraft,
} from "./validation";

const seed = createSeed("library", "owner", "2026-11-13T00:00:00.000Z");

test("all 78 identities and routes are stable, with keywords for both orientations", () => {
  expect(catalog).toHaveLength(78);
  expect(new Set(catalog.map((card) => card.id)).size).toBe(78);
  expect(catalog.map((card) => card.deckIndex)).toEqual(
    Array.from({ length: 78 }, (_, index) => index + 1)
  );
  expect(
    [1, 9, 12, 22, 23, 37, 51, 65, 78].map((index) => cardAtIndex(String(index))?.defaultName)
  ).toEqual([
    "The Fool",
    "Strength",
    "Justice",
    "The World",
    "Ace of Wands",
    "Ace of Cups",
    "Ace of Swords",
    "Ace of Pentacles",
    "King of Pentacles",
  ]);
  expect(displayNumeral(catalog[0])).toBe("0");
  expect(displayNumeral(catalog[8])).toBe("VIII");
  for (const card of seed.cards) {
    expect(isLibraryCard(card, seed.library.id)).toBe(true);
    expect(card.content.meanings.upright.keywords.length).toBeGreaterThan(0);
    expect(card.content.meanings.reversed?.keywords.length).toBeGreaterThan(0);
    expect(card.content.meanings.upright.notes).toBe("");
    expect(card.content.meanings.reversed?.notes).toBe("");
    expect(card.content.correspondences.element).toHaveLength(1);
  }
  expect(isLibrary(seed.library)).toBe(true);
});
test("older correspondence records remain readable and an empty Planet does not dirty a draft", () => {
  const legacy = {
    ...emptyContent(),
    correspondences: { element: ["Air"], zodiac: [] },
  };
  expect(isContent(legacy)).toBe(true);
  expect(
    isLibrary({
      ...seed.library,
      correspondenceDefinitions: seed.library.correspondenceDefinitions.filter(
        ({ id }) => id !== "planet"
      ),
    })
  ).toBe(true);
  const draft = normalizeContent(legacy);
  expect(draft.correspondences).toEqual({ element: ["Air"], planet: [], zodiac: [] });
  expect(hasDraftChanges(draft, legacy)).toBe(false);
  draft.correspondences.planet = ["  Mercury  "];
  expect(hasDraftChanges(draft, legacy)).toBe(true);
  expect(normalizeContent(draft).correspondences.planet).toEqual(["Mercury"]);
  expect(
    isContent({ ...legacy, correspondences: { ...legacy.correspondences, planet: "Sun" } })
  ).toBe(false);
});
test.each(["0", "79", "-1", "2.5", "02", "NaN", "II", "1oops"])(
  "rejects invalid route %s",
  (value) => expect(cardAtIndex(value)).toBeUndefined()
);

describe("search", () => {
  test.each(["2 of swords", "II of swords", "two of swords", " two   OF  sword ", "swords 2"])(
    "resolves %s by catalog identity",
    (query) => {
      expect(
        searchCards(query, null, seed.cards).suggestions.map((item) => item.catalogCardId)
      ).toEqual(["swords-02"]);
    }
  );
  test.each(["1", "I", "one", "ace"])("resolves %s under a suit filter", (query) =>
    expect(searchCards(query, "cups", seed.cards).suggestions[0].catalogCardId).toBe("cups-01")
  );
  test.each(["11", "XI", "eleven", "page"])("resolves court rank %s", (query) =>
    expect(searchCards(query, "wands", seed.cards).suggestions[0].catalogCardId).toBe("wands-11")
  );
  test("major numbers refer to the printed number, never the route index", () => {
    expect(
      searchCards("I", "major", seed.cards).suggestions.map((item) => item.catalogCardId)
    ).toEqual(["major-01"]);
    expect(
      searchCards("V", "wands", seed.cards).suggestions.map((item) => item.catalogCardId)
    ).toEqual(["wands-05"]);
    expect(searchCards("0", "major", seed.cards).suggestions[0].deckIndex).toBe(1);
    expect(searchCards("VIII", "major", seed.cards).suggestions[0].catalogCardId).toBe("major-08");
    expect(searchCards("twenty one", "major", seed.cards).suggestions[0].catalogCardId).toBe(
      "major-21"
    );
    expect(searchCards("2", null, seed.cards).suggestions).toHaveLength(5);
  });
  test("aliases remain separate, priority is exact/prefix/partial, renaming keeps suit lookup", () => {
    const renamed = structuredClone(seed.cards);
    const swords = renamed.find((card) => card.catalogCardId === "swords-02");
    if (!swords) {
      throw new Error("Missing fixture");
    }
    swords.content.otherNames = ["Peace", "Peace restored", "A peace offering"];
    expect(searchCards("peace", null, renamed).suggestions.map((item) => item.label)).toEqual([
      "Peace",
      "Peace restored",
      "A peace offering",
    ]);
    expect(searchCards("two of swords", null, renamed).suggestions[0].label).toBe("Two of Swords");
    expect(searchCards("peace", "cups", renamed).status).toBe("none");
    swords.content.otherNames = [];
    expect(searchCards("two of swords", null, renamed).suggestions[0].label).toBe("Two of Swords");
  });
  test("incomplete and empty queries never select arbitrary cards", () => {
    expect(searchCards("   ", null, seed.cards).status).toBe("empty");
    expect(searchCards("swords", null, seed.cards)).toEqual({
      status: "incomplete",
      suggestions: [],
    });
    expect(searchCards("not a card", null, seed.cards).status).toBe("none");
    expect(searchCards("devil", null, seed.cards).suggestions[0].catalogCardId).toBe("major-15");
  });
});

test("save validation allows reversed notes alone; reads accept empty seeds", () => {
  const content = emptyContent();
  expect(isContent(content)).toBe(true);
  expect(validateDraft(content)[0].field).toBe("upright-keywords");
  content.meanings.reversed = { keywords: [], notes: "Only reversed notes" };
  expect(validateDraft(content)).toHaveLength(1);
  content.meanings.upright.keywords = [" ", "  beginning  "];
  expect(validateDraft(content)).toEqual([]);
  expect(normalizeContent(content).meanings.reversed).toEqual({
    keywords: [],
    notes: "Only reversed notes",
  });
  content.meanings.reversed = { keywords: [" "], notes: " " };
  expect(normalizeContent(content).meanings.reversed).toBeNull();
  expect(normalizeContent(content).meanings.upright.keywords).toEqual(["beginning"]);
  expect(hasDraftChanges(structuredClone(content), content)).toBe(false);
});
test("runtime boundaries reject malformed content, identities, and schema without treating emptiness as damage", () => {
  expect(isContent({ ...emptyContent(), otherNames: 4 })).toBe(false);
  expect(isContent({ ...emptyContent(), correspondences: [] })).toBe(false);
  expect(isLibrary({ ...seed.library, schemaVersion: 999 })).toBe(false);
  expect(
    isLibrary({
      ...seed.library,
      correspondenceDefinitions: [
        { id: "element", label: "Element" },
        { id: "element", label: "Duplicate" },
      ],
    })
  ).toBe(false);
  expect(isLibraryCard({ ...seed.cards[0], catalogCardId: "missing" }, "library")).toBe(false);
  expect(isLibraryCard(seed.cards[0], "someone-else")).toBe(false);
});
test("shuffle visits every card exactly once, then starts a pass excluding the current card", () => {
  let [current] = catalog;
  let visited = new Set([current.id]);
  const opened = [current.id];
  for (let count = 1; count < 78; count += 1) {
    const next = nextShuffle(visited, current.id, () => 0.4);
    ({ card: current, visited } = next);
    opened.push(current.id);
  }
  expect(new Set(opened).size).toBe(78);
  const next = nextShuffle(visited, current.id, () => 0);
  expect(next.card.id).not.toBe(current.id);
  expect(next.visited.size).toBe(2);
});
test("tab session survives refresh, search resets it, malformed session data is harmless", () => {
  const entries = new Map<string, string>();
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
  const first = createShuffleSession("library", storage);
  first.visit("major-00");
  first.visit("major-01");
  const restored = createShuffleSession("library", storage);
  restored.visit("major-02");
  expect(JSON.parse([...entries.values()][0])).toEqual(["major-00", "major-01", "major-02"]);
  restored.reset("cups-02");
  expect(JSON.parse([...entries.values()][0])).toEqual(["cups-02"]);
  expect(restoreVisits(["made-up"])).toEqual(new Set());
  expect(restoreVisits({ anything: true })).toEqual(new Set());
});
