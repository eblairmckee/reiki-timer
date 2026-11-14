import { useCallback, useEffect, useState } from "react";
import type { LibraryCard, StudyLibrary, TarotService } from "../model/types";
import { createTarotService, storageMessage } from "../services/library-storage";
import { createShuffleSession, tabStorage } from "../services/shuffle-session";

export interface LibraryResource {
  cards: LibraryCard[];
  library: StudyLibrary;
  service: TarotService;
  session: ReturnType<typeof createShuffleSession>;
}
type LibraryState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; resource: LibraryResource };

export function useLibrary() {
  const [connection, setConnection] = useState({ create: createTarotService });
  const [state, setState] = useState<LibraryState>({ kind: "loading" });
  useEffect(() => {
    let current = true;
    const service = connection.create();
    setState({ kind: "loading" });
    async function load() {
      try {
        const library = await service.initializeLibrary();
        const cards = await service.listCards();
        if (current) {
          setState({
            kind: "ready",
            resource: {
              cards,
              library,
              service,
              session: createShuffleSession(library.id, tabStorage()),
            },
          });
        }
      } catch (error) {
        if (current) {
          setState({ kind: "error", message: storageMessage(error) });
        }
      }
    }
    load();
    return () => {
      current = false;
      service.close();
    };
  }, [connection]);
  const updateCard = useCallback((card: LibraryCard) => {
    setState((previous) => {
      if (previous.kind !== "ready" || previous.resource.library.id !== card.libraryId) {
        return previous;
      }
      const { cards } = previous.resource;
      const existing = cards.find((entry) => entry.catalogCardId === card.catalogCardId);
      if (existing === card) {
        return previous;
      }
      return {
        ...previous,
        resource: {
          ...previous.resource,
          cards: existing
            ? cards.map((entry) => (entry === existing ? card : entry))
            : [...cards, card],
        },
      };
    });
  }, []);
  return { retry: () => setConnection({ create: createTarotService }), state, updateCard };
}
