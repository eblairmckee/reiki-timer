import { blend, converter, wcagContrast, wcagLuminance } from "culori";
import { expect, test } from "vitest";
import "@/components/design-system/styles/index.css";
import { atmosphereSettings } from "@/components/design-system/atmosphere/atmosphere-config";
import { inkStrengths } from "@/components/design-system/atmosphere/ink-strength";
import { motion } from "@/components/design-system/shared/motion";
import { chakraPalettes } from "@/features/timer/scene-atmosphere";

test("CSS scene transitions and Motion use the same default clock and easing", () => {
  const probe = document.createElement("span");
  document.body.append(probe);
  try {
    for (const phase of ["enter", "exit"] as const) {
      probe.style.transition = `opacity var(--sys-motion-scene-${phase}) var(--sys-motion-scene-easing)`;
      const computed = getComputedStyle(probe);
      expect(computed.transitionDuration).toBe(`${motion.scene[phase].duration}s`);
      expect(motion.scene[phase].ease).toBe("easeInOut");
      expect(computed.transitionTimingFunction).toBe("ease-in-out");
    }
  } finally {
    probe.remove();
  }
});

// Resolve aliases, color-mix and runtime custom properties through Chromium's CSS engine.
function rgba(name: string) {
  expect(getComputedStyle(document.documentElement).getPropertyValue(name).trim()).not.toBe("");
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const parsed = converter("rgb")(resolved);
  // biome-ignore lint/suspicious/noUnnecessaryConditions: CSS token values are runtime input; typings assume parseable color strings.
  if (!parsed) {
    throw new Error(`Unparseable browser color ${name}: ${resolved}`);
  }
  return { alpha: parsed.alpha ?? 1, rgb: [parsed.r, parsed.g, parsed.b] };
}
function color(rgb: readonly number[], alpha = 1) {
  return { alpha, b: rgb[2], g: rgb[1], mode: "rgb" as const, r: rgb[0] };
}
function composite(source: readonly number[], alpha: number, backdrop: readonly number[]) {
  const result = blend([color(backdrop), color(source, alpha)]);
  return [result.r, result.g, result.b];
}
function luminance(rgb: readonly number[]) {
  return wcagLuminance(color(rgb));
}
function contrastRatio(foreground: readonly number[], background: readonly number[]) {
  return wcagContrast(color(foreground), color(background));
}

// Mirror Atmosphere's production percentage mapping, then resolve the real ink selectors.
function renderedInk(strengths: ReturnType<typeof inkStrengths>) {
  const scope = document.createElement("div");
  scope.className = "atmosphere-scope";
  for (const [name, strength] of Object.entries(strengths)) {
    scope.style.setProperty(
      `--sys-opacity-ink-${name}-alpha`,
      `${Math.ceil(strength * 1000) / 10}%`
    );
  }
  document.body.append(scope);
  function alpha(kind: string, glass = false) {
    const text = document.createElement("span");
    text.dataset.ink = kind;
    if (glass) {
      text.style.setProperty("--cmp-color-summary-ink", "var(--sys-color-ink-summary-glass)");
    }
    scope.append(text);
    const resolved = converter("rgb")(getComputedStyle(text).color);
    text.remove();
    // biome-ignore lint/suspicious/noUnnecessaryConditions: guard runtime CSS values, which the converter signature assumes are parseable.
    if (!resolved) {
      throw new Error("Runtime ink CSS could not be parsed");
    }
    expect([resolved.r, resolved.g, resolved.b]).toEqual([1, 1, 1]);
    return resolved.alpha ?? 1;
  }
  try {
    return {
      control: alpha("control"),
      display: alpha("display"),
      summary: alpha("summary"),
      "summary-glass": alpha("summary", true),
      text: alpha("detail"),
    };
  } finally {
    scope.remove();
  }
}

function assertGlassContrast() {
  const ink = rgba("--sys-color-ink-on-glass");
  for (const fillName of [
    "--sys-color-glass-fill",
    "--sys-color-glass-fill-hover",
    "--sys-color-glass-fill-disabled",
    "--sys-color-glass-fill-fallback",
  ]) {
    const fill = rgba(fillName);
    // Bound each backdrop channel independently across its entire possible [0, 1] range.
    const darkestSurface = composite(fill.rgb, fill.alpha, [0, 0, 0]);
    const lightestSurface = composite(fill.rgb, fill.alpha, [1, 1, 1]);
    const lightestInk = composite(ink.rgb, ink.alpha, lightestSurface);
    // A conservative bound: darkest possible surface / lightest possible composited ink.
    const lowerBound = (luminance(darkestSurface) + 0.05) / (luminance(lightestInk) + 0.05);
    expect(lowerBound).toBeGreaterThanOrEqual(4.5);
    expect(luminance(darkestSurface)).toBeGreaterThan(luminance(lightestInk));
    console.info(
      JSON.stringify({
        ink: "--sys-color-ink-on-glass",
        material: fillName,
        minimumContrast: lowerBound,
        target: 4.5,
      })
    );
  }
}

test("translucent text retains contrast on glass across any sRGB background", assertGlassContrast);

