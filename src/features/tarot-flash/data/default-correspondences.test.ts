import { expect, test } from "vitest";
import { catalog } from "./catalog";
import { elements, planets, zodiacSigns } from "./correspondences";
import { defaultCorrespondences } from "./default-correspondences";
import { createSeed } from "./seed";

function defaults(id: string) {
  const card = catalog.find((entry) => entry.id === id);
  if (!card) {
    throw new Error(`Unknown test card ${id}`);
  }
  return defaultCorrespondences(card);
}

test("all 78 cards have editable catalog-supported defaults and all 36 decans are distinct", () => {
  const decans = new Set<string>();
  for (const card of catalog) {
    const values = defaultCorrespondences(card);
    expect(values.element).toHaveLength(1);
    expect(elements).toContain(values.element[0]);
    for (const planet of values.planet) {
      expect(planets).toContain(planet);
    }
    for (const zodiac of values.zodiac) {
      expect(zodiacSigns).toContain(zodiac);
    }
    if (card.arcana === "major") {
      expect(values.planet.length + values.zodiac.length).toBe(1);
    } else if (card.rank >= 2 && card.rank <= 10) {
      expect(values.planet).toHaveLength(1);
      expect(values.zodiac).toHaveLength(1);
      decans.add(`${values.planet[0]} in ${values.zodiac[0]}`);
    }
  }
  expect(decans.size).toBe(36);
});

test.each([
  ["major-00", "Air", "Uranus", null],
  ["major-03", "Earth", "Venus", null],
  ["major-08", "Fire", null, "Leo"],
  ["major-09", "Earth", null, "Virgo"],
  ["major-11", "Air", null, "Libra"],
  ["major-20", "Fire", "Pluto", null],
  ["wands-04", "Fire", "Venus", "Aries"],
  ["pentacles-07", "Earth", "Saturn", "Taurus"],
  ["swords-08", "Air", "Jupiter", "Gemini"],
  ["cups-10", "Water", "Mars", "Pisces"],
] as const)(
  "%s follows the selected source, including RWS Strength/Justice numbering",
  (id, element, planet, zodiac) => {
    expect(defaults(id)).toEqual({
      element: [element],
      planet: planet ? [planet] : [],
      zodiac: zodiac ? [zodiac] : [],
    });
  }
);

test("aces span their element's three signs; court astrology remains unassigned", () => {
  expect(defaults("wands-01")).toEqual({
    element: ["Fire"],
    planet: [],
    zodiac: ["Aries", "Leo", "Sagittarius"],
  });
  expect(defaults("swords-01")).toEqual({
    element: ["Air"],
    planet: [],
    zodiac: ["Gemini", "Libra", "Aquarius"],
  });
  for (const card of catalog) {
    if (card.arcana === "minor" && card.rank > 10) {
      expect(defaultCorrespondences(card).planet).toEqual([]);
      expect(defaultCorrespondences(card).zodiac).toEqual([]);
    }
  }
});

test("changing one library's defaults never changes another card or future library", () => {
  const first = createSeed("first", "owner", "2026-11-14T00:00:00Z");
  first.cards[0].content.correspondences.element.length = 0;
  first.cards[0].content.correspondences.planet.push("Mars");
  const second = createSeed("second", "owner", "2026-11-14T00:00:00Z");
  expect(second.cards[0].content.correspondences).toEqual(defaults("major-00"));
  expect(first.cards[1].content.correspondences).toEqual(defaults("major-01"));
});
