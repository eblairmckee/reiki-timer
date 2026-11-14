import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { createSeed, emptyContent } from "../data/seed";
import type { LibraryCard, SaveResult, TarotService } from "../model/types";
import { normalizeContent, validateDraft } from "../model/validation";
import { createTarotService } from "../services/library-storage";

vi.mock("../services/library-storage", async (original) => ({
  ...(await original<typeof import("../services/library-storage")>()),
  createTarotService: vi.fn(),
}));
const keywordLabel = /^Keywords/u;
const notesLabel = /^Notes/u;
const seed = createSeed("test-library", "test-owner", "2026-11-13T00:00:00.000Z");
let records: LibraryCard[];
let service: TarotService;
beforeEach(() => {
  records = structuredClone(seed.cards);
  // Existing editing/validation journeys exercise deliberately blank user meanings.
  for (const card of records) {
    card.content.meanings = emptyContent().meanings;
  }
  sessionStorage.clear();
  service = {
    close: vi.fn(),
    getCard: vi.fn(async (id) =>
      structuredClone(records.find((card) => card.catalogCardId === id) ?? null)
    ),
    getLibrary: vi.fn(async () => seed.library),
    initializeLibrary: vi.fn(async () => seed.library),
    listCards: vi.fn(async () => structuredClone(records)),
    saveCard: vi.fn(async (id, content, revision): Promise<SaveResult> => {
      await Promise.resolve();
      const current = records.find((card) => card.id === id);
      if (!current) {
        return { kind: "missing" };
      }
      if (current.revision !== revision) {
        return { current: structuredClone(current), kind: "conflict" };
      }
      const errors = validateDraft(content);
      if (errors.length) {
        return { errors, kind: "validation" };
      }
      const saved = {
        ...current,
        content: normalizeContent(content),
        revision: crypto.randomUUID(),
      };
      records = records.map((card) => (card.id === id ? saved : card));
      return { card: saved, kind: "saved" };
    }),
  };
  vi.mocked(createTarotService).mockImplementation(() => service);
});
async function setup(path = "/tarot-flash/1") {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [path] }),
    isServer: false,
    routeTree,
  });
  await router.load();
  const view = render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
  await screen.findByRole("button", { name: "Edit" });
  return { router, user: userEvent.setup({ document }), ...view };
}
function visits() {
  return JSON.parse(sessionStorage.getItem(`tarot-flash:visited:v1:${seed.library.id}`) ?? "[]");
}

test("default upright and reversed keywords reveal separately and are editable", async () => {
  records = structuredClone(seed.cards);
  const { user } = await setup();
  const original = structuredClone(records[0].content.meanings);
  expect(screen.queryByText(original.upright.keywords[0])).toBeTruthy();
  const region = screen.getByRole("region", { name: "Keywords" });
  expect(
    within(region).queryByText(original.upright.keywords[0])?.closest("[aria-hidden='true']")
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Reveal keywords" }));
  expect(
    within(region).getByText(original.upright.keywords[0]).closest("[aria-hidden='true']")
  ).toBeNull();
  await user.click(screen.getByRole("button", { name: "Reverse card" }));
  await user.click(screen.getByRole("button", { name: "Reveal keywords" }));
  expect(within(region).getByText(original.reversed?.keywords[0] ?? "")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: keywordLabel }, { timeout: 4000 });
  await user.type(screen.getByRole("combobox", { name: keywordLabel }), "my interpretation{Enter}");
  await user.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("button", { name: "Edit" });
  expect(records[0].content.meanings.reversed?.keywords).toContain("my interpretation");
  expect(records[0].content.meanings.upright).toEqual(original.upright);
});

