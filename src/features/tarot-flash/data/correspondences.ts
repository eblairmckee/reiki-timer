export const elements = ["Fire", "Water", "Air", "Earth"] as const;
export const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const planets = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

export const correspondenceFields = [
  { choices: elements, id: "element", label: "Element" },
  { choices: zodiacSigns, id: "zodiac", label: "Zodiac" },
  { choices: planets, id: "planet", label: "Planet" },
] as const;
