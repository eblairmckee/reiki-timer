import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { routeTree } from "../../routeTree.gen";
import { ChimePlayer } from "./chimes";
import { draftStorageKey } from "./timer-draft";
import { configStorageKey, defaultConfig, timerTimeline } from "./timer-state";
import { TimerTimeline } from "./timer-timeline";

beforeEach(() => {
  window.localStorage.removeItem(configStorageKey);
  window.sessionStorage.removeItem(draftStorageKey);
});

async function renderTimer(path = "/") {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [path] }),
    isServer: false,
    routeTree,
  });
  await router.load();
  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}

test("related fields reveal in place; sessions have no visible time by default", async () => {
  const { router } = await renderTimer();
  const user = userEvent.setup({ document });
  expect(
    screen
      .getByRole("switch", { description: defaultTimerPreview, name: "Show timer" })
      .getAttribute("aria-checked")
  ).toBe("false");
  await user.click(screen.getByRole("switch", { name: "Warm up" }));
  const warmUpTime = screen.getByRole<HTMLInputElement>("slider", { name: "Warm up time" });
  expect(warmUpTime.labels?.length).toBe(0);
  expect(
    screen.getByRole("switch", { description: warmUpTimerPreview, name: "Show timer" })
  ).toBeTruthy();
  await user.click(screen.getByRole("switch", { name: "Repeat chakras" }));
  const summary = within(screen.getByRole("list", { name: "Timer summary" }));
  const numericItems = summary.getAllByRole("listitem");
  expect(numericItems.map((item) => item.querySelector("b")?.textContent)).toEqual([
    "1",
    "20",
    "2",
  ]);
  expect(numericItems[0].textContent).toBe("1m warm up");
  expect(numericItems[1].textContent).toBe("20m session");
  expect(summary.getByText("Repeat chakras twice")).toBeTruthy();
  expect(window.localStorage.getItem(configStorageKey)).toBeNull();
  await user.click(screen.getByRole("button", { name: "Start timer" }));
  await waitFor(() => expect(document.querySelector(".timer-settings") === null).toBe(true), {
    mutationObserverOptions: { childList: true, subtree: true },
  });
  expect(screen.queryByRole("timer")).toBeNull();
  await screen.findByRole("button", { name: "Pause timer" });
  expect(router.state.location.pathname).toBe("/reiki-on");
  await waitFor(() => expect(document.querySelector(".timer-session") !== null).toBe(true), {
    mutationObserverOptions: { childList: true, subtree: true },
  });
  expect(document.querySelector(".timer-session")?.textContent).toBe("");
  expect(window.localStorage.getItem(configStorageKey)).toBeNull();
  await user.click(await screen.findByRole("button", { name: "Pause timer" }));
  const hud = within(screen.getByRole("group", { name: "Timer controls" }));
  expect(hud.getByRole("button", { name: "Resume timer" })).toBeTruthy();
  expect(hud.getByRole("button", { name: "Edit timer" }).textContent).toBe("");
  expect(hud.getByRole("button", { name: "Finish timer" }).getAttribute("aria-haspopup")).toBe(
    "dialog"
  );
  await user.click(hud.getByRole("button", { name: "Finish timer" }));
  const choice = within(await screen.findByRole("dialog", { name: "Reiki off" }));
  await waitFor(() => expect(document.activeElement === choice.getByRole("heading")).toBe(true));
  expect(window.localStorage.getItem(configStorageKey)).toBeNull();
  const store = window.localStorage;
  const { setItem } = store;
  Object.defineProperty(store, "setItem", {
    configurable: true,
    value: () => {
      throw new Error("Storage unavailable");
    },
  });
  try {
    await user.click(choice.getByRole("button", { name: "save this timer" }));
    expect(choice.getByRole("alert").textContent).toContain("Try again");
    expect(window.localStorage.getItem(configStorageKey)).toBeNull();
  } finally {
    Object.defineProperty(store, "setItem", { configurable: true, value: setItem });
  }
  await user.click(choice.getByRole("button", { name: "save this timer" }));
  expect(await screen.findByRole("heading", { name: "Timer saved" })).toBeTruthy();
  expect(JSON.parse(window.localStorage.getItem(configStorageKey) ?? "null")).toMatchObject({
    repeat: true,
    showTime: false,
    warmUp: true,
  });
  await user.click(screen.getByRole("button", { name: "Done" }));
  expect(await screen.findByRole("slider", { name: "Healing time" })).toBeTruthy();
});

