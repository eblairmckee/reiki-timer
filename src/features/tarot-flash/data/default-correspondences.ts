import type { CatalogCard, Suit } from "../model/types";
import { type elements, type planets, zodiacSigns } from "./correspondences";

type Element = (typeof elements)[number];
type Planet = (typeof planets)[number];
type Zodiac = (typeof zodiacSigns)[number];
type Assignment = { element: Element } & (
  | { planet: Planet; zodiac?: never }
  | { planet?: never; zodiac: Zodiac }
);
interface DecanGroup {
  planets: readonly [Planet, Planet, Planet];
  zodiac: Zodiac;
}

// Tarot Elements, RWS sequence. Astrology names one sign OR one planet per major;
// do not add the sign's planetary ruler or infer a sign from a planetary trump.
// https://tarotelements.com/major-arcana-correspondences/
const major: Readonly<Record<string, Assignment>> = {
  "major-00": { element: "Air", planet: "Uranus" },
  "major-01": { element: "Air", planet: "Mercury" },
  "major-02": { element: "Water", planet: "Moon" },
  "major-03": { element: "Earth", planet: "Venus" },
  "major-04": { element: "Fire", zodiac: "Aries" },
  "major-05": { element: "Earth", zodiac: "Taurus" },
  "major-06": { element: "Air", zodiac: "Gemini" },
  "major-07": { element: "Water", zodiac: "Cancer" },
  "major-08": { element: "Fire", zodiac: "Leo" },
  "major-09": { element: "Earth", zodiac: "Virgo" },
  "major-10": { element: "Fire", planet: "Jupiter" },
  "major-11": { element: "Air", zodiac: "Libra" },
  "major-12": { element: "Water", planet: "Neptune" },
  "major-13": { element: "Water", zodiac: "Scorpio" },
  "major-14": { element: "Fire", zodiac: "Sagittarius" },
  "major-15": { element: "Earth", zodiac: "Capricorn" },
  "major-16": { element: "Fire", planet: "Mars" },
  "major-17": { element: "Air", zodiac: "Aquarius" },
  "major-18": { element: "Water", zodiac: "Pisces" },
  "major-19": { element: "Fire", planet: "Sun" },
  "major-20": { element: "Fire", planet: "Pluto" },
  "major-21": { element: "Earth", planet: "Saturn" },
};

// Labyrinthos: groups correspond to ranks 2–4, 5–7, and 8–10 respectively.
// Aces span all three signs of their element. Court astrology is not assigned
// by this article; courts receive only the suit element.
// https://labyrinthos.co/blogs/learn-tarot-with-labyrinthos-academy/astrology-and-tarot-correspondences-the-minor-arcana-pip-cards
const minor: Readonly<
  Record<Suit, { element: Element; groups: readonly [DecanGroup, DecanGroup, DecanGroup] }>
> = {
  cups: {
    element: "Water",
    groups: [
      { planets: ["Venus", "Mercury", "Moon"], zodiac: "Cancer" },
      { planets: ["Mars", "Sun", "Venus"], zodiac: "Scorpio" },
      { planets: ["Saturn", "Jupiter", "Mars"], zodiac: "Pisces" },
    ],
  },
  pentacles: {
    element: "Earth",
    groups: [
      { planets: ["Jupiter", "Mars", "Sun"], zodiac: "Capricorn" },
      { planets: ["Mercury", "Moon", "Saturn"], zodiac: "Taurus" },
      { planets: ["Sun", "Venus", "Mercury"], zodiac: "Virgo" },
    ],
  },
  swords: {
    element: "Air",
    groups: [
      { planets: ["Moon", "Saturn", "Jupiter"], zodiac: "Libra" },
      { planets: ["Venus", "Mercury", "Moon"], zodiac: "Aquarius" },
      { planets: ["Jupiter", "Mars", "Sun"], zodiac: "Gemini" },
    ],
  },
  wands: {
    element: "Fire",
    groups: [
      { planets: ["Mars", "Sun", "Venus"], zodiac: "Aries" },
      { planets: ["Saturn", "Jupiter", "Mars"], zodiac: "Leo" },
      { planets: ["Mercury", "Moon", "Saturn"], zodiac: "Sagittarius" },
    ],
  },
};

/** Fresh arrays become ordinary editable library content, never read-time fallbacks. */
export function defaultCorrespondences(card: CatalogCard): {
  element: Element[];
  planet: Planet[];
  zodiac: Zodiac[];
} {
  if (card.arcana === "major") {
    const entry = major[card.id];
    if (!entry) {
      throw new Error(`Missing correspondence defaults for ${card.id}`);
    }
    return {
      element: [entry.element],
      planet: entry.planet ? [entry.planet] : [],
      zodiac: entry.zodiac ? [entry.zodiac] : [],
    };
  }
  const suit = minor[card.suit];
  if (card.rank === 1) {
    return {
      element: [suit.element],
      planet: [],
      zodiac: zodiacSigns.filter((sign) => suit.groups.some((decan) => decan.zodiac === sign)),
    };
  }
  if (card.rank > 10) {
    return { element: [suit.element], planet: [], zodiac: [] };
  }
  const group = suit.groups[Math.floor((card.rank - 2) / 3)];
  return {
    element: [suit.element],
    planet: [group.planets[(card.rank - 2) % 3]],
    zodiac: [group.zodiac],
  };
}
