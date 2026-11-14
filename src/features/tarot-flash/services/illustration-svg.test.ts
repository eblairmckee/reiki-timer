import { expect, test } from "vitest";
import { parseIllustration } from "./illustration-svg";

test("preserves vector geometry and description while leaving paint to the interface", () => {
  const result = parseIllustration(
    '<svg viewBox="0 0 240 360"><desc>A traveler beside a cliff.</desc><g transform="translate(4 5)"><path d="M10 20L30 40" fill="none" stroke="black" stroke-width="3"/></g></svg>'
  );
  expect(result.description).toBe("A traveler beside a cliff.");
  expect(result.shapes[0].attributes).toEqual({ transform: "translate(4 5)" });
  expect(result.shapes[0].children[0].attributes).toEqual({ d: "M10 20L30 40" });
});
test.each([
  '<image href="raster.png"/>',
  "<script>bad()</script>",
  '<path d="M0 0L1 1" fill="black"/>',
  '<path d="M0 0L1 1" data-fill="unknown"/>',
  '<path d="M0 0L1 1" data-fill="primary" fill="url(https://example.com)"/>',
])("rejects unsupported artwork %s", (shape) => {
  expect(() =>
    parseIllustration(`<svg viewBox="0 0 240 360"><desc>Test.</desc>${shape}</svg>`)
  ).toThrow();
});
test("keeps primary and secondary fill roles separate from asset-controlled paint", () => {
  const result = parseIllustration(
    '<svg viewBox="0 0 240 360"><desc>Symbol fill study.</desc><path d="M0 0L10 0L5 10Z" data-fill="primary" data-outline="none" fill="currentColor"/><path d="M20 20L30 20L25 30Z" data-fill="secondary" fill="currentColor" fill-opacity="0.28"/></svg>'
  );
  expect(result.shapes[0].fillRole).toBe("primary");
  expect(result.shapes[0].outline).toBe(false);
  expect(result.shapes[1].fillRole).toBe("secondary");
  expect(result.shapes[1].outline).toBe(true);
  expect(result.shapes[1].attributes).toEqual({ d: "M20 20L30 20L25 30Z" });
});
test("requires descriptive alternatives and usable dimensions", () => {
  expect(() =>
    parseIllustration('<svg viewBox="0 0 240 360"><path d="M0 0L1 1"/></svg>')
  ).toThrow();
  expect(() =>
    parseIllustration('<svg viewBox="0 0 0 360"><desc>Test.</desc><path d="M0 0L1 1"/></svg>')
  ).toThrow();
});