test("the editor summary reflects changes; restarting and resuming do not save them", async () => {
  await renderTimer();
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("switch", { name: "Show timer" }));
  expect(
    screen
      .getByRole("switch", {
        description: defaultBreakdownDescription,
        name: "Show breakdown",
      })
      .getAttribute("aria-checked")
  ).toBe("false");
  await user.click(screen.getByRole("button", { name: "Start timer" }));
  expect((await screen.findByRole("timer")).textContent).toBe("20:00");
  await user.click(await screen.findByRole("button", { name: "Pause timer" }));
  await user.click(screen.getByRole("button", { name: "Edit timer" }));
  expect(
    screen.queryByRole("switch", { description: chimesEnabledDescription, name: "Show breakdown" })
  ).toBeNull();
  const slider = await screen.findByRole("slider", { name: "Healing time" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("timer")).toBeNull();
  expect(screen.queryByRole("button", { name: "Edit timer" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Finish timer" })).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Resume timer" }));
  const choices = within(screen.getByRole("group", { name: "Playback actions" }));
  // Editing a field moves focus out of the HUD. Restart stays available at rest.
  await user.click(slider);
  await user.keyboard("{Escape}");
  expect(choices.getByRole("button", { name: "Restart timer" })).toBeTruthy();
  fireEvent.keyDown(slider, { key: "Home" });
  expect(
    screen.getByRole("switch", { description: shortSessionDescription, name: "Show breakdown" })
  ).toBeTruthy();
  const editorSummary = within(screen.getByRole("list", { name: "Timer summary" }));
  expect(editorSummary.getAllByRole("listitem")[0].textContent).toBe("5m session");
  await user.click(choices.getByRole("button", { name: "Restart timer" }));
  expect((await screen.findByRole("timer")).textContent).toBe("5:00");
  expect(window.localStorage.getItem(configStorageKey)).toBeNull();
  await user.click(await screen.findByRole("button", { name: "Pause timer" }));
  const exitingEdit = screen.getByRole("button", { name: "Edit timer" });
  await user.click(screen.getByRole("button", { name: "Resume timer" }));
  expect(screen.getByRole("button", { name: "Pause timer" })).toBeTruthy();
  // Exiting controls become inert immediately, before their collapse animation completes.
  expect(exitingEdit.closest("[inert]") !== null || !exitingEdit.isConnected).toBe(true);
});

