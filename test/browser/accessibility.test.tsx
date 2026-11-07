import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, expect, test, vi } from "vitest";
import { userEvent as browserUser } from "vitest/browser";
import { Button } from "../../src/components/design-system/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/design-system/dialog";
import { ChimePlayer } from "../../src/features/timer/chimes";
import { routeTree } from "../../src/routeTree.gen";
import "../../src/index.css";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

async function setup() {
  vi.spyOn(ChimePlayer.prototype, "prepare").mockResolvedValue(undefined);
  vi.spyOn(ChimePlayer.prototype, "play").mockResolvedValue(undefined);
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    isServer: false,
    routeTree,
  });
  await router.load();
  const view = render(<RouterProvider router={router} />);
  await screen.findByRole("slider", { name: "Healing time" });
  return view;
}

async function audit(container: HTMLElement, state: string) {
  const result = await axe.run(container);
  // Incomplete results need assessment. The theme suite models contrast bounds
  // and sampled mixtures; it does not measure every rendered translucent/shader pixel.
  console.info(
    JSON.stringify({
      incomplete: result.incomplete.map(({ id, nodes }) => ({
        id,
        nodes: nodes.map(({ target, failureSummary }) => ({ failureSummary, target })),
      })),
      state,
      violations: result.violations,
    })
  );
  expect(
    result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))
  ).toEqual([]);
}

test("setup, six chime choices and expanded timeline have accessible Chromium rendering", async () => {
  const { container } = await setup();
  const user = userEvent.setup({ document });
  await audit(container, "setup");
  await user.click(screen.getByRole("switch", { name: "Chimes" }));
  expect(screen.getByRole("group", { name: "Tone" }).querySelectorAll("button")).toHaveLength(6);
  await audit(container, "chime choices");
  const overview = screen.getByRole("group", { name: "Timer overview" });
  await user.hover(overview);
  await screen.findByRole("list", { name: "Session timeline" });
  await audit(container, "timeline");
});

test("a modal contains Tab focus and returns focus after Escape and close activation", async () => {
  render(
    <Dialog>
      <DialogTrigger render={<Button />}>Archive document</DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogTitle>Archive this document?</DialogTitle>
          <DialogDescription>The document stays available in the archive.</DialogDescription>
          <DialogClose render={<Button />}>Keep editing</DialogClose>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
  const trigger = screen.getByRole("button", { name: "Archive document" });
  trigger.focus();
  await browserUser.keyboard("{Enter}");
  const modal = await screen.findByRole("dialog", { name: "Archive this document?" });
  expect(modal.getAttribute("aria-describedby")).toBe(
    screen.getByText("The document stays available in the archive.").id
  );
  const close = screen.getByRole("button", { name: "Keep editing" });
  await waitFor(() => expect(document.activeElement).toBe(close));
  await browserUser.tab();
  await waitFor(() => expect(document.activeElement).toBe(close));
  await browserUser.tab({ shift: true });
  await waitFor(() => expect(document.activeElement).toBe(close));
  await browserUser.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(trigger);
  await browserUser.keyboard("{Enter}");
  await screen.findByRole("dialog", { name: "Archive this document?" });
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Keep editing" }))
  );
  await browserUser.keyboard("{Enter}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(trigger);
});
