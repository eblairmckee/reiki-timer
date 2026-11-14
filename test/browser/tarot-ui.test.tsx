import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, expect, test } from "vitest";
import { cdp, page } from "vitest/browser";
import { createTarotService, databaseName } from "@/features/tarot-flash/services/library-storage";
import { routeTree } from "@/routeTree.gen";
import { browserAction, userEvent } from "./react-browser";
import "@/app/styles/global.css";

const originalViewport = { height: innerHeight, width: innerWidth };
const revealName = /^Reveal /u;
const removeKeywordName = /^Remove /u;

async function clearUprightKeywords() {
  const field = screen
    .getByLabelText("Keywords", { exact: false })
    .closest<HTMLElement>(".tarot-field");
  if (!field) {
    throw new Error("Missing keyword field");
  }
  const [remove] = within(field).queryAllByRole("button", { name: removeKeywordName });
  if (remove) {
    await userEvent.click(remove);
    await clearUprightKeywords();
  }
}
// This database is in Vitest's isolated Chromium profile and test-server origin.
async function deleteTestLibrary() {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
afterEach(async () => {
  await userEvent.cleanup();
  cleanup();
  await deleteTestLibrary();
  await page.viewport(originalViewport.width, originalViewport.height);
  await browserAction(() =>
    cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    })
  );
});

async function setup(viewTransitions = false) {
  await deleteTestLibrary();
  const service = createTarotService();
  await service.initializeLibrary();
  const card = await service.getCard("major-00");
  if (!card) {
    throw new Error("Missing test card");
  }
  const content = structuredClone(card.content);
  content.otherNames = ["The Fool", "The traveler setting out into a world of possibility"];

  content.correspondences.element = ["Air"];
  content.correspondences.planet = ["Uranus", "Mercury"];
  content.correspondences.zodiac = ["Aries", "Leo", "Sagittarius"];
  content.meanings.upright = {
    keywords: ["Beginnings", "Trust", "Curiosity", "Taking a leap into the unknown"],
    notes: "A personal interpretation with room to keep growing.\n".repeat(30),
  };
  await service.saveCard(card.id, content, card.revision);
  service.close();
  const router = createRouter({
    defaultViewTransition: viewTransitions,
    history: createMemoryHistory({ initialEntries: ["/tarot-flash/1"] }),
    isServer: false,
    routeTree,
  });
  await router.load();
  const view = render(<RouterProvider router={router} />);
  await screen.findByRole("button", { name: "Edit" });
  return { router, ...view };
}

