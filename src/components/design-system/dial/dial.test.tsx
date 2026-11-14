import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import { Dial } from ".";

function Example() {
  const [value, setValue] = useState(20);
  return <Dial label="How long" max={60} min={5} onValueChange={setValue} value={value} />;
}
test("the dial has native slider semantics and bounded keyboard input", () => {
  render(<Example />);
  const input = screen.getByRole("slider", { name: "How long" });
  expect(input.getAttribute("aria-valuetext")).toBe("20");
  fireEvent.keyDown(input, { key: "ArrowRight" });
  expect(input.getAttribute("aria-valuetext")).toBe("21");
  fireEvent.keyDown(input, { key: "End" });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(input.getAttribute("aria-valuetext")).toBe("60");
  fireEvent.keyDown(input, { key: "Home" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(input.getAttribute("aria-valuetext")).toBe("5");
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
  render(<Dial label="Amount" max={60} min={5} onValueChange={change} value={20} />);
  const input = screen.getByRole("slider", { name: "Amount" });
  const dial = geometry(input);
  fireEvent.pointerDown(dial, pointer(120));
  fireEvent.pointerMove(dial, pointer(156));
  expect(input.getAttribute("aria-valuetext")).toBe("26");
  expect(change).not.toHaveBeenCalled();
  fireEvent.pointerCancel(dial, pointer(156));
  expect(input.getAttribute("aria-valuetext")).toBe("20");
  fireEvent.pointerDown(dial, pointer(120));
  fireEvent.pointerMove(dial, pointer(156));
  fireEvent.pointerUp(dial, pointer(156));
  expect(input.getAttribute("aria-valuetext")).toBe("20");
  expect(change).toHaveBeenCalledWith(26);
  expect(change).toHaveBeenCalledTimes(1);
});

test("tapping a tick selects a value without dragging", () => {
  render(<Example />);
  const input = screen.getByRole("slider", { name: "How long" });
  const dial = geometry(input);
  expect(dial.querySelectorAll(".dial-ticks g")).toHaveLength(12);
  fireEvent.pointerDown(dial, pointer(180));
  fireEvent.pointerUp(dial, pointer(180));
  expect(input.getAttribute("aria-valuetext")).toBe("30");
});

test("independent pickers keep their labels and controlled values", () => {
  const view = render(
    <>
      <Dial label="First amount" max={10} min={1} onValueChange={ignoreValue} value={2} />
      <Dial label="Second amount" max={10} min={1} onValueChange={ignoreValue} value={3} />
    </>
  );
  const warm = screen.getByRole("slider", { name: "First amount" });
  const cool = screen.getByRole("slider", { name: "Second amount" });
  expect(geometry(warm).querySelectorAll(".dial-ticks g")).toHaveLength(10);
  expect(warm.id).not.toBe(cool.id);
  expect(warm.getAttribute("aria-valuetext")).toBe("2");
  expect(cool.getAttribute("aria-valuetext")).toBe("3");
  view.rerender(
    <Dial label="First amount" max={10} min={1} onValueChange={ignoreValue} value={8} />
  );
  expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe("8");
});

test("dial ticks retain their absolute positions and clamp values below the minimum", () => {
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
    expect(input.getAttribute("aria-valuetext")).toBe(`${expected}`);
  }
});

function ignoreValue() {
  /* Controlled fixture deliberately ignores changes. */
}

test("native changes, unchanged release, and center taps request exactly one value each", () => {
  const change = vi.fn();
  render(<Dial label="Amount" max={60} min={5} onValueChange={change} value={20} />);
  const input = screen.getByRole("slider", { name: "Amount" });
  const dial = geometry(input);
  fireEvent.change(input, { target: { value: "25" } });
  expect(change).toHaveBeenLastCalledWith(25);
  const center = { ...pointer(120), clientX: 150, clientY: 150 };
  fireEvent.pointerDown(dial, center);
  fireEvent.pointerUp(dial, center);
  expect(change).toHaveBeenLastCalledWith(20);
  fireEvent.pointerDown(dial, pointer(120));
  fireEvent.pointerUp(dial, pointer(120));
  expect(change).toHaveBeenLastCalledWith(20);
  expect(change).toHaveBeenCalledTimes(3);
});

test("Escape and lost capture cancel preview without committing", () => {
  const change = vi.fn();
  const view = render(<Dial label="Amount" max={60} min={5} onValueChange={change} value={20} />);
  const input = screen.getByRole("slider", { name: "Amount" });
  const dial = geometry(input);
  for (const [action, value] of [
    ["Escape", 25],
    ["lostcapture", 30],
  ] as const) {
    view.rerender(<Dial label="Amount" max={60} min={5} onValueChange={change} value={20} />);
    fireEvent.pointerDown(dial, pointer(120));
    fireEvent.pointerMove(dial, pointer(156));
    expect(input.getAttribute("aria-valuetext")).toBe("26");
    view.rerender(<Dial label="Amount" max={60} min={5} onValueChange={change} value={value} />);
    if (action === "Escape") {
      fireEvent.keyDown(input, { key: "Escape" });
    } else {
      fireEvent.lostPointerCapture(dial, pointer(156));
    }
    expect(input.getAttribute("aria-valuetext")).toBe(String(value));
    expect(dial.hasAttribute("data-dragging")).toBe(false);
    fireEvent.pointerUp(dial, pointer(156));
  }
  expect(change).not.toHaveBeenCalled();
});

test("disabling a dial cancels the gesture even after it is re-enabled", () => {
  const change = vi.fn();
  const view = render(<Dial label="Amount" max={60} min={5} onValueChange={change} value={20} />);
  const input = screen.getByRole<HTMLInputElement>("slider", { name: "Amount" });
  const dial = geometry(input);
  fireEvent.pointerDown(dial, pointer(120));
  fireEvent.pointerMove(dial, pointer(156));
  expect(input.value).toBe("26");
  view.rerender(
    <Dial disabled label="Amount" max={60} min={5} onValueChange={change} value={35} />
  );
  expect(input.value).toBe("35");
  expect(input.disabled).toBe(true);
  expect(dial.hasAttribute("data-dragging")).toBe(false);
  view.rerender(<Dial label="Amount" max={60} min={5} onValueChange={change} value={35} />);
  fireEvent.pointerUp(dial, pointer(156));
  expect(change).not.toHaveBeenCalled();

  fireEvent.pointerDown(dial, pointer(120));
  fireEvent.pointerUp(dial, pointer(120));
  expect(change).toHaveBeenCalledExactlyOnceWith(20);
});

test("dragging crosses the top continuously and clamps at both ends", () => {
  const change = vi.fn();
  render(<Dial label="Amount" max={60} min={5} onValueChange={change} value={58} />);
  const input = screen.getByRole("slider", { name: "Amount" });
  const dial = geometry(input);
  fireEvent.pointerDown(dial, pointer(348));
  fireEvent.pointerMove(dial, pointer(12));
  expect(input.getAttribute("aria-valuetext")).toBe("60");
  fireEvent.pointerMove(dial, pointer(348));
  expect(input.getAttribute("aria-valuetext")).toBe("56");
  fireEvent.pointerCancel(dial, pointer(348));
  expect(change).not.toHaveBeenCalled();
});

test("zero and negative lower bounds support generic full ranges", () => {
  const change = vi.fn();
  const view = render(
    <Dial label="Brush size" max={100} min={0} onValueChange={change} value={25} />
  );
  let input = screen.getByRole("slider", { name: "Brush size" });
  let dial = geometry(input);
  fireEvent.pointerDown(dial, pointer(90));
  fireEvent.pointerUp(dial, pointer(90));
  expect(change).toHaveBeenLastCalledWith(25);
  fireEvent.keyDown(input, { key: "Home" });
  expect(change).toHaveBeenLastCalledWith(0);
  view.rerender(<Dial label="Offset" max={10} min={-10} onValueChange={change} value={0} />);
  input = screen.getByRole("slider", { name: "Offset" });
  dial = geometry(input);
  fireEvent.pointerDown(dial, pointer(180));
  fireEvent.pointerUp(dial, pointer(180));
  expect(change).toHaveBeenLastCalledWith(0);
});

test("disabled input and nonprimary pointers do not request changes", () => {
  const change = vi.fn();
  const view = render(
    <Dial disabled label="Amount" max={100} min={0} onValueChange={change} value={25} />
  );
  const input = screen.getByRole<HTMLInputElement>("slider", { name: "Amount" });
  const dial = geometry(input);
  expect(input.disabled).toBe(true);
  fireEvent.keyDown(input, { key: "ArrowRight" });
  fireEvent.pointerDown(dial, pointer(180));
  fireEvent.pointerUp(dial, pointer(180));
  view.rerender(<Dial label="Amount" max={100} min={0} onValueChange={change} value={25} />);
  fireEvent.pointerDown(dial, { ...pointer(180), isPrimary: false });
  fireEvent.pointerUp(dial, pointer(180));
  fireEvent.pointerDown(dial, { ...pointer(180), button: 2 });
  fireEvent.pointerUp(dial, pointer(180));
  expect(change).not.toHaveBeenCalled();
});

test.each([
  [1, 1],
  [2, 1],
  [Number.NaN, 10],
  [0, Number.POSITIVE_INFINITY],
])("invalid bounds %s..%s fail clearly", (min, max) => {
  expect(() =>
    render(<Dial label="Amount" max={max} min={min} onValueChange={ignoreValue} value={0} />)
  ).toThrow(RangeError);
});

test("page keys and opposite arrows preserve increments and bounded requests", () => {
  const change = vi.fn();
  render(<Dial label="Amount" max={60} min={5} onValueChange={change} value={20} />);
  const input = screen.getByRole("slider", { name: "Amount" });
  for (const [key, expected] of [
    ["ArrowLeft", 19],
    ["ArrowUp", 21],
    ["PageUp", 25],
    ["PageDown", 15],
    ["Home", 5],
    ["End", 60],
  ] as const) {
    fireEvent.keyDown(input, { key });
    expect(change).toHaveBeenLastCalledWith(expected);
  }
  expect(change).toHaveBeenCalledTimes(6);
});

test("consumer formatting separates visible and accessible value text", () => {
  const { container } = render(
    <Dial
      formatValue={formatVisible}
      formatValueText={formatAccessible}
      label="Brush size"
      max={100}
      min={0}
      onValueChange={ignoreValue}
      value={25}
    />
  );
  expect(screen.getByRole("slider", { name: "Brush size" }).getAttribute("aria-valuetext")).toBe(
    "25 pixels"
  );
  expect(container.querySelector("output")?.textContent).toBe("25 px");
});

function formatVisible(value: number) {
  return `${value} px`;
}

function formatAccessible(value: number) {
  return `${value} pixels`;
}

test("fractional brush opacity uses one step contract for keys, native changes and pointer detents", () => {
  const change = vi.fn();
  render(
    <Dial label="Brush opacity" max={1} min={0} onValueChange={change} step={0.1} value={0.2} />
  );
  const input = screen.getByRole<HTMLInputElement>("slider", { name: "Brush opacity" });
  const dial = geometry(input);
  expect(input.step).toBe("0.1");
  expect(dial.querySelectorAll(".dial-ticks g")).toHaveLength(11);
  for (const [key, expected] of [
    ["ArrowRight", 0.3],
    ["ArrowLeft", 0.1],
    ["PageUp", 0.7],
    ["PageDown", 0],
    ["End", 1],
  ] as const) {
    fireEvent.keyDown(input, { key });
    expect(change).toHaveBeenLastCalledWith(expected);
  }
  fireEvent.change(input, { target: { value: "0.34" } });
  expect(change).toHaveBeenLastCalledWith(0.3);
  fireEvent.pointerDown(dial, pointer(72));
  fireEvent.pointerMove(dial, pointer(119));
  expect(input.getAttribute("aria-valuetext")).toBe("0.3");
  fireEvent.pointerUp(dial, pointer(119));
  expect(change).toHaveBeenLastCalledWith(0.3);
});

test("fractional snapping is relative to min for native, keyboard and pointer requests", () => {
  const change = vi.fn();
  render(
    <Dial
      label="Brush spacing"
      max={1.05}
      min={0.05}
      onValueChange={change}
      step={0.1}
      value={0.25}
    />
  );
  const input = screen.getByRole("slider", { name: "Brush spacing" });
  const dial = geometry(input);
  fireEvent.keyDown(input, { key: "ArrowRight" });
  expect(change).toHaveBeenLastCalledWith(0.35);
  fireEvent.change(input, { target: { value: "0.32" } });
  expect(change).toHaveBeenLastCalledWith(0.35);
  fireEvent.pointerDown(dial, pointer(120));
  fireEvent.pointerUp(dial, pointer(120));
  expect(change).toHaveBeenLastCalledWith(0.35);
});

test("signed fractional ranges share the same min-relative steps", () => {
  const change = vi.fn();
  render(
    <Dial label="Offset" max={0.75} min={-0.25} onValueChange={change} step={0.1} value={-0.15} />
  );
  const input = screen.getByRole("slider", { name: "Offset" });
  fireEvent.keyDown(input, { key: "ArrowRight" });
  expect(change).toHaveBeenLastCalledWith(-0.05);
  const dial = geometry(input);
  fireEvent.pointerDown(dial, pointer(180));
  fireEvent.pointerUp(dial, pointer(180));
  expect(change).toHaveBeenLastCalledWith(0.25);
});

test("tick generation stays bounded for a large representable range", () => {
  render(<Dial label="Amount" max={1e12} min={0} onValueChange={ignoreValue} value={5} />);
  const dial = geometry(screen.getByRole("slider", { name: "Amount" }));
  expect(dial.querySelectorAll(".dial-ticks g").length).toBeLessThanOrEqual(12);
});

test.each([
  [0, 1, 0],
  [0, 1, -0.1],
  [0, 1, Number.NaN],
  [0, 1, Number.POSITIVE_INFINITY],
  [0, 1, 0.3],
  [0, 1, 2],
  [0, 1e20, 1],
  [-1e308, 1e308, 1],
  [1e20, 1e20 + 1e6, 1],
  [0, 1e-110, 1e-111],
])("unsupported range %s..%s with step %s fails clearly", (min, max, step) => {
  expect(() =>
    render(
      <Dial
        label="Amount"
        max={max}
        min={min}
        onValueChange={ignoreValue}
        step={step}
        value={min}
      />
    )
  ).toThrow(RangeError);
});
