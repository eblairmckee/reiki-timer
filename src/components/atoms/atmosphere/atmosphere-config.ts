import type { MeshGradientProps } from "@paper-design/shaders-react";

export const atmosphereSettings = {
  // Shared across configuration and playback; responsive values are applied below.
  distortion: 0.37,
  grainMixer: 0.1,
  grainOverlay: 0.38,
  maxPixelCount: 1920 * 1080,
  minPixelRatio: 1,
  offsetY: 0,
  scale: 1,
  speed: 0.1,
  swirl: 0.78,
} satisfies MeshGradientProps;
export const chakraPalettes = [
  ["bold-root-garnet", "bold-root-crimson", "bold-root-ruby", "bold-root-oxblood"],
  ["bold-sacral-ember", "bold-sacral-orange", "bold-sacral-copper", "bold-sacral-burnt-sienna"],
  ["bold-solar-gold", "bold-solar-yellow-ochre", "bold-solar-mustard", "bold-solar-bronze"],
  ["bold-heart-forest", "bold-heart-emerald", "bold-heart-jade", "bold-heart-pine"],
  ["bold-throat-azure", "bold-throat-blue", "bold-throat-cerulean", "bold-throat-deep-water"],
  ["bold-third-eye-indigo", "bold-third-eye-iris", "bold-third-eye-midnight", "bold-third-eye-ink"],
  ["bold-crown-violet", "bold-crown-amethyst", "bold-crown-purple", "bold-crown-plum"],
] as const;
