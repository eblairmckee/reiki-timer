import { createFileRoute, redirect } from "@tanstack/react-router";
import { catalog } from "@/features/tarot-flash/data/catalog";

export const Route = createFileRoute("/tarot-flash/")({
  beforeLoad: () => {
    throw redirect({
      params: { deckIndex: String(catalog[Math.floor(Math.random() * catalog.length)].deckIndex) },
      replace: true,
      to: "/tarot-flash/$deckIndex",
    });
  },
});
