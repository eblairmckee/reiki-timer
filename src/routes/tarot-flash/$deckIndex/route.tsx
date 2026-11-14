import { createFileRoute } from "@tanstack/react-router";
import { TarotScreen } from "@/features/tarot-flash/screens/tarot-screen";

export const Route = createFileRoute("/tarot-flash/$deckIndex")({ component: CardRoute });
function CardRoute() {
  const { deckIndex } = Route.useParams();
  return <TarotScreen deckIndex={deckIndex} />;
}
