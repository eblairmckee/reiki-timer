/** Decorative alchemical mark; the adjacent element name supplies its accessible meaning. */
export function ElementSymbol({ element }: { element: string }) {
  const name = element.toLowerCase();
  if (!["fire", "water", "air", "earth"].includes(name)) {
    return null;
  }
  const inverted = name === "water" || name === "earth";
  return (
    <svg aria-hidden="true" className="tarot-element-symbol" fill="none" viewBox="0 0 32 32">
      <path
        d={inverted ? "M5 7H27L16 27Z" : "M16 5L27 25H5Z"}
        stroke="currentColor"
        strokeLinejoin="miter"
        strokeWidth="1.35"
      />
      {(name === "air" || name === "earth") && (
        <path d={inverted ? "M7 14H25" : "M7 18H25"} stroke="currentColor" strokeWidth="1.35" />
      )}
    </svg>
  );
}
