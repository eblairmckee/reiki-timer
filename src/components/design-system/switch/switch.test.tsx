import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Switch } from ".";

function startDrag(element: HTMLElement, x = 20) {
  const thumb = element.querySelector<HTMLElement>('[data-ui="thumb"]');
  if (!thumb) {
    throw new Error("Missing switch thumb");
  }
  // happy-dom has no layout engine. These are the actual geometry inputs to the gesture.
  element.style.padding = "6px";
  Object.defineProperty(element, "clientWidth", { configurable: true, value: 200 });
  Object.defineProperty(thumb, "offsetWidth", { configurable: true, value: 86 });
  fireEvent.pointerDown(element, {
    button: 0,
    clientX: x,
    clientY: 20,
    isPrimary: true,
    pointerId: 1,
  });
}

describe("glass switch", () => {
  test("tap and keyboard each commit once", async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Show guides" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch", { name: "Show guides" });
    const user = userEvent.setup({ document });
    await user.pointer({ keys: "[MouseLeft>]", target: control });
    expect(control.hasAttribute("data-pressed")).toBe(true);
    await user.pointer({ keys: "[/MouseLeft]" });
    expect(control.hasAttribute("data-pressed")).toBe(false);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(control.hasAttribute("data-pressed")).toBe(false);
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  test("drag commits on release and suppresses the trailing click", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Show guides" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch");
    startDrag(control);
    fireEvent.pointerMove(control, { clientX: 100, clientY: 20, pointerId: 1 });
    expect(control.getAttribute("aria-checked")).toBe("false");
    fireEvent.pointerUp(control, { clientX: 100, clientY: 20, pointerId: 1 });
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("cancelled drag does not change state", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Show guides" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch");
    startDrag(control);
    fireEvent.pointerMove(control, { clientX: 100, clientY: 20, pointerId: 1 });
    fireEvent.pointerCancel(control, { pointerId: 1 });
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(control.hasAttribute("data-dragging")).toBe(false);
    expect(control.hasAttribute("data-pressed")).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("a short drag stays on the current side", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Show guides" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch");
    startDrag(control);
    fireEvent.pointerMove(control, { clientX: 35, clientY: 20, pointerId: 1 });
    fireEvent.pointerUp(control, { pointerId: 1 });
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("consumer cancellation and controlled updates retain the Base UI contract", () => {
    const onChange = vi.fn((_checked, details) => details.cancel());
    const view = render(<Switch aria-label="Show guides" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch");
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
    view.rerender(<Switch aria-label="Show guides" checked onCheckedChange={onChange} />);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("disabled and read-only switches ignore drag and click", () => {
    const onChange = vi.fn();
    render(
      <>
        <Switch aria-label="Disabled" disabled onCheckedChange={onChange} />
        <Switch aria-label="Read only" onCheckedChange={onChange} readOnly />
      </>
    );
    for (const control of screen.getAllByRole("switch")) {
      startDrag(control);
      fireEvent.pointerMove(control, { clientX: 100, clientY: 20, pointerId: 1 });
      fireEvent.pointerUp(control, { pointerId: 1 });
      fireEvent.click(control);
      expect(control.getAttribute("aria-checked")).toBe("false");
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  test("instances are independent and forward root and input refs", () => {
    const root = createRef<HTMLElement>();
    const input = createRef<HTMLInputElement>();
    render(
      <>
        <Switch aria-label="First" inputRef={input} ref={root} />
        <Switch aria-label="Second" />
      </>
    );
    fireEvent.click(screen.getByRole("switch", { name: "First" }));
    expect(root.current).toBe(screen.getByRole("switch", { name: "First" }));
    expect(input.current?.checked).toBe(true);
    expect(screen.getByRole("switch", { name: "Second" }).getAttribute("aria-checked")).toBe(
      "false"
    );
  });
});
