import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { routeTransitionTypes } from "@/app/routing/route-motion";
import { routeTree } from "../../src/routeTree.gen";
import { browserAction } from "./react-browser";
import "@/app/styles/global.css";

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

test("overlapping native route animations keep the latest view interactive without a skipped-transition error", async () => {
  const router = createRouter({
    defaultViewTransition: { types: routeTransitionTypes },
    history: createMemoryHistory({ initialEntries: ["/"] }),
    isServer: false,
    routeTree,
  });
  await router.load();
  render(<RouterProvider router={router} />);
  await screen.findByRole("slider", { name: "Healing time" });
  await waitFor(() =>
    expect(document.documentElement.matches(":active-view-transition")).toBe(false)
  );
  expect(routeTransitionTypes()).toEqual(["navigation"]);
  // A long native animation makes the overlap deterministic under reduced motion too.
  const style = document.createElement("style");
  style.textContent = "::view-transition-group(root) { animation-duration: 1s; }";
  document.head.append(style);
  try {
    await browserAction(() => router.navigate({ to: "/reiki-on/edit" }));
    expect(document.documentElement.matches(":active-view-transition")).toBe(true);
    expect(routeTransitionTypes()).toBe(false);
    await browserAction(() => router.navigate({ to: "/reiki-on" }));
    await waitFor(
      () => expect(document.documentElement.matches(":active-view-transition")).toBe(false),
      { timeout: 3000 }
    );
    expect(router.state.location.pathname).toBe("/reiki-on");
    expect(screen.queryByRole("slider", { name: "Healing time" })).toBeNull();
    expect(screen.getByRole("button", { name: "Start timer" }).hasAttribute("disabled")).toBe(
      false
    );
    expect(routeTransitionTypes()).toEqual(["navigation"]);
    // Vitest also fails this test if native ready/update promises reject unhandled.
  } finally {
    style.remove();
  }
});
