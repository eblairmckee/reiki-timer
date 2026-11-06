import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import { TimePicker } from ".";

function Example() {
  const [value, setValue] = useState(20);
  return <TimePicker label="How long" onValueChange={setValue} value={value} />;
}
test("the time picker has native slider semantics and bounded keyboard input", () => {
  render(<Example />);
  const input = screen.getByRole("slider", { name: "How long" });
  expect(input.getAttribute("aria-valuetext")).toBe("20 minutes");
  fireEvent.keyDown(input, { key: "ArrowRight" });
  expect(input.getAttribute("aria-valuetext")).toBe("21 minutes");
  fireEvent.keyDown(input, { key: "End" });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(input.getAttribute("aria-valuetext")).toBe("60 minutes");
  fireEvent.keyDown(input, { key: "Home" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(input.getAttribute("aria-valuetext")).toBe("5 minutes");
});

function geometry(input: HTMLElement) {
  const dial = input.parentElement;
  if (!dial) {
    throw new Error("Missing dial");
  }
  dial.getBoundingClientRect = () => ({
    bottom: 300,
    height: 300,
    left: 0,
    right: 300,
    toJSON: () => ({}),
    top: 0,
    width: 300,
    x: 0,
    y: 0,
  });
  return dial;
}
function pointer(degrees: number) {
  return {
    button: 0,
    clientX: 150 + Math.sin((degrees * Math.PI) / 180) * 120,
    clientY: 150 - Math.cos((degrees * Math.PI) / 180) * 120,
    isPrimary: true,
    pointerId: 1,
  };
}
test("rotation previews detents, commits once on release, and cancellation restores the value", () => {
  const change = vi.fn();
  render(<TimePicker label="Duration" onValueChange={change} value={20} />);
  const input = screen.getByRole("slider", { name: "Duration" });
  const dial = geometry(input);
  fireEvent.pointerDown(dial, pointer(120));
  fireEvent.pointerMove(dial, pointer(156));
  expect(input.getAttribute("aria-valuetext")).toBe("26 minutes");
  expect(change).not.toHaveBeenCalled();
  fireEvent.pointerCancel(dial, pointer(156));
  expect(input.getAttribute("aria-valuetext")).toBe("20 minutes");
  fireEvent.pointerDown(dial, pointer(120));
  fireEvent.pointerMove(dial, pointer(156));
  fireEvent.pointerUp(dial, pointer(156));
  expect(change).toHaveBeenCalledWith(26);
  expect(change).toHaveBeenCalledTimes(1);
});

test("tapping a tick selects a value without dragging", () => {
  render(<Example />);
  const input = screen.getByRole("slider", { name: "How long" });
  const dial = geometry(input);
  expect(dial.querySelectorAll(".time-picker-ticks g")).toHaveLength(12);
  fireEvent.pointerDown(dial, pointer(180));
  fireEvent.pointerUp(dial, pointer(180));
  expect(input.getAttribute("aria-valuetext")).toBe("30 minutes");
});

test("independent pickers keep their labels and controlled values", () => {
  const view = render(
    <>
      <TimePicker label="Warm-up time" max={10} min={1} onValueChange={ignoreValue} value={2} />
      <TimePicker label="Cool-down time" max={10} min={1} onValueChange={ignoreValue} value={3} />
    </>
  );
  const warm = screen.getByRole("slider", { name: "Warm-up time" });
  const cool = screen.getByRole("slider", { name: "Cool-down time" });
  expect(geometry(warm).querySelectorAll(".time-picker-ticks g")).toHaveLength(10);
  expect(warm.id).not.toBe(cool.id);
  expect(warm.getAttribute("aria-valuetext")).toBe("2 minutes");
  expect(cool.getAttribute("aria-valuetext")).toBe("3 minutes");
  view.rerender(
    <TimePicker label="Warm-up time" max={10} min={1} onValueChange={ignoreValue} value={8} />
  );
  expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe("8 minutes");
});

test("clock ticks retain their absolute positions and clamp values below the minimum", () => {
  render(<Example />);
  const input = screen.getByRole("slider", { name: "How long" });
  const dial = geometry(input);
  for (const [angle, expected] of [
    [90, 15],
    [6, 5],
    [0, 60],
  ]) {
    fireEvent.pointerDown(dial, pointer(angle));
    fireEvent.pointerUp(dial, pointer(angle));
    expect(input.getAttribute("aria-valuetext")).toBe(`${expected} minutes`);
  }
});

function ignoreValue() {
  /* Controlled fixture deliberately ignores changes. */
}
