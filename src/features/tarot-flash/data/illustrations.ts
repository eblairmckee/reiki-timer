import { catalog } from "./catalog";

/** Bundled centerline SVGs share a portrait viewBox and descriptive <desc>.
 * Load one card at a time; the renderer owns their etched stroke treatment. */
const sources = import.meta.glob<string>("../assets/illustrations/*.svg", {
  import: "default",
  query: "?raw",
});
export const illustrations: Readonly<Record<string, (() => Promise<string>) | undefined>> =
  Object.fromEntries(
    catalog.map((card) => [card.id, sources[`../assets/illustrations/${card.id}.svg`]])
  );
