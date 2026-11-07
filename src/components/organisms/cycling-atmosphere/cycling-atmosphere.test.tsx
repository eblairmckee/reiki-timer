import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { AtmosphereProps } from "@/components/design-system/atmosphere";
import { CyclingAtmosphere, type CyclingAtmosphereProps } from ".";

const preferences = vi.hoisted(() => ({ reduced: false }));
vi.mock("@/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => preferences.reduced,
}));
vi.mock("@/components/design-system/atmosphere", () => ({
  Atmosphere: ({
    palette,
    children,
    dim,
    blackout,
    resetId,
    transitionSeconds,
  }: AtmosphereProps) => (
    <div
      data-blackout={blackout}
      data-dim={dim}
      data-palette={palette.join(",")}
      data-reset={resetId}
      data-testid="atmosphere"
      data-transition={transitionSeconds}
    >
      {children}
    </div>
  ),
}));

const weather = [
  ["--ocean-deep", "--ocean-tide", "--ocean-foam", "--ocean-night"],
  ["--desert-sand", "--desert-clay", "--desert-dusk", "--desert-rock"],
  ["--forest-pine", "--forest-moss", "--forest-leaf", "--forest-bark"],
] as const satisfies CyclingAtmosphereProps["palettes"];
const seasons = [weather[2], weather[0]] as const;

function expectPalette(index: number) {
  expect(screen.getByTestId("atmosphere").getAttribute("data-palette")).toBe(
    weather[index].join(",")
  );
}

function tick(milliseconds = 10_000) {
  act(() => vi.advanceTimersByTime(milliseconds));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
});

