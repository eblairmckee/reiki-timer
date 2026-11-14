import { nextShuffle, restoreVisits } from "../model/shuffle";

/** One tab/library session; storage denial falls back to the mounted session only. */
export function createShuffleSession(
  libraryId: string,
  storage: Pick<Storage, "getItem" | "setItem"> | undefined
) {
  const key = `tarot-flash:visited:v1:${libraryId}`;
  let visited = new Set<string>();
  try {
    visited = restoreVisits(JSON.parse(storage?.getItem(key) ?? "null"));
  } catch {
    /* A malformed transient session can restart. */
  }
  function persist() {
    try {
      storage?.setItem(key, JSON.stringify([...visited]));
    } catch {
      /* Saved study content is unaffected. */
    }
  }
  return {
    reset(id: string) {
      visited = new Set([id]);
      persist();
    },
    shuffle(id: string) {
      const next = nextShuffle(visited, id);
      ({ visited } = next);
      persist();
      return next.card;
    },
    visit(id: string) {
      visited.add(id);
      persist();
    },
  };
}

export function tabStorage() {
  try {
    return window.sessionStorage;
  } catch {
    // Storage can be denied even when the property exists. Use the in-memory session.
  }
}
