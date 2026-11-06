import { beforeEach, expect, spyOn, test } from "bun:test";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimerScreen } from "./timer-screen";
import { configStorageKey } from "./timer-state";

beforeEach(() => window.localStorage.removeItem(configStorageKey));

test("related fields reveal in place; sessions have no visible time by default", async () => {
  render(<TimerScreen />);
  const user = userEvent.setup({ document });
  expect(screen.getByRole("switch", { name: "Show time" }).getAttribute("aria-checked")).toBe(
    "false",
  );
  await user.click(screen.getByRole("switch", { name: "Warm up" }));
  expect(screen.getByRole("slider", { name: "Warm-up time" })).toBeTruthy();
  await user.click(screen.getByRole("switch", { name: "Repeat chakras" }));
  expect(window.localStorage.getItem(configStorageKey)).toBeNull();
  await user.click(screen.getByRole("button", { name: "Start timer" }));
  await waitFor(() => expect(document.querySelector(".timer-settings") === null).toBe(true), {
    mutationObserverOptions: { childList: true, subtree: true },
  });
  expect(screen.queryByRole("timer")).toBeNull();
  await screen.findByRole("button", { name: "Stop timer" });
  await waitFor(() => expect(document.querySelector(".timer-session") !== null).toBe(true), {
    mutationObserverOptions: { childList: true, subtree: true },
  });
  expect(document.querySelector(".timer-session")?.textContent).toBe("");
  const saved = JSON.parse(window.localStorage.getItem(configStorageKey) ?? "null");
  expect(saved.warmUp).toBe(true);
  expect(saved.repeat).toBe(true);
  expect(saved.showTime).toBe(false);
  await user.click(await screen.findByRole("button", { name: "Stop timer" }));
  const hud = within(screen.getByRole("group", { name: "Timer controls" }));
  expect(hud.getByRole("button", { name: "Resume timer" })).toBeTruthy();
  expect(hud.getByRole("button", { name: "Edit timer" }).textContent).toBe("Edit");
  expect(hud.getByRole("button", { name: "Finish timer" }).textContent).toBe("Finish");
  await user.click(hud.getByRole("button", { name: "Finish timer" }));
  expect(await screen.findByRole("slider", { name: "How long" })).toBeTruthy();
});

test("editing replaces the session with settings, and show-time persists on restart", async () => {
  render(<TimerScreen />);
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("switch", { name: "Show time" }));
  await user.click(screen.getByRole("button", { name: "Start timer" }));
  expect((await screen.findByRole("timer")).textContent).toBe("20:00");
  await user.click(await screen.findByRole("button", { name: "Stop timer" }));
  await user.click(screen.getByRole("button", { name: "Edit timer" }));
  const slider = await screen.findByRole("slider", { name: "How long" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("timer")).toBeNull();
  expect(screen.queryByRole("button", { name: "Edit timer" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Finish timer" })).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Resume timer" }));
  expect((await screen.findByRole("button", { name: "Restart timer" })).textContent).toBe(
    "Restart",
  );
  fireEvent.keyDown(slider, { key: "Home" });
  await user.click(screen.getByRole("button", { name: "Restart timer" }));
  expect((await screen.findByRole("timer")).textContent).toBe("5:00");
  expect(JSON.parse(window.localStorage.getItem(configStorageKey) ?? "null").showTime).toBe(true);
  await user.click(await screen.findByRole("button", { name: "Stop timer" }));
  await user.click(screen.getByRole("button", { name: "Resume timer" }));
  expect(screen.getByRole("button", { name: "Stop timer" })).toBeTruthy();
  // Exiting controls become inert immediately, before their collapse animation completes.
  expect(document.querySelector(".timer-hud-secondary")?.hasAttribute("inert")).toBe(true);
});

test("a completed session fades back to its configuration without a finish prompt", async () => {
  let timestamp = 1_000_000;
  const clock = spyOn(Date, "now").mockImplementation(() => timestamp);
  try {
    render(<TimerScreen />);
    const user = userEvent.setup({ document });
    expect(screen.getByRole("heading", { name: "Reiki timer", level: 1 })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Start timer" }));
    expect(document.querySelector(".timer-foreground")?.hasAttribute("inert")).toBe(true);
    await screen.findByRole("button", { name: "Stop timer" });
    timestamp += 20 * 60_000 + 1;
    await act(async () => document.dispatchEvent(new window.Event("visibilitychange")));
    expect(await screen.findByRole("heading", { name: "Reiki timer", level: 1 })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "How long" }).getAttribute("value")).toBe("20");
    expect(screen.getByRole("status").textContent).toContain("complete");
    expect(screen.queryByRole("button", { name: "Finish timer" })).toBeNull();
  } finally {
    clock.mockRestore();
  }
});
