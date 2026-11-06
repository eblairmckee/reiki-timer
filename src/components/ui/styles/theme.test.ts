import { expect, test } from "bun:test";
import { atmosphereSettings, chakraPalettes } from "../../atoms/atmosphere/atmosphere-config";
import { inkStrengths } from "../../atoms/atmosphere/ink-strength";

const theme = await Bun.file(new URL("./theme.css", import.meta.url)).text();

function token(name: string): string {
  const value = theme.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1];
  if (!value) throw new Error(`Missing theme token ${name}`);
  const reference = value.match(/^var\(([^)]+)\)$/);
  return reference ? token(reference[1]) : value;
}

function rgba(name: string) {
  const values = token(name).match(/^rgb\((\d+) (\d+) (\d+) \/ (\d+)%\)$/);
  if (!values) throw new Error(`Expected an explicit sRGB material token: ${name}`);
  return {
    rgb: values
      .slice(1, 4)
      .map(Number)
      .map((channel) => channel / 255),
    alpha: Number(values[4]) / 100,
  };
}

function luminance(rgb: number[]) {
  const linear = rgb.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

test("translucent text and placeholder retain contrast across any sRGB background", () => {
  for (const fillName of [
    "--glass-fill",
    "--glass-fill-hover",
    "--glass-fill-pressed",
    "--glass-fill-fallback",
  ]) {
    const fill = rgba(fillName);
    // Bound each backdrop channel independently across its entire possible [0, 1] range.
    const darkestSurface = fill.rgb.map((channel) => channel * fill.alpha);
    const lightestSurface = fill.rgb.map((channel) => channel * fill.alpha + 1 - fill.alpha);
    for (const inkName of ["--color-ink", "--color-placeholder"]) {
      const ink = rgba(inkName);
      const lightestInk = ink.rgb.map(
        (channel, i) => channel * ink.alpha + lightestSurface[i] * (1 - ink.alpha),
      );
      // A conservative bound: darkest possible surface / lightest possible composited ink.
      const lowerBound = (luminance(darkestSurface) + 0.05) / (luminance(lightestInk) + 0.05);
      expect(lowerBound).toBeGreaterThanOrEqual(4.5);
    }
  }
});

const palettes = chakraPalettes.map((names) =>
  names.map((name) => {
    const value = token(`--chakra-${name}`);
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Unexpected chakra token: ${name}`);
    return [1, 3, 5].map((start) => Number.parseInt(value.slice(start, start + 2), 16) / 255);
  }),
);

test("adaptive light ink meets its targets through bold palette changes, grain and dimming", () => {
  const maximumGrain = 0.35 * atmosphereSettings.grainOverlay ** 0.8;
  let minimumSmall = Infinity;
  let minimumLarge = Infinity;
  let minimumControl = Infinity;
  for (let phase = 0; phase < palettes.length; phase++) {
    const next = palettes[(phase + 1) % palettes.length];
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const colors = palettes[phase].map((rgb, i) => {
        const mix = Math.max(0, Math.min(1, progress * 2 - i / 3));
        return rgb.map((c, channel) => c + (next[i][channel] - c) * mix);
      });
      for (const dim of [0, 0.2, 0.5, 0.85, 1]) {
        const ink = inkStrengths(colors, atmosphereSettings.grainOverlay, dim);
        // Exercise actual shader color mixtures, independently of the interval solver.
        const samples = [
          ...colors,
          [0, 1, 2].map((c) => colors.reduce((sum, rgb) => sum + rgb[c], 0) / colors.length),
        ];
        for (const color of samples) {
          for (const grain of [-maximumGrain, 0, maximumGrain]) {
            const bg = color.map(
              (c) => (c * (1 - Math.abs(grain)) + Math.max(0, grain)) * (1 - dim),
            );
            function contrast(alpha: number, frost = 0) {
              const surface = bg.map((c) => c * (1 - frost) + frost);
              const glyph = surface.map((c) => alpha + c * (1 - alpha));
              return (luminance(glyph) + 0.05) / (luminance(surface) + 0.05);
            }
            minimumSmall = Math.min(minimumSmall, contrast(ink.text));
            minimumLarge = Math.min(minimumLarge, contrast(ink.display));
            minimumControl = Math.min(minimumControl, contrast(ink.control, 0.24));
          }
        }
      }
    }
  }
  expect(minimumSmall).toBeGreaterThanOrEqual(4.5);
  expect(minimumLarge).toBeGreaterThanOrEqual(3);
  expect(minimumControl).toBeGreaterThanOrEqual(3);
});

test("darkening the scene softens the foreground instead of retaining bright white ink", () => {
  const lit = inkStrengths(palettes[0], atmosphereSettings.grainOverlay);
  const black = inkStrengths(palettes[0], atmosphereSettings.grainOverlay, 1);
  expect(black.text).toBeLessThan(lit.text);
  expect(black.display).toBeLessThan(lit.display);
  expect(black.text).toBeLessThan(0.5);
  expect(black.display).toBeLessThan(0.4);
});
