import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, expect, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import { SoundPlayer } from "@/utils/audio/sound-player";
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
import { routeTree } from "../../src/routeTree.gen";
import { browserAction, userEvent as browserUser } from "./react-browser";
import "@/app/styles/global.css";

afterEach(async () => {
  await browserUser.cleanup();
  await mediaPreferences();
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

async function setup() {
  vi.spyOn(SoundPlayer.prototype, "prepare").mockResolvedValue(undefined);
  vi.spyOn(SoundPlayer.prototype, "play").mockResolvedValue(undefined);
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

async function mediaPreferences(
  forcedColors: "active" | "none" = "none",
  reducedTransparency: "reduce" | "no-preference" = "no-preference"
) {
  await browserAction(() =>
    cdp().send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "forced-colors", value: forcedColors },
        { name: "prefers-reduced-transparency", value: reducedTransparency },
      ],
    })
  );
  await waitFor(() => {
    expect(matchMedia("(forced-colors: active)").matches).toBe(forcedColors === "active");
    expect(matchMedia("(prefers-reduced-transparency: reduce)").matches).toBe(
      reducedTransparency === "reduce"
    );
  });
}

async function openFinishDialog() {
  await browserUser.click(await screen.findByRole("button", { name: "Start timer" }));
  await browserUser.click(await screen.findByRole("button", { name: "Pause timer" }));
  const finish = await screen.findByRole("button", { name: "Finish timer" });
  finish.focus();
  await browserUser.keyboard("{Enter}");
  const modal = await screen.findByRole("dialog", { name: "Reiki off" });
  await waitFor(() =>
    expect(document.activeElement).toBe(within(modal).getByRole("heading", { name: "Reiki off" }))
  );
  return { finish, modal };
}

test("the product finish dialog reports a failed save, returns focus on Escape, and saves with named confirmation", async () => {
  const { container } = await setup();
  const { finish, modal } = await openFinishDialog();
  await audit(modal, "finish dialog");
  await browserUser.tab();
  const save = within(modal).getByRole("button", { name: "save this timer" });
  expect(document.activeElement).toBe(save);
  expect(getComputedStyle(save).color).toBe(getComputedStyle(modal).color);
  expect(getComputedStyle(within(modal).getByRole("link", { name: "make changes" })).color).toBe(
    getComputedStyle(modal).color
  );
  const storageWrite = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
    throw new Error("Storage unavailable");
  });
  await browserUser.keyboard("{Enter}");
  const alert = await within(modal).findByRole("alert");
  expect(alert.textContent).toContain("Try again");
  expect(document.activeElement).toBe(save);
  storageWrite.mockRestore();
  await audit(modal, "finish save error");
  await browserUser.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(finish);
  await browserUser.keyboard("{Enter}");
  const reopened = await screen.findByRole("dialog", { name: "Reiki off" });
  await waitFor(() =>
    expect(document.activeElement).toBe(
      within(reopened).getByRole("heading", { name: "Reiki off" })
    )
  );
  await browserUser.tab();
  expect(document.activeElement).toBe(
    within(reopened).getByRole("button", { name: "save this timer" })
  );
  await browserUser.keyboard("{Enter}");
  const confirmation = await screen.findByRole("heading", { name: "Timer saved" });
  await waitFor(() => expect(document.activeElement).toBe(confirmation));
  expect(screen.queryByRole("dialog")).toBeNull();
  await audit(container, "saved confirmation");
  await browserUser.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Done" }));
  await browserUser.keyboard("{Enter}");
  await screen.findByRole("slider", { name: "Healing time" });
});

function systemColor(value: string) {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

function expectOpaqueSurface(surface: Element) {
  const style = getComputedStyle(surface);
  expect(style.backgroundImage).toBe("none");
  // Chromium serializes a fully opaque color as rgb(), rather than rgba().
  expect(style.backgroundColor.startsWith("rgb(")).toBe(true);
}

test("reduced transparency keeps product summary, frost actions and the finish dialog opaque", async () => {
  await mediaPreferences("none", "reduce");
  const { container } = await setup();
  const overview = screen.getByRole("button", { name: "Timer overview" });
  await browserUser.click(overview);
  await screen.findByRole("list", { name: "Session timeline" });
  const summary = container.querySelector(".button-group-summary-panel-surface");
  const fold = container.querySelector(".button-group-summary-panel-fold");
  const start = screen.getByRole("button", { name: "Start timer" });
  const face = start.querySelector("[data-frost]");
  if (!(summary && fold && face)) {
    throw new Error("Expected product summary and frost action surfaces");
  }
  for (const surface of [summary, fold, face]) {
    expectOpaqueSurface(surface);
  }
  expect(getComputedStyle(fold).backdropFilter).toBe("none");
  await browserUser.keyboard("{Escape}");
  const { modal } = await openFinishDialog();
  expectOpaqueSurface(modal);
  await audit(modal, "reduced transparency finish dialog");
  await browserUser.tab();
  expect(document.activeElement).toBe(
    within(modal).getByRole("button", { name: "save this timer" })
  );
});

test("forced colors retain product summary boundaries, action focus and dialog controls", async () => {
  await mediaPreferences("active");
  const { container } = await setup();
  const overview = screen.getByRole("button", { name: "Timer overview" });
  overview.focus();
  await browserUser.keyboard("{Enter}");
  await screen.findByRole("list", { name: "Session timeline" });
  const fold = container.querySelector(".button-group-summary-panel-fold");
  if (!fold) {
    throw new Error("Expected the expanded product summary");
  }
  expect(getComputedStyle(fold).backgroundColor).toBe(systemColor("Canvas"));
  expect(getComputedStyle(fold).borderTopStyle).toBe("solid");
  expect(Number.parseFloat(getComputedStyle(fold).borderTopWidth)).toBeGreaterThan(0);
  await browserUser.keyboard("{Escape}");
  expect(document.activeElement).toBe(overview);
  await browserUser.tab();
  const start = screen.getByRole("button", { name: "Start timer" });
  expect(document.activeElement).toBe(start);
  expect(start.matches(":focus-visible")).toBe(true);
  expect(getComputedStyle(start).outlineStyle).toBe("solid");
  expect(getComputedStyle(start).outlineColor).toBe(systemColor("Highlight"));
  const face = start.querySelector("[data-frost]");
  if (!face) {
    throw new Error("Expected a frost action face");
  }
  expect(getComputedStyle(face).backgroundColor).toBe(systemColor("ButtonFace"));
  expect(getComputedStyle(face).borderTopStyle).toBe("solid");
  expect(getComputedStyle(face).boxShadow).toBe("none");
  const { modal } = await openFinishDialog();
  expect(getComputedStyle(modal).backgroundColor).toBe(systemColor("Canvas"));
  expect(getComputedStyle(modal).borderTopStyle).toBe("solid");
  expect(Number.parseFloat(getComputedStyle(modal).borderTopWidth)).toBeGreaterThan(0);
  await audit(modal, "forced colors finish dialog");
  await browserUser.tab();
  expect(document.activeElement).toBe(
    within(modal).getByRole("button", { name: "save this timer" })
  );
  await browserUser.tab();
  expect(document.activeElement).toBe(within(modal).getByRole("link", { name: "make changes" }));
  await browserUser.tab();
  expect(document.activeElement).toBe(
    within(modal).getByRole("button", { name: "Leave without saving" })
  );
});
