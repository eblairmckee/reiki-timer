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
    const labels = container.querySelectorAll(".tarot-study-label");
    expect(labels).toHaveLength(5);
    expect(container.querySelector(".tarot-study-mask svg")).toBeNull();
    for (const label of labels) {
      expect(Number(getComputedStyle(label).opacity)).toBe(1);
      const answer = label.nextElementSibling;
      if (!answer) {
        throw new Error("Missing field answer beside its label");
      }
      expect(label.getBoundingClientRect().right).toBeLessThan(answer.getBoundingClientRect().left);
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
    await waitFor(() => expect(Number(getComputedStyle(answer).opacity)).toBe(1));
    await waitFor(() => expect(Number(getComputedStyle(labels[0]).opacity)).toBe(0));
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
    const searchInput = screen.getByRole("searchbox", { name: "Search cards" });
    const searchButton = screen.getByRole("button", { name: "Open suggested card" });
    expect(searchInput.getBoundingClientRect().height).toBe(
      searchButton.getBoundingClientRect().height
    );
    expect(searchInput.getBoundingClientRect().top).toBeCloseTo(
      searchButton.getBoundingClientRect().top,
      0
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
  await page.viewport(320, 400);
  const { router } = await setup();
  await browserAction(() =>
    router.navigate({ params: { deckIndex: "2" }, to: "/tarot-flash/$deckIndex" })
  );
  await screen.findByRole("heading", { level: 1, name: "I The Magician" });
  const studyActionBounds = screen
    .getByRole("group", { name: "Card actions" })
    .getBoundingClientRect()
    .toJSON();
  await userEvent.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  const notes = screen.getByRole("textbox", { name: "Notes" });
  const saveHeight = screen.getByRole("button", { name: "Save" }).getBoundingClientRect().height;
  expect(notes.getBoundingClientRect().height).toBe(saveHeight);
  await userEvent.click(notes);
  await userEvent.keyboard("One{Enter}Two{Enter}Three{Enter}Four{Enter}Five");
  expect(notes.getBoundingClientRect().height).toBeGreaterThan(saveHeight);
  const editFooter = screen.getByRole("button", { name: "Save" }).closest("footer");
  if (!editFooter) {
    throw new Error("Missing edit footer");
  }
  expect(notes.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    editFooter.getBoundingClientRect().top
  );
  await clearUprightKeywords();
  expect(
    screen.getByRole("group", { name: "Edit card actions" }).getBoundingClientRect().toJSON()
  ).toEqual(studyActionBounds);
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
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reverse card" })).toBeNull();
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
    const actions = screen.getByRole("group", { name: "Card actions" });
    const actionButtons = within(actions).getAllByRole("button");
    expect(actionButtons).toHaveLength(3);
    expect(actions.getBoundingClientRect().left).toBeGreaterThan(
      trigger.getBoundingClientRect().right
    );
    expect(actions.getBoundingClientRect().right).toBeLessThanOrEqual(innerWidth);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit" }));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Reverse card" }));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Shuffle" }));
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

// Observe every animation frame rather than only the settled before/after layouts.
async function expectStableModeExit(trigger: HTMLElement, ordinaryMotion: boolean) {
  const scene = trigger.closest<HTMLElement>(".tarot-mode");
  if (!scene) {
    throw new Error("Missing mode scene");
  }
  await waitFor(() => expect(Number(getComputedStyle(scene).opacity)).toBe(1), { timeout: 3000 });
  const parts = [
    ...scene.querySelectorAll(
      ".tarot-screen, .tarot-header, .tarot-body, .tarot-fields, .tarot-footer"
    ),
  ];
  const before = parts.map((part) => part.getBoundingClientRect().toJSON());
  const frames: { opacity: number; rects: DOMRect[] }[] = [];
  const finished = new Promise<void>((resolve) => {
    function sample() {
      if (!scene?.isConnected) {
        resolve();
        return;
      }
      frames.push({
        opacity: Number(getComputedStyle(scene).opacity),
        rects: parts.map((part) => part.getBoundingClientRect().toJSON()),
      });
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await userEvent.click(trigger);
  await finished;
  for (const frame of frames) {
    expect(frame.rects).toEqual(before);
  }
  if (ordinaryMotion) {
    expect(frames.some((frame) => frame.opacity > 0 && frame.opacity < 0.05)).toBe(true);
  }
}

test.each(["reduce", "no-preference"] as const)(
  "%s: edit and view retain the entire outgoing layout with grouped actions and scrolled notes",
  async (motionPreference) => {
    await page.viewport(1280, 800);
    await browserAction(() =>
      cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: motionPreference }],
      })
    );
    const { container } = await setup();
    await document.fonts.ready;
    const studyActions = screen.getByRole("group", { name: "Card actions" });
    const studyActionBounds = studyActions.getBoundingClientRect().toJSON();
    const shuffleBounds = screen
      .getByRole("button", { name: "Shuffle" })
      .getBoundingClientRect()
      .toJSON();
    await expectStableModeExit(
      screen.getByRole("button", { name: "Edit" }),
      motionPreference === "no-preference"
    );
    const names = await screen.findByRole("combobox", { name: "Other names" });
    await waitFor(() => expect(document.activeElement).toBe(names));
    expect(
      screen.getByRole("group", { name: "Edit card actions" }).getBoundingClientRect().toJSON()
    ).toEqual(studyActionBounds);
    expect(screen.getByRole("button", { name: "Save" }).getBoundingClientRect().toJSON()).toEqual(
      shuffleBounds
    );
    const editSize = screen
      .getByRole("button", { name: "Close editor" })
      .getBoundingClientRect().height;
    const selects = container.querySelectorAll('[data-ui="select-trigger"]');
    for (const select of selects) {
      const box = select.getBoundingClientRect();
      const icon = select.querySelector('[data-ui="select-icon"] svg')?.getBoundingClientRect();
      expect(box.height).toBe(editSize);
      if (!icon) {
        throw new Error("Missing select caret");
      }
      expect(icon.top + icon.height / 2).toBeCloseTo(box.top + box.height / 2, 1);
    }
    const notes = screen.getByRole("textbox", { name: "Notes" });
    expect(notes.getBoundingClientRect().height).toBeGreaterThan(editSize);
    notes.scrollIntoView({ block: "end" });
    await expectStableModeExit(
      screen.getByRole("button", { name: "Close editor" }),
      motionPreference === "no-preference"
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit" }))
    );
    expect(screen.getByRole("button", { name: "Search cards" })).toBeTruthy();
  }
);
