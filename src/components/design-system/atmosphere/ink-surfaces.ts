/** Resolve white frost and black well layers from their theme owner. Each pair bounds
 * glyph-area backing; dark face shading/contact shadows only improve white-glyph contrast.
 * Decorative rims lie outside the glyph area. Word actions use separate dark ink/light frost. */
export function inkSurfaces(style: CSSStyleDeclaration) {
  const alpha = (name: string) => Number.parseFloat(style.getPropertyValue(name));
  const fill = alpha("--sys-opacity-frost-fill");
  const selected = alpha("--sys-opacity-frost-selected");
  const sheen = alpha("--sys-opacity-frost-sheen");
  const reveal = alpha("--sys-opacity-frost-reveal");
  const well = alpha("--sys-opacity-well-fill");
  const selectedWell = alpha("--sys-opacity-well-shade");

  function backing(face: number, shade: number, grouped = false) {
    const faceWhite = 1 - (1 - face) * (1 - sheen) * (1 - reveal);
    const transmission = 1 - faceWhite;
    return {
      frostAlpha: faceWhite + (grouped ? sheen * (1 - shade) * transmission : 0),
      shadeAlpha: shade * transmission,
    };
  }
  return {
    control: [
      backing(fill, well),
      backing(selected, selectedWell),
      backing(sheen, well, true),
      backing(selected, selectedWell, true),
    ],
    summaryShade: alpha("--sys-opacity-well-emphasized"),
  };
}