test("a completed timer can be edited, refreshed and saved for the next visit", async () => {
  let timestamp = 1_000_000;
  const clock = vi.spyOn(Date, "now").mockImplementation(() => timestamp);
  try {
    const firstVisit = await renderTimer();
    const user = userEvent.setup({ document });
    expect(screen.queryByRole("heading", { name: "Reiki timer" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Start timer" }));
    expect(document.querySelector(".timer-foreground")?.hasAttribute("inert")).toBe(true);
    await screen.findByRole("button", { name: "Pause timer" });
    timestamp += 20 * 60_000 + 1;
    await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
    expect(await screen.findByRole("dialog", { name: "Reiki off" })).toBeTruthy();
    expect(screen.getByText(sessionCompleteMessage)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Finish timer" })).toBeNull();
    await user.click(screen.getByRole("link", { name: "make changes" }));
    const slider = await screen.findByRole("slider", { name: "Healing time" });
    const editPath = firstVisit.router.state.location.pathname;
    expect(editPath).toBe("/reiki-on/edit");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(window.localStorage.getItem(configStorageKey)).toBeNull();
    firstVisit.unmount();
    const refreshed = await renderTimer(editPath);
    expect(screen.getByRole("slider", { name: "Healing time" }).getAttribute("value")).toBe("5");
    const hud = within(screen.getByRole("group", { name: "Timer controls" }));
    expect(hud.getByRole("button", { name: "Restart timer" })).toBeTruthy();
    await user.click(hud.getByRole("button", { name: "Save timer" }));
    await screen.findByRole("heading", { name: "Timer saved" });
    expect(refreshed.router.state.location.pathname).toBe("/reiki-on");
    refreshed.unmount();
    await renderTimer();
    expect(screen.getByRole("slider", { name: "Healing time" }).getAttribute("value")).toBe("5");
    expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy();
  } finally {
    clock.mockRestore();
  }
});

test("restarting from a finished timer edit starts over without saving the draft", async () => {
  const stored = JSON.stringify({ ...defaultConfig, minutes: 35 });
  window.localStorage.setItem(configStorageKey, stored);
  window.sessionStorage.setItem(
    draftStorageKey,
    JSON.stringify({
      config: { ...defaultConfig, minutes: 5, showTime: true },
      session: { elapsed: 120_000, mode: "edit-before-save", startedAt: 0 },
    })
  );
  await renderTimer("/reiki-on/edit");
  const user = userEvent.setup({ document });
  const actions = within(screen.getByRole("group", { name: "Timer actions" }));
  expect(actions.getByRole("button", { name: "Save timer" })).toBeTruthy();
  await user.click(actions.getByRole("button", { name: "Restart timer" }));
  expect((await screen.findByRole("timer")).textContent).toBe("5:00");
  expect(window.localStorage.getItem(configStorageKey)).toBe(stored);
});

test.each([null, 35])(
  "only confirming the close action clears the finished draft and restores setup (%j)",
  async (savedMinutes) => {
    if (savedMinutes !== null) {
      window.localStorage.setItem(
        configStorageKey,
        JSON.stringify({ ...defaultConfig, minutes: savedMinutes })
      );
    }
    const stored = window.localStorage.getItem(configStorageKey);
    window.sessionStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        config: { ...defaultConfig, minutes: 10, warmUp: true },
        session: { elapsed: 1000, mode: "complete", startedAt: 0 },
      })
    );
    const { router } = await renderTimer("/reiki-on");
    const user = userEvent.setup({ document });
    const dialog = () => within(screen.getByRole("dialog", { name: "Reiki off" }));
    await waitFor(() =>
      expect(document.activeElement === dialog().getByRole("heading")).toBe(true)
    );
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    const finish = screen.getByRole("button", { name: "Finish timer" });
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("aria-label")).toBe("Finish timer")
    );
    expect(router.state.location.pathname).toBe("/reiki-on");
    expect(window.sessionStorage.getItem(draftStorageKey)).toBeTruthy();
    expect(window.localStorage.getItem(configStorageKey)).toBe(stored);
    await user.click(finish);
    await user.click(dialog().getByRole("button", { name: "Leave without saving" }));
    const slider = await screen.findByRole("slider", { name: "Healing time" });
    expect(router.state.location.pathname).toBe("/");
    expect(slider.getAttribute("value")).toBe(String(savedMinutes ?? defaultConfig.minutes));
    expect(window.localStorage.getItem(configStorageKey)).toBe(stored);
    expect(window.sessionStorage.getItem(draftStorageKey)).toBeNull();
  }
);

test.each(["running", "paused"] as const)(
  "a restored %s session offers a single Finish action while paused and opens the reuse prompt",
  async (mode) => {
    const stored = JSON.stringify({ ...defaultConfig, minutes: 35 });
    window.localStorage.setItem(configStorageKey, stored);
    window.sessionStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        config: { ...defaultConfig, minutes: 8 },
        session: { elapsed: 12_000, mode, startedAt: mode === "running" ? Date.now() : 0 },
      })
    );
    const { router } = await renderTimer("/reiki-on");
    const user = userEvent.setup({ document });
    const hud = within(screen.getByRole("group", { name: "Timer controls" }));
    if (mode === "running") {
      const pause = hud.getByRole("button", { name: "Pause timer" });
      await user.hover(pause);
      expect(hud.getAllByRole("button")).toEqual([pause]);
      expect(document.activeElement).toBe(pause);
      await user.keyboard(" ");
    }
    const finish = hud.getByRole("button", { name: "Finish timer" });
    expect(hud.getAllByRole("button")).toEqual([
      finish,
      hud.getByRole("button", { name: "Edit timer" }),
      hud.getByRole("button", { name: "Resume timer" }),
    ]);
    await user.hover(hud.getByRole("button", { name: "Resume timer" }));
    await user.hover(hud.getByRole("button", { name: "Edit timer" }));
    await user.hover(document.body);
    await user.click(finish);
    expect(await screen.findByRole("dialog", { name: "Reiki off" })).toBeTruthy();
    expect(screen.getByText(finishPromptMessage)).toBeTruthy();
    expect(router.state.location.pathname).toBe("/reiki-on");
    expect(window.localStorage.getItem(configStorageKey)).toBe(stored);
  }
);