test.each(["reduce", "no-preference"] as const)(
  "%s: narrow layout keeps reveals stable and supports native search keyboard entry/exit",
  async (motion) => {
    await page.viewport(390, 700);
    await browserAction(() =>
      cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: motion }],
      })
    );
    const { router, container } = await setup();
    await document.fonts.ready;
    const reveal = screen.getByRole("button", { name: "Reveal element" });
    const mask = screen.getByRole("region", { name: "Element" }).querySelector(".tarot-study-mask");
    if (!mask) {
      throw new Error("Missing element skeleton");
    }
    expect(await screen.findByRole("img")).toBeTruthy();
    expect(getComputedStyle(mask, "::before").animationName).toBe(
      motion === "reduce" ? "none" : "tarot-shimmer"
    );
    if (motion === "no-preference") {
      expect(getComputedStyle(mask, "::before").animationDuration).toBe("28s");
    }
    const items = [...container.querySelectorAll(".tarot-study-item")];
    const before = items.map((item) => item.getBoundingClientRect().toJSON());
    const hints = container.querySelectorAll(".tarot-study-hint");
    expect(hints).toHaveLength(items.length);
    for (const hint of hints) {
      expect(Number(getComputedStyle(hint).opacity)).toBeGreaterThan(0);
      expect(Number(getComputedStyle(hint).opacity)).toBeLessThan(0.35);
    }
    const keyword = container.querySelector(".tarot-keyword");
    if (!keyword) {
      throw new Error("Missing keyword skeleton");
    }
    expect(Number.parseFloat(getComputedStyle(keyword).borderRadius)).toBeGreaterThanOrEqual(
      keyword.getBoundingClientRect().height / 2
    );
    reveal.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Reveal element" })).toBeNull()
    );
    const answer = container.querySelector(".tarot-study-content");
    if (!answer) {
      throw new Error("Missing revealed content");
    }
    expect(getComputedStyle(answer).animationName).toBe(
      motion === "reduce" ? "none" : "tarot-reveal-in"
    );
    await userEvent.click(screen.getByRole("button", { name: "Reveal planet" }));
    await userEvent.click(screen.getByRole("button", { name: "Reveal zodiac" }));
    await userEvent.click(screen.getByRole("button", { name: "Reveal keywords" }));
    await userEvent.click(screen.getByRole("button", { name: "Reveal notes" }));
    // Compare every item and its siblings: width, height, wrapping and downstream positions.
    // Scroll can change after revealing the long notes; document coordinates stay stable.
    expect(items.map((item) => item.getBoundingClientRect().width)).toEqual(
      before.map((rect) => rect.width)
    );
    expect(items.map((item) => item.getBoundingClientRect().height)).toEqual(
      before.map((rect) => rect.height)
    );
    const offsets = items.map(
      (item) => item.getBoundingClientRect().top - items[0].getBoundingClientRect().top
    );
    expect(offsets).toEqual(before.map((rect) => rect.top - before[0].top));
    expect(screen.queryByRole("button", { name: revealName })).toBeNull();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
    const audit = await axe.run(container);
    expect(audit.violations.map((violation) => violation.id)).toEqual([]);
    console.info(
      JSON.stringify({
        incomplete: audit.incomplete.map((entry) => entry.id),
        motion,
        state: "Tarot Flash study",
      })
    );
    await userEvent.click(screen.getByRole("button", { name: "Search cards" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("searchbox", { name: "Search cards" }))
    );
    await userEvent.keyboard("II of swords");
    const clear = screen.getByRole("button", { name: "Clear search" });
    expect(getComputedStyle(clear).color).toBe(
      getComputedStyle(screen.getByRole("searchbox")).color
    );
    expect(container.querySelector("button button, button input")).toBeNull();
    await userEvent.keyboard("{Enter}");
    await screen.findByRole("heading", { level: 1, name: "II Two of Swords" });
    expect(router.state.location.pathname).toBe("/tarot-flash/52");
    await userEvent.click(screen.getByRole("button", { name: "Search cards" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Search cards" }))
    );
  }
);

test("validation focus reaches the upright field after reversal in a reduced viewport", async () => {
  await page.viewport(390, 400);
  const { router } = await setup();
  await browserAction(() =>
    router.navigate({ params: { deckIndex: "2" }, to: "/tarot-flash/$deckIndex" })
  );
  await screen.findByRole("heading", { level: 1, name: "I The Magician" });
  await userEvent.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  await clearUprightKeywords();
  await userEvent.click(screen.getByRole("button", { name: "Reverse card" }));
  await userEvent.click(screen.getByRole("button", { name: "Add an upright keyword to save." }));
  const keywords = screen.getByLabelText("Keywords", { exact: false });
  await waitFor(() => expect(document.activeElement).toBe(keywords));
  const footer = screen.getByRole("button", { name: "Save" }).closest("footer");
  if (!footer) {
    throw new Error("Missing edit footer");
  }
  const fieldRect = keywords.getBoundingClientRect();
  expect(fieldRect.bottom).toBeLessThanOrEqual(footer.getBoundingClientRect().top + 1);
  const save = screen.getByRole("button", { name: "Save" }).getBoundingClientRect();
  expect(save.bottom).toBeLessThanOrEqual(innerHeight);
  expect(save.top).toBeGreaterThan(0);
});

test.each(["reduce", "no-preference"] as const)(
  "%s: search moves the same button and unfolds ranks without moving its filter anchor",
  async (motion) => {
    await page.viewport(390, 700);
    await browserAction(() =>
      cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: motion }],
      })
    );
    await setup();
    const trigger = screen.getByRole("button", { name: "Search cards" });
    const start = trigger.getBoundingClientRect();
    const shuffle = screen.getByRole("button", { name: "Shuffle" }).getBoundingClientRect();
    await userEvent.click(trigger);
    expect(screen.getByRole("button", { name: "Open suggested card" })).toBe(trigger);
    await waitFor(() => {
      const end = trigger.getBoundingClientRect();
      expect(end.left).toBeCloseTo(shuffle.left, 0);
      expect(end.bottom).toBeCloseTo(start.bottom, 0);
    });
    const cups = screen.getByRole("button", { name: "Cups" });
    await waitFor(() =>
      expect(cups.closest<HTMLElement>(".tarot-search-reveal")?.style.height).toBe("auto")
    );
    const anchor = cups.getBoundingClientRect();
    await userEvent.click(cups);
    await screen.findByRole("button", { name: "Two of Cups" });
    await userEvent.click(screen.getByRole("button", { name: "Swords" }));
    expect(screen.queryByRole("button", { name: "Two of Cups" })).toBeNull();
    await waitFor(() => expect(cups.getBoundingClientRect().top).toBeCloseTo(anchor.top, 0));
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(trigger);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("searchbox")));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
      expect(trigger.getBoundingClientRect().left).toBeCloseTo(start.left, 0);
    });
  }
);

test("shuffling keeps a visible footer layer throughout the native page transition", async () => {
  await browserAction(() =>
    cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
    })
  );
  await setup(true);
  const shuffle = screen.getByRole("button", { name: "Shuffle" });
  const footer = shuffle.closest("footer");
  if (!footer) {
    throw new Error("Missing study footer");
  }
  const before = footer.getBoundingClientRect();
  await userEvent.click(shuffle);
  await waitFor(() =>
    expect(document.documentElement.matches(":active-view-transition")).toBe(true)
  );
  expect(screen.getByRole("button", { name: "Shuffle" })).toBe(shuffle);
  expect(getComputedStyle(footer).viewTransitionName).toBe("tarot-controls");
  const snapshot = getComputedStyle(
    document.documentElement,
    "::view-transition-new(tarot-controls)"
  );
  expect(snapshot.animationName).toBe("none");
  expect(snapshot.opacity).toBe("1");
  expect(footer.getBoundingClientRect().top).toBeCloseTo(before.top, 0);
  await waitFor(
    () => expect(document.documentElement.matches(":active-view-transition")).toBe(false),
    {
      timeout: 4000,
    }
  );
});