test("fixed correspondences and personal keyword chips save through the shared draft", async () => {
  // Records saved before Planet was introduced must still open and edit.
  records[0].content.correspondences = { element: [], zodiac: [] };
  records[1].content.meanings.upright.keywords = ["insight"];
  const { user, container } = await setup();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  await user.click(screen.getByLabelText("Element", { exact: true }));
  await user.click(await screen.findByRole("option", { name: "Air" }));
  await user.click(screen.getByRole("option", { name: "Fire" }));
  await user.keyboard("{Escape}");
  await user.click(screen.getByLabelText("Zodiac", { exact: true }));
  await user.click(await screen.findByRole("option", { name: "Aries" }));
  await user.keyboard("{Escape}");
  await user.click(screen.getByLabelText("Planet", { exact: true }));
  await user.click(await screen.findByRole("option", { name: "Sun" }));
  await user.click(screen.getByRole("option", { name: "Moon" }));
  await user.keyboard("{Escape}");
  const keywords = screen.getByRole("combobox", { name: keywordLabel });
  await user.type(keywords, "ins{Enter}intuition{Enter}");
  await user.click(screen.getByRole("button", { name: "Remove insight" }));
  await user.click(screen.getByRole("button", { name: "Remove intuition" }));
  expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  await user.click(keywords);
  await user.paste("intuition");
  await user.keyboard("{Enter}");
  expect(container.querySelector("button button, button input")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("button", { name: "Edit" });
  await screen.findByRole("button", { name: "Search cards" }, { timeout: 4000 });
  expect(records[0].content.correspondences).toEqual({
    element: ["Air", "Fire"],
    planet: ["Sun", "Moon"],
    zodiac: ["Aries"],
  });
  await user.click(await screen.findByRole("button", { name: "Reveal planet" }, { timeout: 4000 }));
  expect(within(screen.getByRole("region", { name: "Planet" })).getByText("Sun")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Reverse card" }));
  expect(screen.queryByRole("button", { name: "Reveal planet" })).toBeNull();
  expect(records[0].content.meanings.upright.keywords).toEqual(["intuition"]);
});

test("search stays open for its controls and dismisses on outside pointer or focus", async () => {
  const { user } = await setup();
  await user.click(screen.getByRole("button", { name: "Search cards" }));
  await user.click(screen.getByRole("button", { name: "Cups" }));
  expect(screen.getByRole("searchbox", { name: "Search cards" })).toBeTruthy();
  await user.type(screen.getByRole("searchbox", { name: "Search cards" }), "two");
  await user.click(screen.getByRole("button", { name: "Clear search" }));
  expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
  expect(document.activeElement).toBe(screen.getByRole("searchbox"));
  expect(screen.getByRole("button", { name: "Cups" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.queryByRole("button", { name: "Close search" })).toBeNull();
  await user.click(screen.getByRole("heading", { level: 1 }));
  expect(screen.queryByRole("searchbox")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Search cards" }));
  await user.tab();
  await user.tab();
  await waitFor(() => expect(screen.queryByRole("searchbox")).toBeNull());
});

test("seeded correspondences reveal while blank meanings still require an upright keyword", async () => {
  const { user } = await setup();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByRole("button", { name: "Reveal planet" })).toBeTruthy();
  expect(screen.queryByRole("region", { name: "Zodiac" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Reveal planet" }));
  expect(within(screen.getByRole("region", { name: "Planet" })).getByText("Uranus")).toBeTruthy();
  expect(await screen.findByRole("img")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Reveal symbology & imagery" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  expect(screen.getByRole("button", { name: "Save" }).hasAttribute("disabled")).toBe(true);
  await user.click(screen.getByRole("button", { name: "Reverse card" }));
  expect((screen.getByLabelText("Other names", { exact: true }) as HTMLInputElement).disabled).toBe(
    true
  );
  await user.type(screen.getByRole("textbox", { name: notesLabel }), "Proceed with care");
  await user.click(screen.getByRole("button", { name: "Add an upright keyword to save." }));
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByLabelText("Keywords", { exact: false }))
  );
  await user.type(
    screen.getByLabelText("Keywords", { exact: false }),
    "beginnings{Enter}curiosity{Enter}"
  );
  await user.click(screen.getByRole("button", { name: "Reverse card" }));
  expect((screen.getByRole("textbox", { name: notesLabel }) as HTMLTextAreaElement).value).toBe(
    "Proceed with care"
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("button", { name: "Edit" });
  await screen.findByRole("button", { name: "Search cards" }, { timeout: 4000 });
  expect(records[0].content.meanings.reversed).toEqual({
    keywords: [],
    notes: "Proceed with care",
  });
  expect(records[0].content.meanings.upright.keywords).toEqual(["beginnings", "curiosity"]);
  expect(screen.getByRole("button", { name: "Reverse card" }).getAttribute("aria-pressed")).toBe(
    "true"
  );
  expect(
    await screen.findByRole("button", { name: "Reveal notes" }, { timeout: 4000 })
  ).toBeTruthy();
  expect(visits()).toEqual(["major-00"]);
});

test("reversing preserves shared reveals and conceals orientation meanings each time", async () => {
  records[0].content.correspondences.element = ["Air"];
  records[0].content.meanings.upright.keywords = ["Beginnings"];
  records[0].content.meanings.reversed = { keywords: ["Hesitation"], notes: "" };
  const { user } = await setup();
  await user.click(screen.getByRole("button", { name: "Reveal element" }));
  await user.click(screen.getByRole("button", { name: "Reveal keywords" }));
  await user.click(screen.getByRole("button", { name: "Reverse card" }));
  expect(screen.queryByRole("button", { name: "Reveal element" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Reveal symbology & imagery" })).toBeNull();
  expect(screen.getByRole("button", { name: "Reveal keywords" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Reveal keywords" }));
  await user.click(screen.getByRole("button", { name: "Reverse card" }));
  expect(screen.getByRole("button", { name: "Reveal keywords" })).toBeTruthy();
});

test("search dismissal preserves visits; quick selection resets them; history reopens upright", async () => {
  const { user, router } = await setup();
  await user.click(screen.getByRole("button", { name: "Shuffle" }));
  await waitFor(() => expect(visits()).toHaveLength(2));
  await screen.findByRole("button", { name: "Search cards" });
  await user.click(screen.getByRole("button", { name: "Search cards" }));
  await user.type(screen.getByRole("searchbox", { name: "Search cards" }), "swords{Enter}");
  expect(screen.getByRole("button", { name: "Open suggested card" }).hasAttribute("disabled")).toBe(
    true
  );
  expect(visits()).toHaveLength(2);
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Search cards" }))
  );
  expect(visits()).toHaveLength(2);
  await user.click(screen.getByRole("button", { name: "Search cards" }));
  await user.click(screen.getByRole("button", { name: "Cups" }));
  await user.click(screen.getByRole("button", { name: "Two of Cups" }));
  await waitFor(() => expect(router.state.location.pathname).toBe("/tarot-flash/38"));
  await screen.findByRole("heading", { level: 1, name: "II Two of Cups" });
  expect(visits()).toEqual(["cups-02"]);
  await user.click(screen.getByRole("button", { name: "Reverse card" }));
  await act(async () => router.history.back());
  await screen.findByRole("button", { name: "Edit" });
  expect(screen.getByRole("button", { name: "Reverse card" }).getAttribute("aria-pressed")).toBe(
    "false"
  );
  await act(async () => router.history.forward());
  await screen.findByRole("heading", { level: 1, name: "II Two of Cups" });
  expect(screen.getByRole("button", { name: "Reverse card" }).getAttribute("aria-pressed")).toBe(
    "false"
  );
});

test("cancel and navigation confirmations retain the draft when staying", async () => {
  const { user, router } = await setup();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  await user.type(screen.getByLabelText("Keywords", { exact: false }), "curiosity{Enter}");
  await user.click(screen.getByRole("button", { name: "Close editor" }));
  await screen.findByRole("dialog");
  await user.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(screen.getByRole("button", { name: "Remove curiosity" })).toBeTruthy();
  await act(async () => {
    router.navigate({ params: { deckIndex: "2" }, to: "/tarot-flash/$deckIndex" });
    await Promise.resolve();
  });
  await screen.findByRole("dialog");
  await user.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(router.state.location.pathname).toBe("/tarot-flash/1");
  await user.click(screen.getByRole("button", { name: "Close editor" }));
  await user.click(screen.getByRole("button", { name: "Discard changes" }));
  await screen.findByRole("button", { name: "Edit" });
  await screen.findByRole("button", { name: "Search cards" }, { timeout: 4000 });
  expect(records[0].content.meanings.upright.keywords).toEqual([]);
});

test("storage failures preserve the full draft and retry saves it", async () => {
  const { user } = await setup();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  await user.type(screen.getByLabelText("Keywords", { exact: false }), "start{Enter}");
  vi.mocked(service.saveCard).mockResolvedValueOnce({
    kind: "storage",
    message: "Storage is full. Your draft is safe.",
  });
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Storage is full");
  expect(screen.getByRole("button", { name: "Remove start" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("button", { name: "Edit" });
  await screen.findByRole("button", { name: "Search cards" }, { timeout: 4000 });
  expect(records[0].content.meanings.upright.keywords).toEqual(["start"]);
});

test("pending saves reject duplicate activation and obsolete results cannot update another card", async () => {
  const { user, unmount } = await setup();
  let complete: (result: SaveResult) => void = () => {
    throw new Error("Save has not started");
  };
  const pendingSave = new Promise<SaveResult>((resolve) => {
    complete = resolve;
  });
  vi.mocked(service.saveCard).mockReturnValueOnce(pendingSave);
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  await user.type(screen.getByLabelText("Keywords", { exact: false }), "pending draft{Enter}");
  await user.dblClick(screen.getByRole("button", { name: "Save" }));
  expect(service.saveCard).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Saving…" }).hasAttribute("disabled")).toBe(true);
  unmount();
  await setup("/tarot-flash/2");
  await act(async () => {
    complete({
      card: {
        ...records[0],
        content: { ...records[0].content, otherNames: ["Obsolete card result"] },
        revision: "late",
      },
      kind: "saved",
    });
    await pendingSave;
  });
  expect(screen.getByRole("heading", { level: 1, name: "I The Magician" })).toBeTruthy();
  expect(screen.queryByText("Obsolete card result")).toBeNull();
});

test("invalid card paths have an explicit recovery route", async () => {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/tarot-flash/79"] }),
    isServer: false,
    routeTree,
  });
  await router.load();
  render(<RouterProvider router={router} />);
  expect(await screen.findByRole("heading", { name: "Card not found" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Open a random card" }).getAttribute("href")).toBe(
    "/tarot-flash"
  );
});

test("stale saves do not overwrite newer content and explicit replacement uses the reviewed revision", async () => {
  const { user } = await setup();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  await user.type(screen.getByLabelText("Keywords", { exact: false }), "my draft{Enter}");
  records[0] = {
    ...records[0],
    content: {
      ...records[0].content,
      meanings: {
        reversed: null,
        upright: { keywords: ["newer meaning"], notes: "From another tab" },
      },
    },
    revision: "newer",
  };
  await user.click(screen.getByRole("button", { name: "Save" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText("newer meaning")).toBeTruthy();
  expect(within(dialog).getByText("my draft")).toBeTruthy();
  expect(records[0].revision).toBe("newer");
  await user.click(within(dialog).getByRole("button", { name: "Replace with my draft" }));
  await screen.findByRole("button", { name: "Edit" });
  await screen.findByRole("button", { name: "Search cards" }, { timeout: 4000 });
  expect(records[0].content.meanings.upright.keywords).toEqual(["my draft"]);
  expect(vi.mocked(service.saveCard).mock.calls.at(-1)?.[2]).toBe("newer");
});

test("other names and comma-delimited keywords save without changing the fixed title", async () => {
  const { user } = await setup();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  const aliases = await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  expect(screen.queryByRole("img")).toBeNull();
  expect(screen.queryByLabelText("Imagery notes")).toBeNull();
  expect(screen.queryByText("Optional")).toBeNull();
  await user.type(aliases, "The Traveler,The Wanderer,,");
  await user.paste("The Seeker, the traveler,   ,The Pilgrim");
  expect((aliases as HTMLInputElement).value).toBe("");
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Remove The Traveler" })).toBeTruthy();
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("0The Fool");
  await user.type(screen.getByRole("combobox", { name: keywordLabel }), "start,curiosity,");
  expect(screen.getByRole("button", { name: "Remove The Traveler" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Save" }));
  await screen.findByRole("button", { name: "Edit" });
  expect(records[0].content.otherNames).toEqual([
    "The Traveler",
    "The Wanderer",
    "The Seeker",
    "The Pilgrim",
  ]);
  expect(records[0].content.meanings.upright.keywords).toEqual(["start", "curiosity"]);
  expect(screen.getByRole("heading", { level: 1, name: "0 The Fool" })).toBeTruthy();
  expect(screen.getByText("The Traveler, The Wanderer, The Seeker, The Pilgrim")).toBeTruthy();
});

test("search keeps its button identity and can reopen while its rows are closing", async () => {
  const { user } = await setup();
  const trigger = screen.getByRole("button", { name: "Search cards" });
  await user.click(trigger);
  expect(screen.getByRole("button", { name: "Open suggested card" })).toBe(trigger);
  await user.click(screen.getByRole("button", { name: "Cups" }));
  await user.click(screen.getByRole("button", { name: "Swords" }));
  expect(screen.queryByRole("button", { name: "Two of Cups" })).toBeNull();
  expect(screen.getByRole("button", { name: "Two of Swords" })).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(screen.queryByRole("button", { name: "Two of Swords" })).toBeNull();
  await user.click(trigger);
  const input = screen.getByRole("searchbox", { name: "Search cards" });
  await waitFor(() => expect(document.activeElement).toBe(input));
  await user.type(input, "two of cups");
  expect(screen.getByRole("button", { name: "Open suggested card" })).toBe(trigger);
  await user.keyboard("{Escape}");
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

test("the footer survives shuffling and a late card load cannot interrupt a newer search", async () => {
  const { user, router } = await setup();
  const shuffle = screen.getByRole("button", { name: "Shuffle" });
  const footer = shuffle.closest("footer");
  let finish: (card: LibraryCard) => void = () => {
    throw new Error("Card load has not started");
  };
  const delayed = new Promise<LibraryCard>((resolve) => {
    finish = resolve;
  });
  vi.mocked(service.getCard).mockReturnValueOnce(delayed);
  await user.click(shuffle);
  await screen.findByText("Opening your card…");
  expect(screen.getByRole("button", { name: "Shuffle" })).toBe(shuffle);
  expect(shuffle.closest("footer")).toBe(footer);
  await user.click(screen.getByRole("button", { name: "Search cards" }));
  const input = screen.getByRole("searchbox", { name: "Search cards" });
  await user.type(input, "two of cups");
  await act(async () => {
    await router.navigate({ params: { deckIndex: "3" }, to: "/tarot-flash/$deckIndex" });
  });
  await screen.findByRole("heading", { level: 1, name: "II The High Priestess" });
  expect(document.activeElement).toBe(input);
  expect((input as HTMLInputElement).value).toBe("two of cups");
  await act(async () => {
    finish(records[1]);
    await delayed;
  });
  expect(screen.getByRole("heading", { level: 1, name: "II The High Priestess" })).toBeTruthy();
  expect(screen.getByRole("searchbox")).toBe(input);
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Shuffle" })).toBe(shuffle);
});

test("a failed card load keeps the footer available and retry opens the requested card", async () => {
  const { user, router } = await setup();
  const shuffle = screen.getByRole("button", { name: "Shuffle" });
  vi.mocked(service.getCard).mockRejectedValueOnce(new Error("Storage unavailable"));
  await act(async () => {
    await router.navigate({ params: { deckIndex: "2" }, to: "/tarot-flash/$deckIndex" });
  });
  await screen.findByRole("heading", { name: "Couldn’t open this card" });
  expect(screen.getByRole("button", { name: "Shuffle" })).toBe(shuffle);
  await user.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByRole("heading", { level: 1, name: "I The Magician" });
  expect(screen.getByRole("button", { name: "Shuffle" })).toBe(shuffle);
  expect(screen.queryByRole("alert")).toBeNull();
});

test("discarding before navigation releases the draft even if the next card fails to load", async () => {
  const { user, router } = await setup();
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await screen.findByRole("combobox", { name: "Other names" }, { timeout: 4000 });
  await user.type(screen.getByRole("combobox", { name: keywordLabel }), "draft,");
  vi.mocked(service.getCard).mockRejectedValueOnce(new Error("Storage unavailable"));
  await act(async () => {
    router.navigate({ params: { deckIndex: "3" }, to: "/tarot-flash/$deckIndex" });
    await Promise.resolve();
  });
  await screen.findByRole("dialog");
  await user.click(screen.getByRole("button", { name: "Discard changes" }));
  await screen.findByRole("heading", { name: "Couldn’t open this card" });
  await user.click(await screen.findByRole("button", { name: "Search cards" }, { timeout: 4000 }));
  await user.type(screen.getByRole("searchbox"), "Magician{Enter}");
  await screen.findByRole("heading", { level: 1, name: "I The Magician" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(records[0].content.meanings.upright.keywords).toEqual([]);
});