test("pausing before an edit freezes elapsed time until Resume", async () => {
  let now = 1_000_000;
  const clock = vi.spyOn(Date, "now").mockImplementation(() => now);
  try {
    window.sessionStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        config: { ...defaultConfig, showTime: true },
        session: { elapsed: 0, mode: "running", startedAt: now - 45_000 },
      })
    );
    await renderTimer("/reiki-on");
    const user = userEvent.setup({ document });
    await user.click(screen.getByRole("button", { name: "Pause timer" }));
    await user.click(screen.getByRole("button", { name: "Edit timer" }));
    await screen.findByRole("slider", { name: "Healing time" });
    now += 60_000;
    await user.click(screen.getByRole("button", { name: "Resume timer" }));
    expect((await screen.findByRole("timer")).textContent).toBe("19:15");
  } finally {
    clock.mockRestore();
  }
});

test("a touch editor shows both playback choices and keeps Restart available after shortening", async () => {
  const media = window.matchMedia.bind(window);
  const query = vi.spyOn(window, "matchMedia").mockImplementation((value) => {
    const result = media(value);
    if (value.includes("pointer: coarse")) {
      Object.defineProperty(result, "matches", { value: true });
    }
    return result;
  });
  try {
    window.sessionStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        config: { ...defaultConfig, showTime: true },
        session: { elapsed: 6 * 60_000, mode: "paused", startedAt: 0 },
      })
    );
    await renderTimer("/reiki-on/edit");
    const group = within(screen.getByRole("group", { name: "Playback actions" }));
    expect(group.getByRole("button", { name: "Restart timer" })).toBeTruthy();
    expect(group.getByRole("button", { name: "Resume timer" })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("slider", { name: "Healing time" }), { key: "Home" });
    expect(screen.queryByRole("button", { name: "Resume timer" })).toBeNull();
    const user = userEvent.setup({ document });
    await user.click(screen.getByRole("button", { name: "Restart timer" }));
    expect((await screen.findByRole("timer")).textContent).toBe("5:00");
    const hud = within(screen.getByRole("group", { name: "Timer controls" }));
    const pause = hud.getByRole("button", { name: "Pause timer" });
    expect(hud.getAllByRole("button")).toEqual([pause]);
    await user.pointer({ keys: "[TouchA]", target: pause });
    expect(hud.getByRole("button", { name: "Finish timer" })).toBeTruthy();
    const resume = hud.getByRole("button", { name: "Resume timer" });
    await user.pointer({ keys: "[TouchA]", target: resume });
    expect(hud.getAllByRole("button")).toEqual([hud.getByRole("button", { name: "Pause timer" })]);
  } finally {
    query.mockRestore();
  }
});

