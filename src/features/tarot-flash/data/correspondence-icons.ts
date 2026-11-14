import {
  MarsIcon,
  Moon02Icon,
  VenusIcon,
  ZodiacAquariusIcon,
  ZodiacAriesIcon,
  ZodiacCancerIcon,
  ZodiacCapricornIcon,
  ZodiacGeminiIcon,
  ZodiacLeoIcon,
  ZodiacLibraIcon,
  ZodiacPiscesIcon,
  ZodiacSagittariusIcon,
  ZodiacScorpioIcon,
  ZodiacTaurusIcon,
  ZodiacVirgoIcon,
} from "@hugeicons/core-free-icons";
import type { IconProps } from "@/components/design-system/icon";

// Missing astrological glyphs use the same 24px, unfilled stroke contract as Hugeicons.
function glyph(d: string): IconProps["icon"] {
  return [
    [
      "path",
      { d, key: "glyph", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" },
    ],
  ];
}

export const planetIcons: Record<string, IconProps["icon"]> = {
  jupiter: glyph("M6 4c7-2 8 6-1 11h14M15 3v18"),
  mars: MarsIcon,
  mercury: glyph("M8 2c0 4 8 4 8 0M17 10a5 5 0 1 1-10 0 5 5 0 0 1 10 0M12 15v7M8.5 19h7"),
  moon: Moon02Icon,
  neptune: glyph(
    "M5 4v4a7 7 0 0 0 14 0V4M12 2v20M8 18h8M2.5 6 5 3l2.5 3M9.5 5 12 2l2.5 3M16.5 6 19 3l2.5 3"
  ),
  pluto: glyph("M15 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0M5 7a7 7 0 0 0 14 0M12 14v8M8 18h8"),
  saturn: glyph("M8 2v15M4.5 6h7M8 12c3-6 11-4 8 2l-3 5c-1 2 1 3 3 2"),
  sun: glyph("M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0M12 11.7v.6"),
  uranus: glyph("M5 3v11M19 3v11M5 8h14M12 3v13M15 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0"),
  venus: VenusIcon,
};

export const zodiacIcons: Record<string, IconProps["icon"]> = {
  aquarius: ZodiacAquariusIcon,
  aries: ZodiacAriesIcon,
  cancer: ZodiacCancerIcon,
  capricorn: ZodiacCapricornIcon,
  gemini: ZodiacGeminiIcon,
  leo: ZodiacLeoIcon,
  libra: ZodiacLibraIcon,
  pisces: ZodiacPiscesIcon,
  sagittarius: ZodiacSagittariusIcon,
  scorpio: ZodiacScorpioIcon,
  taurus: ZodiacTaurusIcon,
  virgo: ZodiacVirgoIcon,
};
