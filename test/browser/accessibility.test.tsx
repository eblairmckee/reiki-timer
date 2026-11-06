import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, expect, test, vi } from "vitest";
import { ChimePlayer } from "../../src/features/timer/chimes";
import { routeTree } from "../../src/routeTree.gen";
import "../../src/index.css";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  for (const fixture of document.querySelectorAll("[data-contrast-probe]")) {
    fixture.remove();
  }
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
  // Incomplete results are evidence, not passes: numeric theme checks cover
  // translucent and shader-backed contrast which axe cannot determine.
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
  return result;
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

test("an unnamed control mutation is rejected by the ordinary axe assertion and restored", async () => {
  const { container } = await setup();
  const button = screen.getByRole("button", { name: "Start timer" });
  const original = button.outerHTML;
  const attributes = Array.from(button.attributes, ({ name, value }) => [name, value] as const);
  const contents = button.innerHTML;
  try {
    act(() => {
      for (const name of ["aria-label", "aria-labelledby", "title"]) {
        button.removeAttribute(name);
      }
      button.innerHTML = "";
    });
    console.info(JSON.stringify({ mutatedControl: button.outerHTML }));
    const mutated = await axe.run(container);
    const violationIds = mutated.violations.map(({ id }) => id);
    expect(violationIds).toContain("button-name");
    expect(() => expect(violationIds).toEqual([])).toThrow();
    console.info(JSON.stringify({ mutation: "unnamed control", rejectedBy: violationIds }));
  } finally {
    for (const [name, value] of attributes) {
      button.setAttribute(name, value);
    }
    button.innerHTML = contents;
  }
  expect(button.outerHTML).toBe(original);
  await audit(container, "restored unnamed control");
});

test("axe rejects a low-contrast theme value on a determinable surface and restoration passes", async () => {
  const fixture = document.createElement("div");
  const text = document.createElement("p");
  text.textContent = "Readable theme contrast probe";
  text.dataset.ink = "on-light-frost";
  fixture.dataset.contrastProbe = "";
  fixture.style.backgroundColor = "var(--color-paper)";
  fixture.append(text);
  document.body.append(fixture);
  const original = fixture.getAttribute("style");
  try {
    const baseline = await axe.run(fixture, { runOnly: ["color-contrast"] });
    expect(baseline.violations).toEqual([]);
    fixture.style.setProperty("--color-ink", "var(--glass-edge-low)");
    const mutated = await axe.run(fixture, { runOnly: ["color-contrast"] });
    expect(mutated.violations.map(({ id }) => id)).toEqual(["color-contrast"]);
    expect(() => expect(mutated.violations).toEqual([])).toThrow();
    console.info(
      JSON.stringify({ mutation: "axe low-contrast theme ink", violations: mutated.violations })
    );
  } finally {
    if (original === null) {
      fixture.removeAttribute("style");
    } else {
      fixture.setAttribute("style", original);
    }
  }
  try {
    expect(fixture.getAttribute("style")).toBe(original);
    const restored = await axe.run(fixture, { runOnly: ["color-contrast"] });
    expect(restored.violations).toEqual([]);
    console.info(
      JSON.stringify({
        incomplete: restored.incomplete,
        state: "restored low-contrast fixture",
        violations: restored.violations,
      })
    );
  } finally {
    fixture.remove();
  }
});