test("a restored running timer counts down just the current phase with breakdown hidden", async () => {
  const start = 1_000_000;
  let timestamp = start + 45_000;
  const clock = vi.spyOn(Date, "now").mockImplementation(() => timestamp);
  window.sessionStorage.setItem(
    draftStorageKey,
    JSON.stringify({
      config: { ...defaultConfig, coolDown: true, minutes: 5, showTime: true, warmUp: true },
      session: { elapsed: 0, mode: "running", startedAt: start },
    })
  );
  try {
    await renderTimer("/reiki-on");
    expect(screen.getByRole("timer").textContent).toBe("0:15");
    expect(screen.getByText("Warm up")).toBeTruthy();
    timestamp = start + 60_000;
    await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
    expect(screen.getByRole("timer").textContent).toBe("5:00");
    expect(screen.queryByText("Warm up")).toBeNull();
    timestamp += 5 * 60_000;
    await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
    expect(screen.getByRole("timer").textContent).toBe("1:00");
    expect(screen.getByText("Cool down")).toBeTruthy();
    expect(screen.queryByRole("list", { name: "Timer summary" })).toBeNull();
  } finally {
    clock.mockRestore();
  }
});

test("chimes reveal six selectable previews, preserve preferences, and follow the requested field order", async () => {
  const prepare = vi.spyOn(ChimePlayer.prototype, "prepare").mockResolvedValue(undefined);
  const play = vi.spyOn(ChimePlayer.prototype, "play").mockResolvedValue(undefined);
  const stop = vi.spyOn(ChimePlayer.prototype, "stop");
  try {
    await renderTimer();
    const user = userEvent.setup({ document });
    expect(screen.getAllByRole("switch")).toEqual(
      ["Warm up", "Cool down", "Show timer", "Repeat chakras", "Chimes"].map((name) =>
        screen.getByRole("switch", { name })
      )
    );
    const enabled = screen.getByRole("switch", {
      description: "Cue when to change positions with a chime",
      name: "Chimes",
    });
    expect(enabled.getAttribute("aria-checked")).toBe("false");
    expect(screen.queryByRole("group", { name: "Tone" })).toBeNull();
    await user.click(enabled);
    expect(prepare).toHaveBeenCalledWith("zen-mid");
    const choices = within(screen.getByRole("group", { name: "Tone" })).getAllByRole("button");
    expect(choices).toHaveLength(6);
    expect(choices[1].getAttribute("aria-pressed")).toBe("true");
    const changes = () => screen.getByRole("switch", { name: "When chakras change" });
    expect(changes().getAttribute("aria-checked")).toBe("true");
    expect(screen.queryByRole("switch", { name: "When warm up ends" })).toBeNull();
    expect(screen.queryByRole("switch", { name: "When cool down ends" })).toBeNull();
    choices[2].focus();
    await user.keyboard(" ");
    expect(play).toHaveBeenCalledWith("zen-high");
    expect(choices[2].getAttribute("aria-pressed")).toBe("true");
    expect(choices[1].getAttribute("aria-pressed")).toBe("false");
    const end = () => screen.getByRole("switch", { name: "End of session" });
    expect(end().getAttribute("aria-checked")).toBe("false");
    await user.click(end());
    await user.click(changes());
    expect(enabled.getAttribute("aria-checked")).toBe("true");
    await user.click(enabled);
    expect(stop).toHaveBeenCalled();
    expect(document.querySelector(".timer-progressive")?.hasAttribute("inert")).toBe(true);
    await user.click(enabled);
    expect(screen.getByRole("button", { name: "High zen tone" }).getAttribute("aria-pressed")).toBe(
      "true"
    );
    expect(changes().getAttribute("aria-checked")).toBe("false");
    expect(end().getAttribute("aria-checked")).toBe("true");
    await user.click(end());
    expect(enabled.getAttribute("aria-checked")).toBe("false");
    expect(document.activeElement).toBe(enabled);
    const summary = screen.getByRole("list", { name: "Timer summary" });
    await waitFor(() => expect(within(summary).queryByText("Chimes enabled") === null).toBe(true));
    await user.click(enabled);
    expect(changes().getAttribute("aria-checked")).toBe("true");
    expect(end().getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("button", { name: "High zen tone" }).getAttribute("aria-pressed")).toBe(
      "true"
    );
  } finally {
    prepare.mockRestore();
    play.mockRestore();
    stop.mockRestore();
  }
});

