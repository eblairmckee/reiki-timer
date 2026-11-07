export const chimes = [
  { file: "alex_jauk-zen-tone-deep-202555.mp3", id: "zen-deep", name: "Deep zen tone" },
  { file: "alex_jauk-zen-tone-mid-202556.mp3", id: "zen-mid", name: "Mid zen tone" },
  { file: "alex_jauk-zen-tone-high-202554.mp3", id: "zen-high", name: "High zen tone" },
  {
    file: "freesound_community-e-flat-tibetan-singing-bowl-struck-38746.mp3",
    id: "tibetan-bowl",
    name: "Tibetan singing bowl",
  },
  {
    file: "freesound_community-singing-bowl-hit-3-33366.mp3",
    id: "bowl-hit",
    name: "Singing bowl hit",
  },
  {
    file: "freesound_community-singing-bowl-strike-sound-84682.mp3",
    id: "bowl-strike",
    name: "Singing bowl strike",
  },
] as const;

export type ChimeId = (typeof chimes)[number]["id"];
export const defaultChime: ChimeId = "zen-mid";

export function isChimeId(value: unknown): value is ChimeId {
  return chimes.some((chime) => chime.id === value);
}

/** Resolve product asset identity before handing audio to the shared resource owner. */
export function chimeSource(id: ChimeId): string {
  const chime = chimes.find((item) => item.id === id);
  if (!chime) {
    throw new Error("Unknown chime");
  }
  return `${import.meta.env?.BASE_URL ?? "/"}chime-sounds/${chime.file}`;
}
