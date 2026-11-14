/** Resolve white frost and black well layers from their theme owner. Each pair bounds
 * glyph-area backing; dark face shading/contact shadows only improve white-glyph contrast.
 * Decorative rims lie outside the glyph area. Primary actions and legacy words
 * use dark ink on a denser face. */
export function inkSurfaces(style: CSSStyleDeclaration) {
  const alpha = (name: string) => Number.parseFloat(style.getPropertyValue(name));
  const fill = alpha("--sys-opacity-frost-fill");
  const secondary = alpha("--sys-opacity-frost-secondary");
  const selected = alpha("--sys-opacity-frost-selected");
  const sheen = alpha("--sys-opacity-frost-sheen");
  const reveal = alpha("--sys-opacity-frost-reveal");
  const well = alpha("--sys-opacity-well-fill");
  const selectedWell = alpha("--sys-opacity-well-shade");

  function backing(face: number, shade: number) {
    const faceWhite = 1 - (1 - face) * (1 - sheen) * (1 - reveal);
    const transmission = 1 - faceWhite;
    return {
      frostAlpha: faceWhite,
      shadeAlpha: shade * transmission,
    };
  }
  return {
    control: [backing(fill, well), backing(secondary, well), backing(selected, selectedWell)],
    summaryShade: alpha("--sys-opacity-well-emphasized"),
  };
}
