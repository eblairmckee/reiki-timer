import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Switch } from ".";

function startDrag(element: HTMLElement, x = 20) {
  const thumb = element.querySelector<HTMLElement>('[data-ui="thumb"]');
  if (!thumb) throw new Error("Missing switch thumb");
  // happy-dom has no layout engine. These are the actual geometry inputs to the gesture.
  element.style.padding = "6px";
  Object.defineProperty(element, "clientWidth", { configurable: true, value: 200 });
  Object.defineProperty(thumb, "offsetWidth", { configurable: true, value: 86 });
  fireEvent.pointerDown(element, {
    pointerId: 1,
    button: 0,
    isPrimary: true,
    clientX: x,
    clientY: 20,
  });
}

describe("glass switch", () => {
  test("tap and keyboard each commit once", async () => {
    const onChange = mock();
    render(<Switch aria-label="Chime" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch", { name: "Chime" });
    const user = userEvent.setup({ document });
    await user.pointer({ target: control, keys: "[MouseLeft>]" });
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
    const onChange = mock();
    render(<Switch aria-label="Chime" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch");
    startDrag(control);
    fireEvent.pointerMove(control, { pointerId: 1, clientX: 100, clientY: 20 });
    expect(control.getAttribute("aria-checked")).toBe("false");
    fireEvent.pointerUp(control, { pointerId: 1, clientX: 100, clientY: 20 });
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("cancelled drag does not change state", () => {
    const onChange = mock();
    render(<Switch aria-label="Chime" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch");
    startDrag(control);
    fireEvent.pointerMove(control, { pointerId: 1, clientX: 100, clientY: 20 });
    fireEvent.pointerCancel(control, { pointerId: 1 });
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(control.hasAttribute("data-dragging")).toBe(false);
    expect(control.hasAttribute("data-pressed")).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("a short drag stays on the current side", () => {
    const onChange = mock();
    render(<Switch aria-label="Chime" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch");
    startDrag(control);
    fireEvent.pointerMove(control, { pointerId: 1, clientX: 35, clientY: 20 });
    fireEvent.pointerUp(control, { pointerId: 1 });
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("consumer cancellation and controlled updates retain the Base UI contract", () => {
    const onChange = mock((_checked, details) => details.cancel());
    const view = render(<Switch aria-label="Chime" onCheckedChange={onChange} />);
    const control = screen.getByRole("switch");
    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
    view.rerender(<Switch aria-label="Chime" checked onCheckedChange={onChange} />);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test("disabled and read-only switches ignore drag and click", () => {
    const onChange = mock();
    render(
      <>
        <Switch aria-label="Disabled" disabled onCheckedChange={onChange} />
        <Switch aria-label="Read only" readOnly onCheckedChange={onChange} />
      </>,
    );
    for (const control of screen.getAllByRole("switch")) {
      startDrag(control);
      fireEvent.pointerMove(control, { pointerId: 1, clientX: 100, clientY: 20 });
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
        <Switch aria-label="First" ref={root} inputRef={input} />
        <Switch aria-label="Second" />
      </>,
    );
    fireEvent.click(screen.getByRole("switch", { name: "First" }));
    expect(root.current).toBe(screen.getByRole("switch", { name: "First" }));
    expect(input.current?.checked).toBe(true);
    expect(screen.getByRole("switch", { name: "Second" }).getAttribute("aria-checked")).toBe(
      "false",
    );
  });
});
