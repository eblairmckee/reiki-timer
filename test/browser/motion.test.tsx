import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AnimatePresence } from "motion/react";
import { afterEach, expect, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import { Button } from "../../src/components/design-system/button";
import { ButtonGroup, ButtonGroupSummary } from "../../src/components/design-system/button-group";
import { Reveal } from "../../src/components/design-system/shared/reveal";
import { Switch } from "../../src/components/design-system/switch";
import { browserAction, userEvent } from "./react-browser";
import "../../src/components/design-system/styles/index.css";

async function motionPreference(value: "reduce" | "no-preference") {
  await browserAction(() =>
    cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value }],
    })
  );
  await waitFor(() => {
    expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(value === "reduce");
  });
}

afterEach(async () => {
  await userEvent.pointer({ keys: "[/MouseLeft]", target: document.body });
  await userEvent.cleanup();
  cleanup();
  await motionPreference("reduce");
});

test.each(["solid", "tonal", "ghost", "outline", "link", "text", "etched"] as const)(
  "%s active feedback has no scale movement with reduced motion",
  async (appearance) => {
    await motionPreference("no-preference");
    render(<Button appearance={appearance}>Run</Button>);
    const button = screen.getByRole("button", { name: "Run" });
    await userEvent.pointer({ keys: "[MouseLeft>]", target: button });
    expect(button.matches(":active")).toBe(true);
    if (appearance !== "text" && appearance !== "etched") {
      await waitFor(() => expect(Number(getComputedStyle(button).scale)).toBeCloseTo(0.97));
    }
    await motionPreference("reduce");
    expect(button.matches(":active")).toBe(true);
    expect(getComputedStyle(button).scale).toBe("1");
    expect(getComputedStyle(button).transitionDuration).toBe("0s");
    await userEvent.pointer({ keys: "[/MouseLeft]", target: button });
  }
);

test.each(["frost", "inset"] as const)(
  "%s keeps held feedback while a changed reduced preference stops travel and ripples",
  async (appearance) => {
    await motionPreference("no-preference");
    render(<Button appearance={appearance} aria-label="Preview" iconOnly showActivationHint />);
    const button = screen.getByRole("button", { name: "Preview" });
    const face = button.querySelector<HTMLElement>("[data-frost]");
    if (!face) {
      throw new Error("Missing frost face");
    }
    await userEvent.pointer({ keys: "[MouseLeft>]", target: button });
    await waitFor(() => {
      expect(button.hasAttribute("data-pressed")).toBe(true);
      expect(new DOMMatrixReadOnly(getComputedStyle(face).transform).m22).toBeLessThan(1);
      expect(
        Number(
          getComputedStyle(button.querySelector('[data-ripple="pressure"]') as Element).opacity
        )
      ).toBeGreaterThan(0);
    });
    await motionPreference("reduce");
    await waitFor(() => {
      expect(face.style.transform).toBe("");
      for (const ring of button.querySelectorAll("[data-ripple]")) {
        expect(getComputedStyle(ring).opacity).toBe("0");
      }
    });
    expect(button.hasAttribute("data-pressed")).toBe(true);
    expect(getComputedStyle(face).transform).toBe("none");
    expect(getComputedStyle(face, "::after").opacity).toBe("1");
    expect(getComputedStyle(button).transitionDuration).toBe("0s");
    expect(getComputedStyle(face, "::before").animationName).toBe("none");
    await userEvent.pointer({ keys: "[/MouseLeft]", target: button });
    expect(button.hasAttribute("data-pressed")).toBe(false);
    expect(getComputedStyle(face, "::after").opacity).toBe("0");
    // Cancellation under the same preference also clears the static pressed cue.
    await userEvent.pointer({ keys: "[MouseLeft>]", target: button });
    expect(button.hasAttribute("data-pressed")).toBe(true);
    fireEvent.pointerCancel(button);
    expect(button.hasAttribute("data-pressed")).toBe(false);
    expect(getComputedStyle(face, "::after").opacity).toBe("0");
    await userEvent.pointer({ keys: "[/MouseLeft]", target: button });
  }
);

function RevealFixture({ open }: { open: boolean }) {
  return (
    <>
      <button type="button">Before</button>
      <AnimatePresence>
        {open === true && (
          <Reveal id="motion-panel" key="panel">
            <input aria-label="Panel setting" />
          </Reveal>
        )}
      </AnimatePresence>
      <button type="button">After</button>
    </>
  );
}

test("an interrupted normal-motion Reveal exit excludes focus immediately and can reopen", async () => {
  await motionPreference("no-preference");
  const view = render(<RevealFixture open />);
  const input = screen.getByRole("textbox", { name: "Panel setting" });
  const panel = document.querySelector<HTMLElement>("#motion-panel");
  if (!panel) {
    throw new Error("Missing reveal panel");
  }
  await waitFor(() => expect(getComputedStyle(panel).opacity).toBe("1"));
  screen.getByRole("button", { name: "Before" }).focus();
  view.rerender(<RevealFixture open={false} />);
  expect(panel.isConnected).toBe(true);
  expect(panel.inert).toBe(true);
  expect(panel.getAttribute("aria-hidden")).toBe("true");
  input.focus();
  expect(document.activeElement).not.toBe(input);
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
  view.rerender(<RevealFixture open />);
  expect(document.querySelector<HTMLElement>("#motion-panel")).toBe(panel);
  expect(panel.inert).toBe(false);
  await waitFor(() => expect(getComputedStyle(panel).opacity).toBe("1"));
  input.focus();
  expect(document.activeElement).toBe(input);
});