test("each phase reveals its own chime and only available cues keep Chimes enabled", async () => {
  window.localStorage.setItem(
    configStorageKey,
    JSON.stringify({ ...defaultConfig, chimeOnChange: true, chimes: true })
  );
  await renderTimer("/reiki-on/edit");
  const user = userEvent.setup({ document });
  const switchFor = (name: string) => screen.getByRole("switch", { name });
  const warmUp = switchFor("Warm up");
  const coolDown = switchFor("Cool down");
  const chimes = switchFor("Chimes");
  const warmCue = "When warm up ends";
  const coolCue = "When cool down ends";

  await user.click(warmUp);
  expect(switchFor(warmCue).getAttribute("aria-checked")).toBe("false");
  expect(screen.queryByRole("switch", { name: coolCue })).toBeNull();
  await user.click(switchFor(warmCue));
  await user.click(coolDown);
  expect(switchFor(coolCue).getAttribute("aria-checked")).toBe("false");
  await user.click(switchFor(coolCue));
  await user.click(switchFor("When chakras change"));

  await user.click(warmUp);
  expect(screen.queryByRole("switch", { name: warmCue })).toBeNull();
  expect(switchFor(coolCue).getAttribute("aria-checked")).toBe("true");
  await user.click(warmUp);
  expect(switchFor(warmCue).getAttribute("aria-checked")).toBe("true");
  await user.click(coolDown);
  expect(screen.queryByRole("switch", { name: coolCue })).toBeNull();
  expect(chimes.getAttribute("aria-checked")).toBe("true");

  await user.click(warmUp);
  expect(chimes.getAttribute("aria-checked")).toBe("false");
  expect(screen.queryByRole("group", { name: "Tone" })).toBeNull();
  expect(document.activeElement).toBe(warmUp);
});

test("the HUD summary unfolds on hover and closes on exit or Escape", async () => {
  await renderTimer();
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("switch", { name: "Warm up" }));
  const overview = screen.getByRole("group", { name: "Timer overview" });
  const timeline = () => screen.queryByRole("list", { name: "Session timeline" });
  expect(timeline() === null).toBe(true);
  await user.pointer({ keys: "[TouchA]", target: overview });
  expect(timeline() === null).toBe(true);
  await user.hover(overview);
  const list = await screen.findByRole("list", { name: "Session timeline" });
  expect(within(list).getAllByRole("listitem")[0].textContent).toBe("0:00Warm up");
  expect(within(list).getAllByRole("listitem")[1].textContent).toBe("1:00Root");
  await user.hover(list);
  expect(timeline() === list).toBe(true);
  await user.unhover(list);
  expect(timeline() === null).toBe(true);
  await user.hover(overview);
  await user.keyboard("{Escape}");
  expect(timeline() === null).toBe(true);
  await user.click(screen.getByRole("button", { name: "Start timer" }));
  await screen.findByRole("button", { name: "Pause timer" });
  expect(screen.queryByRole("group", { name: "Timer overview" })).toBeNull();
});

test("the timeline marks each sounding boundary, including when every change rings", () => {
  const config = { ...defaultConfig, chimeOnSessionEnd: true, chimes: true };
  const { rerender } = render(<TimerTimeline entries={timerTimeline(config)} />);
  const markers = () => within(screen.getByRole("list", { name: "Session timeline" }));
  const rows = markers().getAllByRole("listitem");
  expect(rows[0].textContent).toContain("Sacral");
  expect(rows[0].textContent).not.toContain("0:00");
  expect(markers().getAllByText("Chime")).toHaveLength(1);
  expect(rows.at(-1)?.querySelector(".timeline-marker svg")).toBeTruthy();
  expect(rows.at(-1)?.querySelector(".timeline-dot")).toBeNull();
  rerender(<TimerTimeline entries={timerTimeline({ ...config, chimeOnChange: true })} />);
  for (const row of markers().getAllByRole("listitem")) {
    expect(within(row).getByText("Chime")).toBeTruthy();
    expect(row.querySelector(".timeline-marker svg")).toBeTruthy();
  }
  rerender(<TimerTimeline entries={timerTimeline(defaultConfig)} />);
  expect(markers().queryByText("Chime")).toBeNull();
});

