export interface VectorShape {
  attributes: Record<string, string>;
  children: VectorShape[];
  fillRole?: "primary" | "secondary";
  key: string;
  outline: boolean;
  tag: "g" | "path" | "circle" | "ellipse" | "line" | "polyline" | "polygon" | "rect";
}
export interface Illustration {
  description: string;
  shapes: VectorShape[];
  viewBox: string;
}
const tags = new Set(["g", "path", "circle", "ellipse", "line", "polyline", "polygon", "rect"]);
const geometryAttributes = new Set([
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "points",
  "transform",
  "opacity",
]);
const coordinates = /[\s,]+/u;

function vectorShape(element: Element, key: string): VectorShape {
  if (!tags.has(element.localName)) {
    throw new Error("Illustrations must contain only vector strokes.");
  }
  const fillRole = element.getAttribute("data-fill");
  if (fillRole !== null && fillRole !== "primary" && fillRole !== "secondary") {
    throw new Error("Unknown illustration fill role.");
  }
  const fill = element.getAttribute("fill");
  if (fill !== null && fill !== "none" && !(fillRole && fill === "currentColor")) {
    throw new Error("Illustration paint must be controlled by the interface.");
  }
  if (element.hasAttribute("data-outline") && element.getAttribute("data-outline") !== "none") {
    throw new Error("Unknown illustration outline treatment.");
  }
  const attributes = Object.fromEntries(
    [...element.attributes]
      .filter((attribute) => geometryAttributes.has(attribute.name))
      .map((attribute) => [attribute.name, attribute.value])
  );
  return {
    attributes,
    children: [...element.children].map((child, index) => vectorShape(child, `${key}/${index}`)),
    ...(fillRole ? { fillRole } : {}),
    key,
    outline: element.getAttribute("data-outline") !== "none",
    // Validated above against the finite SVG geometry allowlist, not arbitrary markup.
    tag: element.localName as VectorShape["tag"],
  };
}

/** Parse bundled SVGs into a small React-renderable geometry tree. Never inject raw
 * markup, scripts, external references, raster images, or asset-controlled paint. */
export function parseIllustration(source: string): Illustration {
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  const root = doc.documentElement;
  if (doc.querySelector("parsererror") || root.localName !== "svg") {
    throw new Error("Invalid illustration SVG.");
  }
  const viewBox = root.getAttribute("viewBox") ?? "";
  const values = viewBox.trim().split(coordinates).map(Number);
  if (
    values.length !== 4 ||
    values.some((value) => !Number.isFinite(value)) ||
    values[2] <= 0 ||
    values[3] <= 0
  ) {
    throw new Error("An illustration needs a valid viewBox.");
  }
  const description = root.querySelector(":scope > desc")?.textContent?.trim() ?? "";
  if (!description) {
    throw new Error("An illustration needs descriptive alternative text.");
  }
  const shapes = [...root.children]
    .filter((child) => child.localName !== "title" && child.localName !== "desc")
    .map((child, index) => vectorShape(child, String(index)));
  if (!shapes.length) {
    throw new Error("An illustration needs vector geometry.");
  }
  return { description, shapes, viewBox };
}
