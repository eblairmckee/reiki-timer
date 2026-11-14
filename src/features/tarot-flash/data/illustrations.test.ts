import { expect, test } from "vitest";
import { parseIllustration, type VectorShape } from "../services/illustration-svg";
import { catalog } from "./catalog";
import { illustrations } from "./illustrations";

const unsupportedMarkup = /<(?:image|foreignObject|script|filter)\b|data:image/u;
const bezierPath = /^M[\d. -]+C/u;
const invalidCoordinate = /NaN|Infinity|undefined/u;

function pathsIn(shapes: VectorShape[]): VectorShape[] {
  return shapes.flatMap((shape) => (shape.tag === "g" ? pathsIn(shape.children) : [shape]));
}

test("bundles one illustration for every catalog card", () => {
  expect(Object.keys(illustrations)).toHaveLength(78);
  expect(Object.values(illustrations).every(Boolean)).toBe(true);
});

test.each(catalog)("$id loads editable strokes through the application parser", async (card) => {
  const load = illustrations[card.id];
  expect(load).toBeDefined();
  if (!load) {
    throw new Error(`Missing illustration for ${card.id}`);
  }
  const source = await load();
  const drawing = parseIllustration(source);
  expect(drawing.viewBox).toBe("0 0 240 360");
  expect(drawing.description.length).toBeGreaterThan(30);
  expect(source).toContain('fill="none"');
  expect(source).toContain('stroke="currentColor"');
  expect(source).toContain('stroke-linecap="round"');
  expect(source).toContain('stroke-linejoin="round"');
  expect(source).not.toMatch(unsupportedMarkup);
  const paths = pathsIn(drawing.shapes);
  expect(paths.length).toBeGreaterThan(0);
  expect(paths.some((shape) => shape.fillRole === "primary")).toBe(true);
  if (card.arcana === "minor" && (card.rank === 1 || card.rank >= 11)) {
    expect(paths.some((shape) => shape.fillRole === "secondary")).toBe(true);
  }
  for (const shape of paths) {
    expect(shape.tag).toBe("path");
    expect(shape.attributes.d).toMatch(bezierPath);
    expect(shape.attributes.d).not.toMatch(invalidCoordinate);
    expect(Object.keys(shape.attributes)).toEqual(["d"]);
  }
});
