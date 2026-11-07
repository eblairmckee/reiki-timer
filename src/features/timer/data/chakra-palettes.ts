import type { AtmospherePalette } from "@/components/design-system/atmosphere";

export const chakraPalettes = [
  [
    "--ref-color-pigment-garnet",
    "--ref-color-pigment-crimson",
    "--ref-color-pigment-ruby",
    "--ref-color-pigment-oxblood",
  ],
  [
    "--ref-color-pigment-ember",
    "--ref-color-pigment-orange",
    "--ref-color-pigment-copper",
    "--ref-color-pigment-burnt-sienna",
  ],
  [
    "--ref-color-pigment-gold",
    "--ref-color-pigment-yellow-ochre",
    "--ref-color-pigment-mustard",
    "--ref-color-pigment-bronze",
  ],
  [
    "--ref-color-pigment-forest",
    "--ref-color-pigment-emerald",
    "--ref-color-pigment-jade",
    "--ref-color-pigment-pine",
  ],
  [
    "--ref-color-pigment-azure",
    "--ref-color-pigment-blue",
    "--ref-color-pigment-cerulean",
    "--ref-color-pigment-deep-water",
  ],
  [
    "--ref-color-pigment-indigo",
    "--ref-color-pigment-iris",
    "--ref-color-pigment-midnight",
    "--ref-color-pigment-ink",
  ],
  [
    "--ref-color-pigment-violet",
    "--ref-color-pigment-amethyst",
    "--ref-color-pigment-purple",
    "--ref-color-pigment-plum",
  ],
] as const satisfies readonly AtmospherePalette[];
