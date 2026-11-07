import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { Choicebox } from "@/components/molecules/choicebox";
import { SummaryList } from "@/components/molecules/summary-list";
import { Timeline } from "@/components/molecules/timeline";
import { browserAction, userEvent } from "./react-browser";
import "@/components/design-system/styles/index.css";

const originalViewport = { height: innerHeight, width: innerWidth };
afterEach(async () => {
  await userEvent.cleanup();
  cleanup();
  await page.viewport(originalViewport.width, originalViewport.height);
});

test("unrelated shared compositions preserve native activation, naming and keyboard scrolling", async () => {
  await page.viewport(390, 700);
  const onActivate = vi.fn();
  render(
    <>
      <button type="button">Before brushes</button>
      <Choicebox
        label="Brush presets"
        onActivate={onActivate}
        options={[
          { content: <span aria-hidden="true">S</span>, id: "", name: "Soft brush" },
          { content: <span aria-hidden="true">I</span>, id: "ink", name: "Ink brush" },
        ]}
        value=""
      />
      <Timeline
        heading="Travel itinerary"
        items={Array.from({ length: 30 }, (_, index) => ({
          content: `Destination ${index + 1}`,
          key: index,
          leading: `Day ${index + 1}`,
        }))}
      />
      <SummaryList items={[{ content: "30 destinations", key: "count" }]} label="Trip summary" />
      <button type="button">After itinerary</button>
    </>
  );
  await userEvent.click(screen.getByRole("button", { name: "Before brushes" }));
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Soft brush" }));
  await userEvent.keyboard("{Enter}{Enter}");
  await userEvent.tab();
  await userEvent.keyboard(" ");
  expect(onActivate.mock.calls).toEqual([[""], [""], ["ink"]]);
  expect(screen.getByRole("button", { name: "Soft brush" }).getAttribute("aria-pressed")).toBe(
    "true"
  );
  await userEvent.tab();
  const list = screen.getByRole("list", { name: "Travel itinerary" });
  expect(document.activeElement).toBe(list);
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  // Native scroll targeting settles after focus/layout is painted, beyond the React flush.
  await browserAction(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
  await userEvent.keyboard("{PageDown}");
  await waitFor(() => expect(list.scrollTop).toBeGreaterThan(0));
  expect(screen.getByRole("list", { name: "Trip summary" }).textContent).toBe("30 destinations");
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "After itinerary" }));
});