function thumbX(root: HTMLElement) {
  const thumb = root.querySelector<HTMLElement>('[data-ui="thumb"]');
  if (!thumb) {
    throw new Error("Missing switch thumb");
  }
  return {
    maximum:
      root.clientWidth -
      Number.parseFloat(getComputedStyle(root).paddingLeft) -
      Number.parseFloat(getComputedStyle(root).paddingRight) -
      thumb.offsetWidth,
    x: new DOMMatrixReadOnly(getComputedStyle(thumb).transform).m41,
  };
}

test("rapid Switch toggles settle at the committed value and pointer cancellation restores it", async () => {
  await motionPreference("no-preference");
  const change = vi.fn();
  render(<Switch aria-label="Reminders" onCheckedChange={change} />);
  const toggle = screen.getByRole("switch", { name: "Reminders" });
  // Commit again before the previous spring finishes.
  act(() => {
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    fireEvent.click(toggle);
  });
  expect(change).toHaveBeenCalledTimes(3);
  expect(toggle.getAttribute("aria-checked")).toBe("true");
  await waitFor(() => expect(thumbX(toggle).x).toBeCloseTo(thumbX(toggle).maximum, 1));
  await userEvent.click(toggle);
  await waitFor(() => expect(thumbX(toggle).x).toBeCloseTo(0, 1));
  expect(toggle.getAttribute("aria-checked")).toBe("false");
  let pointerId = 0;
  toggle.addEventListener(
    "pointerdown",
    (event) => {
      ({ pointerId } = event);
    },
    { once: true }
  );
  await userEvent.pointer({ keys: "[MouseLeft>]", target: toggle });
  const bounds = toggle.getBoundingClientRect();
  fireEvent.pointerMove(toggle, {
    clientX: bounds.right,
    clientY: bounds.y + bounds.height / 2,
    pointerId,
  });
  expect(toggle.hasAttribute("data-dragging")).toBe(true);
  expect(thumbX(toggle).x).toBeGreaterThan(0);
  const commits = change.mock.calls.length;
  fireEvent.pointerCancel(toggle, { pointerId });
  expect(toggle.hasAttribute("data-dragging")).toBe(false);
  expect(toggle.hasAttribute("data-pressed")).toBe(false);
  await userEvent.pointer({ keys: "[/MouseLeft]", target: toggle });
  await waitFor(() => expect(thumbX(toggle).x).toBeCloseTo(0, 1));
  expect(toggle.getAttribute("aria-checked")).toBe("false");
  expect(change).toHaveBeenCalledTimes(commits);
});

function ExpandableActions({ expanded, wrapped }: { expanded: boolean; wrapped: boolean }) {
  const group = (
    <ButtonGroup
      actions={
        expanded ? (
          <>
            <Button aria-label="Edit timer" iconOnly />
            <Button aria-label="Finish timer" iconOnly />
          </>
        ) : undefined
      }
      aria-label="Session actions"
      variant="expandable"
    >
      <Button aria-label="Resume timer" iconOnly />
    </ButtonGroup>
  );
  return wrapped ? (
    <div style={{ display: "grid", justifyItems: "end", width: "100%" }}>
      <ButtonGroupSummary>{group}</ButtonGroupSummary>
    </div>
  ) : (
    group
  );
}

test.each([false, true])(
  "normal-motion expandable groups reveal newly supplied actions at their full width (summary wrapper: %s)",
  async (wrapped) => {
    await motionPreference("no-preference");
    const view = render(<ExpandableActions expanded={false} wrapped={wrapped} />);
    const group = screen.getByRole("group", { name: "Session actions" });
    const initialWidth = group.getBoundingClientRect().width;
    view.rerender(<ExpandableActions expanded wrapped={wrapped} />);
    const reveal = group.querySelector<HTMLElement>('[data-slot="button-group-reveal"]');
    const items = group.querySelector<HTMLElement>('[data-slot="button-group-items"]');
    if (!(reveal && items)) {
      throw new Error("Missing expandable group actions");
    }
    await waitFor(() => {
      const visible = reveal.getBoundingClientRect();
      const content = items.getBoundingClientRect();
      expect(content.width).toBeGreaterThan(0);
      expect(visible.width).toBeGreaterThanOrEqual(content.width - 1);
      expect(visible.left).toBeLessThanOrEqual(content.left + 1);
      expect(visible.right).toBeGreaterThanOrEqual(content.right - 1);
      expect(group.getBoundingClientRect().width).toBeGreaterThan(initialWidth);
      expect(getComputedStyle(reveal).opacity).toBe("1");
    });
    await userEvent.click(screen.getByRole("button", { name: "Edit timer" }));
  }
);
