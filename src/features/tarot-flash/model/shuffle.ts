import { catalog } from "../data/catalog";

export function restoreVisits(value: unknown): Set<string> {
  if (
    !(
      Array.isArray(value) &&
      value.every((id) => typeof id === "string" && catalog.some((card) => card.id === id))
    )
  ) {
    return new Set();
  }
  return new Set(value);
}
export function nextShuffle(visited: ReadonlySet<string>, current: string, random = Math.random) {
  let nextVisited = new Set([...visited, current]);
  let candidates = catalog.filter((entry) => !nextVisited.has(entry.id));
  if (!candidates.length) {
    nextVisited = new Set([current]);
    candidates = catalog.filter((entry) => entry.id !== current);
  }
  const card =
    candidates[
      Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))
    ];
  nextVisited.add(card.id);
  return { card, visited: nextVisited };
}
