import { createRouter } from "@tanstack/react-router";
import { routeTransitionTypes } from "@/app/routing/route-motion";
import { routeTree } from "@/routeTree.gen";

export const router = createRouter({
  defaultPreload: "intent",
  defaultViewTransition: { types: routeTransitionTypes },
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
