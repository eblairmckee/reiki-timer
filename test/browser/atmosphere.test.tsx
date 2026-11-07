import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { Atmosphere, type AtmospherePalette } from "../../src/components/design-system/atmosphere";

const preferences = vi.hoisted(() => ({ reduced: true }));
vi.mock("../../src/components/design-system/shared/use-reduced-motion", () => ({
  useReducedMotion: () => preferences.reduced,
}));

const oceanColor = `rgb(${[18, 68, 95].join(" ")})`;
const desertColor = `rgb(${[112, 39, 9].join(" ")})`;

const ocean = [
  "--ocean-deep",
  "--ocean-tide",
  "--ocean-foam",
  "--ocean-night",
] as const satisfies AtmospherePalette;
const desert = [
  "--desert-sand",
  "--desert-clay",
  "--desert-dusk",
  "--desert-rock",
] as const satisfies AtmospherePalette;

afterEach(() => {
  cleanup();
  preferences.reduced = true;
  vi.restoreAllMocks();
  for (const name of [...ocean, ...desert]) {
    document.documentElement.style.removeProperty(name);
  }
});

test("unrelated consumers control their own palettes and fallback ink independently", async () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  for (const name of ocean) {
    document.documentElement.style.setProperty(
      name,
      `#${[18, 68, 95].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
    );
  }
  for (const name of desert) {
    document.documentElement.style.setProperty(
      name,
      `#${[112, 39, 9].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
    );
  }
  const { container, rerender, unmount } = render(
    <>
      <Atmosphere palette={ocean}>
        <h1>Ocean forecast</h1>
      </Atmosphere>
      <Atmosphere palette={desert}>
        <h2>Desert weather</h2>
      </Atmosphere>
    </>
  );
  expect(screen.getByRole("heading", { name: "Ocean forecast" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Desert weather" })).toBeTruthy();
  const backdrops = container.querySelectorAll<HTMLElement>(".atmosphere");
  const scopes = container.querySelectorAll<HTMLElement>(".atmosphere-scope");
  await waitFor(() => {
    expect(backdrops[0].style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(
      oceanColor
    );
    expect(backdrops[1].style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(
      desertColor
    );
  });
  expect(backdrops[0].getAttribute("aria-hidden")).toBe("true");
  expect(backdrops[0].querySelector("canvas")).toBeNull();
  const originalOceanInk = scopes[0].style.getPropertyValue("--sys-opacity-ink-text-alpha");
  const originalDesertInk = scopes[1].style.getPropertyValue("--sys-opacity-ink-text-alpha");
  expect(originalOceanInk).not.toBe("");
  rerender(
    <>
      <Atmosphere dim={1} palette={desert}>
        <h1>Ocean forecast</h1>
      </Atmosphere>
      <Atmosphere palette={desert}>
        <h2>Desert weather</h2>
      </Atmosphere>
    </>
  );
  await waitFor(() => {
    expect(backdrops[0].style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(
      desertColor
    );
    expect(
      Number.parseFloat(scopes[0].style.getPropertyValue("--sys-opacity-ink-text-alpha"))
    ).toBeLessThan(Number.parseFloat(originalOceanInk));
  });
  expect(scopes[1].style.getPropertyValue("--sys-opacity-ink-text-alpha")).toBe(originalDesertInk);
  unmount();
});

test("inline palette tuples stay stable and missing tokens retain a safe fallback", async () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const { container, rerender } = render(
    <Atmosphere palette={[...ocean]}>
      <h1>Weather</h1>
    </Atmosphere>
  );
  const backdrop = container.querySelector<HTMLElement>(".atmosphere");
  if (!backdrop) {
    throw new Error("Missing decorative backdrop");
  }
  // Before any palette resolves, CSS owns the default material fallback.
  expect(backdrop.style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe("");
  for (const name of desert) {
    document.documentElement.style.setProperty(
      name,
      `#${[112, 39, 9].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
    );
  }
  rerender(
    <Atmosphere palette={[...desert]}>
      <h1>Weather</h1>
    </Atmosphere>
  );
  await waitFor(() =>
    expect(backdrop.style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(desertColor)
  );
  const readStyle = vi.spyOn(window, "getComputedStyle");
  rerender(
    <Atmosphere palette={[...desert]}>
      <h1>Updated weather</h1>
    </Atmosphere>
  );
  expect(readStyle).not.toHaveBeenCalled();
  rerender(
    <Atmosphere palette={[...ocean]}>
      <h1>Updated weather</h1>
    </Atmosphere>
  );
  expect(backdrop.style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(desertColor);
});

test("a reset and palette change together bypass the configured interpolation", async () => {
  preferences.reduced = false;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  for (const [tokens, channels] of [
    [ocean, [18, 68, 95]],
    [desert, [112, 39, 9]],
  ] as const) {
    for (const name of tokens) {
      document.documentElement.style.setProperty(
        name,
        `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
      );
    }
  }
  const { container, rerender } = render(<Atmosphere palette={ocean} transitionSeconds={0} />);
  const backdrop = container.querySelector<HTMLElement>(".atmosphere");
  if (!backdrop) {
    throw new Error("Missing decorative backdrop");
  }
  await waitFor(() =>
    expect(backdrop.style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(oceanColor)
  );
  rerender(<Atmosphere palette={desert} resetId={1} transitionSeconds={999} />);
  await waitFor(() =>
    expect(backdrop.style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(desertColor)
  );
});

test("paired panels resolve shared token names from their own ancestors", async () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const firstPanel = document.createElement("section");
  const secondPanel = document.createElement("section");
  for (const [panel, channels] of [
    [firstPanel, [18, 68, 95]],
    [secondPanel, [112, 39, 9]],
  ] as const) {
    for (const name of ocean) {
      panel.style.setProperty(
        name,
        `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
      );
    }
  }
  document.body.append(firstPanel, secondPanel);
  try {
    render(
      <Atmosphere palette={ocean}>
        <h1>Ocean outlook</h1>
      </Atmosphere>,
      { container: firstPanel }
    );
    render(
      <Atmosphere palette={ocean}>
        <h2>Desert outlook</h2>
      </Atmosphere>,
      { container: secondPanel }
    );
    const firstBackdrop = firstPanel.querySelector<HTMLElement>(".atmosphere");
    const secondBackdrop = secondPanel.querySelector<HTMLElement>(".atmosphere");
    await waitFor(() => {
      expect(firstBackdrop?.style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(
        oceanColor
      );
      expect(secondBackdrop?.style.getPropertyValue("--cmp-color-atmosphere-pigment-0")).toBe(
        desertColor
      );
    });
    expect(screen.getByRole("heading", { name: "Ocean outlook" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Desert outlook" })).toBeTruthy();
  } finally {
    firstPanel.remove();
    secondPanel.remove();
  }
});
