import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import { Dial } from "../../src/components/design-system/dial";
import { browserAction, userEvent } from "./react-browser";
import "../../src/components/design-system/styles/index.css";

async function setMotionPreference(value: "reduce" | "no-preference") {
  await browserAction(() =>
    cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value }],
    })
  );
}

afterEach(async () => {
  await userEvent.pointer({ keys: "[/MouseLeft]", target: document.body });
  await userEvent.cleanup();
  cleanup();
  await setMotionPreference("reduce");
});

async function previewHalfTurn(input: HTMLInputElement) {
  const { clientWidth: width, clientHeight: height } = input;
  await userEvent.pointer([
    { coords: { x: width * 0.75, y: height / 2 }, keys: "[MouseLeft>]", target: input },
    { coords: { x: width / 2, y: height * 0.75 }, target: input },
  ]);
  expect(input.value).toBe("50");
}

async function expectDialPosition(input: HTMLInputElement, value: number) {
  const dial = input.closest(".dial");
  const rotor = dial?.querySelector(".dial-rotor");
  const output = dial?.querySelector("output");
  if (!(rotor && output)) {
    throw new Error("Missing dial indicator or value display");
  }
  const angle = (value / 100) * 2 * Math.PI;
  expect(input.value).toBe(String(value));
  expect(output.textContent).toBe(String(value));
  await waitFor(() => {
    const rotation = new DOMMatrixReadOnly(getComputedStyle(rotor).transform);
    expect(rotation.m11).toBeCloseTo(Math.cos(angle));
    expect(rotation.m12).toBeCloseTo(Math.sin(angle));

    const control = input.getBoundingClientRect();
    const label = output.getBoundingClientRect();
    const dx = label.x + label.width / 2 - (control.x + control.width / 2);
    const dy = label.y + label.height / 2 - (control.y + control.height / 2);
    const gap = Math.hypot(dx, dy);
    expect(gap).toBeGreaterThan(control.width / 2);
    expect(dx / gap).toBeCloseTo(Math.sin(angle));
    expect(dy / gap).toBeCloseTo(-Math.cos(angle));
  });
}

test.each(["reduce", "no-preference"] as const)(
  "a declined dial request restores the controlled indicator and label with motion preference %s",
  async (preference) => {
    await setMotionPreference(preference);
    const change = vi.fn();
    render(<Dial label="Opacity" max={100} min={0} onValueChange={change} value={25} />);
    const input = screen.getByRole<HTMLInputElement>("slider", { name: "Opacity" });
    await previewHalfTurn(input);
    await expectDialPosition(input, 50);
    await userEvent.pointer("[/MouseLeft]");
    expect(change).toHaveBeenCalledExactlyOnceWith(50);
    await expectDialPosition(input, 25);
  }
);

test.each(["Escape", "disable", "release"] as const)(
  "%s restores the parent value supplied during a dial drag",
  async (action) => {
    const change = vi.fn();
    const view = render(
      <Dial label="Opacity" max={100} min={0} onValueChange={change} value={25} />
    );
    const input = screen.getByRole<HTMLInputElement>("slider", { name: "Opacity" });
    await previewHalfTurn(input);
    view.rerender(
      <Dial
        disabled={action === "disable"}
        label="Opacity"
        max={100}
        min={0}
        onValueChange={change}
        value={75}
      />
    );
    if (action === "Escape") {
      await userEvent.keyboard("{Escape}");
    }
    await userEvent.pointer("[/MouseLeft]");
    if (action === "release") {
      expect(change).toHaveBeenCalledExactlyOnceWith(50);
    } else {
      expect(change).not.toHaveBeenCalled();
    }
    await expectDialPosition(input, 75);
  }
);
