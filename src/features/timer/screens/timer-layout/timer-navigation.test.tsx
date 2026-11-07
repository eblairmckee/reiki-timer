import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { chimeSource } from "@/features/timer/data/chimes";
import { defaultConfig } from "@/features/timer/model/timer-config";
import type { Session } from "@/features/timer/model/timer-session";
import { draftStorageKey } from "@/features/timer/services/timer-storage";
import { routeTree } from "@/routeTree.gen";
import { SoundPlayer } from "@/utils/audio/sound-player";

let timestamp = 1_000_000;

beforeEach(() => {
  timestamp = 1_000_000;
  vi.spyOn(Date, "now").mockImplementation(() => timestamp);
  vi.spyOn(SoundPlayer.prototype, "prepare").mockResolvedValue(undefined);
  vi.spyOn(SoundPlayer.prototype, "play").mockResolvedValue(undefined);
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => vi.restoreAllMocks());

async function setup(path: string, session: Session) {
  window.sessionStorage.setItem(
    draftStorageKey,
    JSON.stringify({
      config: { ...defaultConfig, chimeOnChange: true, chimes: true, minutes: 7, showTime: true },
      session,
    })
  );
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
  return { router, ...view };
}

function storedSession(): Session {
  return JSON.parse(window.sessionStorage.getItem(draftStorageKey) ?? "null").session;
}

test("Back and Forward freeze a running session; Resume excludes time spent editing", async () => {
  const { router } = await setup("/reiki-on/edit", {
    elapsed: 45_000,
    mode: "paused",
    startedAt: 0,
  });
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("button", { name: "Resume timer" }));
  await screen.findByRole("button", { name: "Pause timer" });
  timestamp += 15_000;
  await act(async () => router.history.back());
  await screen.findByRole("slider", { name: "Healing time" });
  expect(storedSession()).toEqual({ elapsed: 60_000, mode: "paused", startedAt: 0 });
  timestamp += 120_000;
  await act(async () => router.history.forward());
  expect((await screen.findByRole("timer")).textContent).toBe("6:00");
  expect(screen.getByRole("button", { name: "Resume timer" })).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Resume timer" }));
  timestamp += 15_000;
  await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
  expect(screen.getByRole("timer").textContent).toBe("5:45");
});

test.each([45_000, 420_000])(
  "direct edit restores a running draft at %i without continuing its clock",
  async (elapsed) => {
    await setup("/reiki-on/edit", { elapsed: 0, mode: "running", startedAt: timestamp - elapsed });
    await screen.findByRole("slider", { name: "Healing time" });
    expect(storedSession()).toEqual({
      elapsed,
      mode: elapsed >= 420_000 ? "complete" : "paused",
      startedAt: 0,
    });
    timestamp += 30_000;
    await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
    expect(storedSession().elapsed).toBe(elapsed);
    expect(SoundPlayer.prototype.play).not.toHaveBeenCalled();
  }
);

test("a rapid edit visit freezes playback even when React batches both navigations", async () => {
  const { router } = await setup("/reiki-on", {
    elapsed: 0,
    mode: "running",
    startedAt: timestamp - 45_000,
  });
  timestamp += 15_000;
  await act(async () => {
    await router.navigate({ to: "/reiki-on/edit" });
    await router.navigate({ to: "/reiki-on" });
  });
  await screen.findByRole("button", { name: "Resume timer" });
  expect(storedSession()).toEqual({ elapsed: 60_000, mode: "paused", startedAt: 0 });
});

test("leaving an editor cancels its pending preview even when the session is already paused", async () => {
  const stop = vi.spyOn(SoundPlayer.prototype, "stop");
  const { router } = await setup("/reiki-on/edit", {
    elapsed: 45_000,
    mode: "paused",
    startedAt: 0,
  });
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("button", { name: "High zen tone" }));
  expect(SoundPlayer.prototype.play).toHaveBeenCalledWith(chimeSource("zen-high"));
  stop.mockClear();
  await act(async () => router.navigate({ to: "/reiki-on" }));
  await screen.findByRole("button", { name: "Resume timer" });
  expect(stop).toHaveBeenCalled();
});

test.each([
  ["/reiki-on", "Edit timer"],
  ["/reiki-on/edit", "Resume timer"],
  ["/reiki-on/edit", "Restart timer"],
] as const)("leaving and returning to %s during an exit cancels %s", async (path, action) => {
  const { router } = await setup(path, { elapsed: 45_000, mode: "paused", startedAt: 0 });
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("button", { name: action }));
  expect(document.querySelector(".timer-foreground")?.hasAttribute("inert")).toBe(true);
  await act(async () => {
    await router.navigate({ to: "/" });
    await router.navigate({ to: path });
  });
  await waitFor(() =>
    expect(document.querySelector(".timer-foreground")?.hasAttribute("inert")).toBe(false)
  );
  expect(router.state.location.pathname).toBe(path);
  expect(screen.getByRole("button", { name: "Resume timer" })).toBeTruthy();
  expect(storedSession()).toMatchObject({ elapsed: 45_000, mode: "paused" });
});

test("a superseded awaited navigation cannot apply its old Restart session", async () => {
  const { router } = await setup("/reiki-on/edit", {
    elapsed: 45_000,
    mode: "paused",
    startedAt: 0,
  });
  const originalNavigate = router.navigate.bind(router);
  let arrived = false;
  const release = Promise.withResolvers<void>();
  vi.spyOn(router, "navigate").mockImplementationOnce(async (options) => {
    await originalNavigate(options);
    arrived = true;
    await release.promise;
  });
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("button", { name: "Restart timer" }));
  await waitFor(() => expect(arrived).toBe(true));
  await act(async () => {
    await router.navigate({ to: "/" });
    await router.navigate({ to: "/reiki-on" });
    release.resolve();
  });
  await screen.findByRole("button", { name: "Resume timer" });
  expect(router.state.location.pathname).toBe("/reiki-on");
  expect(storedSession()).toEqual({ elapsed: 45_000, mode: "paused", startedAt: 0 });
});

test("Strict Mode restoration skips old cues, emits one new cue, and removes the clock on unmount", async () => {
  const { unmount } = await setup("/reiki-on", {
    elapsed: 0,
    mode: "running",
    startedAt: timestamp - 65_000,
  });
  expect(SoundPlayer.prototype.play).not.toHaveBeenCalled();
  timestamp += 55_000;
  await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
  expect(SoundPlayer.prototype.play).toHaveBeenCalledTimes(1);
  await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
  expect(SoundPlayer.prototype.play).toHaveBeenCalledTimes(1);
  unmount();
  const persisted = storedSession();
  timestamp += 60_000;
  await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
  expect(SoundPlayer.prototype.play).toHaveBeenCalledTimes(1);
  expect(storedSession()).toEqual(persisted);
});
