type RGB = readonly number[];
const luminanceWeights = [0.2126, 0.7152, 0.0722];

function linear(channel: number) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function luminance(rgb: RGB) {
  return luminanceWeights.reduce((sum, weight, c) => sum + weight * linear(rgb[c]), 0);
}

/** Conservative RGB intervals cover every mesh mix and black/white grain extreme. */
export function inkStrengths(colors: readonly RGB[], grainOverlay: number, dim = 0) {
  const grain = 0.35 * grainOverlay ** 0.8;
  const low = [0, 1, 2].map(
    (c) => Math.min(...colors.map((rgb) => rgb[c])) * (1 - grain) * (1 - dim),
  );
  const high = [0, 1, 2].map(
    (c) => (Math.max(...colors.map((rgb) => rgb[c])) * (1 - grain) + grain) * (1 - dim),
  );

  function strength(target: number, { frostAlpha = 0, shadeAlpha = 0, divisions = 4 } = {}) {
    const transmission = 1 - frostAlpha - shadeAlpha;
    const channels = low.map((value, c) => {
      const lower = value * transmission + frostAlpha;
      const step = ((high[c] - value) * transmission) / divisions;
      return Array.from({ length: divisions }, (_, i) => ({
        lower: lower + i * step,
        background: target * linear(lower + (i + 1) * step),
      }));
    });
    let min = 0;
    let max = 1;
    for (let i = 0; i < 10; i++) {
      const alpha = (min + max) / 2;
      // Luminance is a weighted sum. Bound each channel independently instead of
      // visiting every RGB combination when solving (Ltext + .05) / (Lsurface + .05).
      const margin = channels.reduce((sum, intervals, c) => {
        let worst = Infinity;
        for (const { lower, background } of intervals) {
          worst = Math.min(worst, linear(alpha + lower * (1 - alpha)) - background);
        }
        return sum + luminanceWeights[c] * worst;
      }, 0);
      if (margin >= (target - 1) * 0.05) max = alpha;
      else min = alpha;
    }
    return max;
  }
  return {
    text: strength(4.55),
    display: strength(3.05),
    control: strength(3.05, { frostAlpha: 0.24 }),
    summary: strength(4.5, { divisions: 12 }),
    "summary-glass": strength(4.5, { shadeAlpha: 0.18, divisions: 12 }),
  };
}
