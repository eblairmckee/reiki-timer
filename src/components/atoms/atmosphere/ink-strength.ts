type RGB = readonly number[];

export function luminance(rgb: RGB) {
  const linear = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
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

  function strength(target: number, frost = 0) {
    const lower = low.map((v) => v * (1 - frost) + frost);
    const upper = high.map((v) => v * (1 - frost) + frost);
    const cells: { low: number[]; background: number }[] = [];
    const divisions = 4;
    for (let r = 0; r < divisions; r++) {
      for (let g = 0; g < divisions; g++) {
        for (let b = 0; b < divisions; b++) {
          const indices = [r, g, b];
          cells.push({
            low: indices.map((v, c) => lower[c] + ((upper[c] - lower[c]) * v) / divisions),
            background: luminance(
              indices.map((v, c) => lower[c] + ((upper[c] - lower[c]) * (v + 1)) / divisions),
            ),
          });
        }
      }
    }
    let min = 0;
    let max = 1;
    for (let i = 0; i < 10; i++) {
      const alpha = (min + max) / 2;
      const passes = cells.every(
        (cell) =>
          (luminance(cell.low.map((v) => alpha + v * (1 - alpha))) + 0.05) /
            (cell.background + 0.05) >=
          target,
      );
      if (passes) max = alpha;
      else min = alpha;
    }
    return max;
  }
  // Fill + sheen + hover light remain below 24% white at the glyphs.
  return { text: strength(4.55), display: strength(3.05), control: strength(3.05, 0.24) };
}