test("word-button ink retains small-text contrast at the shaded end of the frosted face", () => {
  const fill = rgba("--cmp-color-button-word-fill");
  const shade = rgba("--sys-color-frost-shade");
  const ink = rgba("--sys-color-ink-on-glass");
  // Bound the face on black and the dark lettering on white, including the face gradient.
  const darkestFace = composite(shade.rgb, shade.alpha, composite(fill.rgb, fill.alpha, [0, 0, 0]));
  const lightestInk = composite(ink.rgb, ink.alpha, [1, 1, 1]);
  console.info(
    JSON.stringify({
      material: "shaded word-button",
      minimumContrast: (luminance(darkestFace) + 0.05) / (luminance(lightestInk) + 0.05),
      target: 4.5,
    })
  );
  expect(luminance(darkestFace)).toBeGreaterThan(luminance(lightestInk));
  expect((luminance(darkestFace) + 0.05) / (luminance(lightestInk) + 0.05)).toBeGreaterThanOrEqual(
    4.5
  );
});

test("the muted timestamp stays legible on timeline glass", () => {
  const glass = rgba("--cmp-color-summary-details-surface");
  const time = rgba("--cmp-color-timeline-time");
  const event = rgba("--sys-color-ink-on-dark-glass");
  const brightestGlass = composite(glass.rgb, glass.alpha, [1, 1, 1]);
  const dimmestTime = composite(time.rgb, time.alpha, composite(glass.rgb, glass.alpha, [0, 0, 0]));
  console.info(
    JSON.stringify({
      eventAlpha: event.alpha,
      material: "timeline timestamp",
      minimumContrast: (luminance(dimmestTime) + 0.05) / (luminance(brightestGlass) + 0.05),
      target: 4.5,
      timeAlpha: time.alpha,
    })
  );
  expect(time.alpha).toBeLessThan(event.alpha);
  expect(luminance(dimmestTime)).toBeGreaterThan(luminance(brightestGlass));
  expect(
    (luminance(dimmestTime) + 0.05) / (luminance(brightestGlass) + 0.05)
  ).toBeGreaterThanOrEqual(4.5);
});

const palettes = chakraPalettes.map((names) => names.map((name) => rgba(name).rgb));

test("adaptive light ink meets its targets through bold palette changes, grain and dimming", () => {
  const maximumGrain = 0.35 * atmosphereSettings.grainOverlay ** 0.8;
  let minimumSmall = Number.POSITIVE_INFINITY;
  let minimumLarge = Number.POSITIVE_INFINITY;
  let minimumControl = Number.POSITIVE_INFINITY;
  let minimumSummary = Number.POSITIVE_INFINITY;
  const glass = rgba("--sys-color-well-fill-emphasized");
  const control = rgba("--sys-color-well-light");
  for (let phase = 0; phase < palettes.length; phase += 1) {
    const next = palettes[(phase + 1) % palettes.length];
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const colors = palettes[phase].map((rgb, i) => {
        const mix = Math.max(0, Math.min(1, progress * 2 - i / 3));
        return rgb.map((c, channel) => c + (next[i][channel] - c) * mix);
      });
      for (const dim of [0, 0.2, 0.5, 0.85, 1]) {
        const strengths = inkStrengths(colors, atmosphereSettings.grainOverlay, dim);
        expect(strengths.summary).toBeLessThan(strengths.text);
        expect(strengths["summary-glass"]).toBeLessThan(strengths.text);
        const ink = renderedInk(strengths);
        // Production percentage rounding may merge adjacent alpha values, never invert hierarchy.
        expect(ink.summary).toBeLessThanOrEqual(ink.text);
        expect(ink["summary-glass"]).toBeLessThanOrEqual(ink.text);
        // Sample a numerical model of shader mixtures; no rendered GPU pixels are read.
        const samples = [
          ...colors,
          [0, 1, 2].map((c) => colors.reduce((sum, rgb) => sum + rgb[c], 0) / colors.length),
        ];
        for (const sample of samples) {
          for (const grain of [-maximumGrain, 0, maximumGrain]) {
            const bg = sample.map(
              (c) => (c * (1 - Math.abs(grain)) + Math.max(0, grain)) * (1 - dim)
            );
            function contrast(alpha: number, overlay = 0, pigment = [1, 1, 1]) {
              const surface = composite(pigment, overlay, bg);
              const glyph = composite([1, 1, 1], alpha, surface);
              expect(luminance(glyph)).toBeGreaterThan(luminance(surface));
              return contrastRatio(glyph, surface);
            }
            minimumSmall = Math.min(minimumSmall, contrast(ink.text));
            minimumLarge = Math.min(minimumLarge, contrast(ink.display));
            minimumControl = Math.min(
              minimumControl,
              contrast(ink.control, control.alpha, control.rgb)
            );
            minimumSummary = Math.min(
              minimumSummary,
              contrast(ink.summary),
              contrast(ink["summary-glass"], glass.alpha, glass.rgb)
            );
          }
        }
      }
    }
  }
  console.info(
    JSON.stringify({
      minimumControl,
      minimumLarge,
      minimumSmall,
      minimumSummary,
      samples: 7 * 5 * 5 * 5 * 3,
    })
  );
  expect(minimumSmall).toBeGreaterThanOrEqual(4.5);
  expect(minimumLarge).toBeGreaterThanOrEqual(3);
  expect(minimumControl).toBeGreaterThanOrEqual(3);
  expect(minimumSummary).toBeGreaterThanOrEqual(4.5);
});

test("darkening the scene softens the foreground instead of retaining bright white ink", () => {
  const lit = renderedInk(inkStrengths(palettes[0], atmosphereSettings.grainOverlay));
  const black = renderedInk(inkStrengths(palettes[0], atmosphereSettings.grainOverlay, 1));
  console.info(JSON.stringify({ dimmed: black, lit }));
  expect(black.text).toBeLessThan(lit.text);
  expect(black.display).toBeLessThan(lit.display);
  expect(black.text).toBeLessThan(0.5);
  expect(black.display).toBeLessThan(0.4);
});