afterEach(() => {
  preferences.reduced = false;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("uncontrolled preview advances every ten seconds, wraps, and forwards foundation props", () => {
  const onIndexChange = vi.fn();
  const { rerender } = render(
    <CyclingAtmosphere
      blackout
      dim={0.4}
      onIndexChange={onIndexChange}
      palettes={weather}
      resetId={12}
      transitionSeconds={3}
    >
      <h1>Weather forecast</h1>
    </CyclingAtmosphere>
  );
  expectPalette(0);
  expect(screen.getByRole("heading", { name: "Weather forecast" })).toBeTruthy();
  const backdrop = screen.getByTestId("atmosphere");
  expect(backdrop.getAttribute("data-blackout")).toBe("true");
  expect(backdrop.getAttribute("data-dim")).toBe("0.4");
  expect(backdrop.getAttribute("data-reset")).toBe("12");
  expect(backdrop.getAttribute("data-transition")).toBe("3");
  tick(9999);
  expectPalette(0);
  tick(1);
  expectPalette(1);
  tick();
  expectPalette(2);
  tick();
  expectPalette(0);
  expect(onIndexChange.mock.calls).toEqual([[1], [2], [0]]);
  rerender(<CyclingAtmosphere defaultIndex={2} palettes={weather} />);
  expectPalette(0);
});

test("controlled zero remains caller-owned and callback updates do not restart its interval", () => {
  const first = vi.fn();
  const second = vi.fn();
  const { rerender } = render(
    <CyclingAtmosphere defaultIndex={2} index={0} onIndexChange={first} palettes={weather} />
  );
  tick();
  expectPalette(0);
  expect(first.mock.calls).toEqual([[1]]);
  tick(5000);
  rerender(<CyclingAtmosphere index={0} onIndexChange={second} palettes={weather} />);
  tick(5000);
  expectPalette(0);
  expect(second.mock.calls).toEqual([[1]]);
  rerender(<CyclingAtmosphere index={2} onIndexChange={second} palettes={weather} />);
  expectPalette(2);
  tick();
  expect(second.mock.calls).toEqual([[1], [0]]);
  expectPalette(2);
});

test("fixed phases change independently and resume the retained preview after a fresh interval", () => {
  const onIndexChange = vi.fn();
  const { rerender, unmount } = render(
    <CyclingAtmosphere onIndexChange={onIndexChange} palettes={weather} />
  );
  tick();
  expectPalette(1);
  rerender(
    <CyclingAtmosphere
      cycling={false}
      fixedIndex={2}
      onIndexChange={onIndexChange}
      palettes={weather}
    />
  );
  expectPalette(2);
  expect(vi.getTimerCount()).toBe(0);
  tick();
  rerender(<CyclingAtmosphere cycling={false} fixedIndex={0} palettes={weather} />);
  expectPalette(0);
  rerender(<CyclingAtmosphere onIndexChange={onIndexChange} palettes={weather} />);
  expectPalette(1);
  tick(9999);
  expectPalette(1);
  tick(1);
  expectPalette(2);
  expect(onIndexChange.mock.calls).toEqual([[1], [2]]);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

test("reduced motion stops cycling and changes to the preference clean up the interval", () => {
  preferences.reduced = true;
  const onIndexChange = vi.fn();
  const { rerender } = render(
    <CyclingAtmosphere defaultIndex={1} onIndexChange={onIndexChange} palettes={weather} />
  );
  expect(vi.getTimerCount()).toBe(0);
  tick();
  expectPalette(1);
  expect(onIndexChange).not.toHaveBeenCalled();
  preferences.reduced = false;
  rerender(<CyclingAtmosphere onIndexChange={onIndexChange} palettes={weather} />);
  tick();
  expectPalette(2);
  preferences.reduced = true;
  rerender(<CyclingAtmosphere onIndexChange={onIndexChange} palettes={weather} />);
  expect(vi.getTimerCount()).toBe(0);
  tick();
  expectPalette(2);
  expect(onIndexChange.mock.calls).toEqual([[2]]);
});

test("hidden ticks request no changes and visibility resumes without catch-up", () => {
  const hidden = vi.spyOn(document, "hidden", "get");
  const onIndexChange = vi.fn();
  render(<CyclingAtmosphere onIndexChange={onIndexChange} palettes={weather} />);
  hidden.mockReturnValue(true);
  tick(30_000);
  expectPalette(0);
  expect(onIndexChange).not.toHaveBeenCalled();
  hidden.mockReturnValue(false);
  tick();
  expectPalette(1);
  expect(onIndexChange.mock.calls).toEqual([[1]]);
});

test("unrelated instances retain independent preview positions and palette lengths", () => {
  const { rerender } = render(
    <>
      <CyclingAtmosphere defaultIndex={1} palettes={weather} />
      <CyclingAtmosphere palettes={seasons} />
    </>
  );
  tick();
  expect(
    screen.getAllByTestId("atmosphere").map((node) => node.getAttribute("data-palette"))
  ).toEqual([weather[2].join(","), seasons[1].join(",")]);
  rerender(
    <>
      <CyclingAtmosphere cycling={false} palettes={weather} />
      <CyclingAtmosphere palettes={seasons} />
    </>
  );
  tick();
  expect(
    screen.getAllByTestId("atmosphere").map((node) => node.getAttribute("data-palette"))
  ).toEqual([weather[0].join(","), seasons[0].join(",")]);
});

test("indices truncate and clamp, nonfinite values use zero, and smaller palettes stay valid", () => {
  const { rerender } = render(<CyclingAtmosphere defaultIndex={99} palettes={weather} />);
  expectPalette(2);
  rerender(<CyclingAtmosphere palettes={seasons} />);
  expectPalette(0);
  tick();
  expectPalette(2);
  for (const [index, expected] of [
    [-1, 0],
    [1.9, 1],
    [99, 2],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
  ]) {
    rerender(<CyclingAtmosphere index={index} palettes={weather} />);
    expectPalette(expected);
    rerender(<CyclingAtmosphere cycling={false} fixedIndex={index} palettes={weather} />);
    expectPalette(expected);
  }
});

test("one palette still emits each requested advance and empty runtime palettes fail clearly", () => {
  const onIndexChange = vi.fn();
  const { unmount } = render(
    <CyclingAtmosphere onIndexChange={onIndexChange} palettes={[weather[0]]} />
  );
  tick();
  tick();
  expectPalette(0);
  expect(onIndexChange.mock.calls).toEqual([[0], [0]]);
  unmount();
  expect(() =>
    render(<CyclingAtmosphere palettes={[] as unknown as CyclingAtmosphereProps["palettes"]} />)
  ).toThrow("CyclingAtmosphere requires at least one palette");
});

test("caller cadence changes replace the interval and invalid cadence fails clearly", () => {
  const { rerender, unmount } = render(<CyclingAtmosphere intervalMs={500} palettes={weather} />);
  tick(499);
  expectPalette(0);
  tick(1);
  expectPalette(1);
  rerender(<CyclingAtmosphere intervalMs={1000} palettes={weather} />);
  tick(999);
  expectPalette(1);
  tick(1);
  expectPalette(2);
  unmount();
  expect(() => render(<CyclingAtmosphere intervalMs={0} palettes={weather} />)).toThrow(
    "intervalMs must be positive and finite"
  );
});