test("automatic chimes fire once at boundaries, stay silent on pause/resume, and finish once", async () => {
  let timestamp = 1_000_000;
  const clock = vi.spyOn(Date, "now").mockImplementation(() => timestamp);
  const prepare = vi.spyOn(ChimePlayer.prototype, "prepare").mockResolvedValue(undefined);
  const play = vi.spyOn(ChimePlayer.prototype, "play").mockResolvedValue(undefined);
  window.localStorage.setItem(
    configStorageKey,
    JSON.stringify({
      ...defaultConfig,
      chimeOnChange: true,
      chimeOnCoolDownEnd: true,
      chimeOnSessionEnd: true,
      chimeOnWarmUpEnd: true,
      chimes: true,
      coolDown: true,
      minutes: 7,
      showBreakdown: true,
      showTime: true,
      warmUp: true,
    })
  );
  try {
    await renderTimer();
    const user = userEvent.setup({ document });
    const advance = async (milliseconds: number) => {
      timestamp += milliseconds;
      await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
    };
    const durations = ["1m warm up", "7m session", "1m cooldown"];
    const phaseItems = () =>
      within(screen.getByRole("list", { name: "Timer summary" }))
        .getAllByRole("listitem")
        .slice(0, 3)
        .map((item) => item.textContent);
    const coolDownTime = screen.getByRole<HTMLInputElement>("slider", { name: "Cool down time" });
    expect(coolDownTime.labels?.length).toBe(0);
    expect(phaseItems()).toEqual(durations);
    expect(
      within(screen.getByRole("group", { name: "Timer overview" })).getByText("Timer visible")
    ).toBeTruthy();
    expect(
      screen.getByRole("switch", {
        description: phasedBreakdownDescription,
        name: "Show breakdown",
      })
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Start timer" }));
    await screen.findByRole("button", { name: "Pause timer" });
    expect((await screen.findByRole("timer")).textContent).toBe("1:00");
    expect(phaseItems()).toEqual(durations);
    expect(
      within(screen.getByRole("list", { name: "Timer summary" })).queryByText("Timer visible")
    ).toBeNull();
    expect(play).not.toHaveBeenCalled();
    await advance(60_000); // Warm-up ends.
    expect(screen.getByRole("timer").textContent).toBe("7:00");
    await waitFor(() => expect(phaseItems()).not.toContain("1m warm up"), {
      mutationObserverOptions: { childList: true, subtree: true },
    });
    expect(play).toHaveBeenCalledTimes(1);
    await advance(250);
    expect(play).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Pause timer" }));
    await advance(60_000);
    expect(phaseItems()).toContain("7m session");
    await user.click(screen.getByRole("button", { name: "Resume timer" }));
    expect(play).toHaveBeenCalledTimes(1);
    await advance(60_000); // First chakra transition after resuming.
    expect(play).toHaveBeenCalledTimes(2);
    await advance(6 * 60_000); // Cool-down begins; no burst for skipped ticks.
    expect(screen.getByRole("timer").textContent).toBe("1:00");
    await waitFor(() => expect(phaseItems()).not.toContain("7m session"), {
      mutationObserverOptions: { childList: true, subtree: true },
    });
    expect(phaseItems()).toContain("1m cooldown");
    expect(play).toHaveBeenCalledTimes(3);
    await advance(60_000); // Session ends.
    expect(play).toHaveBeenCalledTimes(4);
    await screen.findByRole("dialog", { name: "Reiki off" });
    await advance(1000);
    expect(play).toHaveBeenCalledTimes(4);
  } finally {
    clock.mockRestore();
    prepare.mockRestore();
    play.mockRestore();
  }
});

const defaultTimerPreview = /Like: 20:00/u;
const warmUpTimerPreview = /Like: 1:00/u;
const defaultBreakdownDescription = /Shown beneath the countdown.*Like: 20\s*m session$/u;
const chimesEnabledDescription = /Chimes enabled/u;
const shortSessionDescription = /5\s*m session/u;
const sessionCompleteMessage = /Your session is complete[.]/u;
const finishPromptMessage = /Want to close out this session/u;
const phasedBreakdownDescription = /1\s*m warm up.*7\s*m session.*1\s*m cooldown/u;
