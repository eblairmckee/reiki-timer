import { Clock01Icon } from "@hugeicons/core-free-icons";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { Button } from "../../src/components/design-system/button";
import { ButtonGroup, ButtonGroupSummary } from "../../src/components/design-system/button-group";
import { Dial } from "../../src/components/design-system/dial";
import { Icon } from "../../src/components/design-system/icon";
import { Input } from "../../src/components/design-system/input";
import {
  InputGroupAffix,
  InputGroupIcon,
  InputGroupWrapper,
} from "../../src/components/design-system/input-group";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "../../src/components/design-system/number-field";
import "../../src/components/design-system/styles/index.css";
import { Switch } from "../../src/components/design-system/switch";

// Exercise the installed public families' module/CSS graph, including unconsumed entrypoints.
const entrypoints = import.meta.glob("../../src/components/design-system/*/index.tsx", {
  eager: true,
});

afterEach(cleanup);

test("Vite loads every installed design-system entrypoint", () => {
  expect(Object.keys(entrypoints).length).toBeGreaterThan(0);
  for (const module of Object.values(entrypoints)) {
    expect(Object.keys(module as object).length).toBeGreaterThan(0);
  }
});

test("input group loads wrapper, icon and affix styles with native input semantics", async () => {
  const change = vi.fn();
  const { container } = render(
    <InputGroupWrapper>
      <InputGroupIcon aria-hidden="true">
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <title>Decorative currency icon</title>
        </svg>
      </InputGroupIcon>
      <Input aria-label="Amount" name="amount" onChange={change} required />
      <InputGroupAffix>USD</InputGroupAffix>
    </InputGroupWrapper>
  );
  const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Amount" });
  const wrapper = input.closest("label");
  const icon = container.querySelector("svg");
  const affix = screen.getByText("USD");
  expect(wrapper).not.toBeNull();
  expect(icon).not.toBeNull();
  if (!(wrapper && icon)) {
    throw new Error("Input group did not render its label and icon");
  }
  expect(getComputedStyle(wrapper).display).toBe("flex");
  expect(getComputedStyle(input).borderTopStyle).toBe("none");
  expect(Number.parseFloat(getComputedStyle(icon).width)).toBeGreaterThan(0);
  expect(getComputedStyle(affix).display).toBe("flex");
  expect(Number.parseFloat(getComputedStyle(affix).borderLeftWidth)).toBeGreaterThan(0);
  expect(input.name).toBe("amount");
  expect(input.required).toBe(true);
  await userEvent.setup({ document }).type(input, "12");
  expect(input.value).toBe("12");
  expect(change).toHaveBeenCalledTimes(2);
  expect(document.activeElement).toBe(input);
});

test("number field loads group and scrub styles with bounded keyboard/button input", async () => {
  render(
    <NumberField defaultValue={2} max={3} min={1}>
      <NumberFieldScrubArea>Minutes</NumberFieldScrubArea>
      <NumberFieldGroup>
        <NumberFieldDecrement aria-label="Decrease minutes">−</NumberFieldDecrement>
        <NumberFieldInput aria-label="Minutes" />
        <NumberFieldIncrement aria-label="Increase minutes">+</NumberFieldIncrement>
      </NumberFieldGroup>
    </NumberField>
  );
  const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Minutes" });
  const group = input.parentElement;
  if (!group) {
    throw new Error("Number field did not render a control group");
  }
  expect(getComputedStyle(group).display).toBe("flex");
  expect(group.getBoundingClientRect().width).toBeGreaterThan(input.getBoundingClientRect().width);
  expect(getComputedStyle(input).textAlign).toBe("center");
  expect(getComputedStyle(screen.getByText("Minutes")).cursor).toBe("ew-resize");
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("button", { name: "Increase minutes" }));
  expect(input.value).toBe("3");
  expect(screen.getByRole<HTMLButtonElement>("button", { name: "Increase minutes" }).disabled).toBe(
    true
  );
  await user.click(input);
  await user.keyboard("{ArrowDown}");
  expect(input.value).toBe("2");
  await user.click(screen.getByRole("button", { name: "Decrease minutes" }));
  expect(input.value).toBe("1");
  expect(screen.getByRole<HTMLButtonElement>("button", { name: "Decrease minutes" }).disabled).toBe(
    true
  );
});

test("text and number fields share their surface while keeping their focus and disabled policies", async () => {
  const view = render(
    <div style={{ color: "var(--sys-color-on-surface)" }}>
      <Input aria-label="Title" />
      <InputGroupWrapper>
        <Input aria-label="Subtitle" />
      </InputGroupWrapper>
      <NumberField defaultValue={2}>
        <NumberFieldGroup>
          <NumberFieldDecrement aria-label="Decrease count">−</NumberFieldDecrement>
          <NumberFieldInput aria-label="Count" />
          <NumberFieldIncrement aria-label="Increase count">+</NumberFieldIncrement>
        </NumberFieldGroup>
      </NumberField>
    </div>
  );
  const text = screen.getByRole<HTMLInputElement>("textbox", { name: "Title" });
  const groupedText = screen.getByRole<HTMLInputElement>("textbox", { name: "Subtitle" });
  const number = screen.getByRole<HTMLInputElement>("textbox", { name: "Count" });
  const groupSurface = groupedText.parentElement;
  const numberSurface = number.parentElement;
  if (!(groupSurface && numberSurface)) {
    throw new Error("Expected the grouped field surfaces");
  }
  const properties = [
    "height",
    "background-color",
    "border-top",
    "border-radius",
    "box-shadow",
    "transition",
  ];
  const commonSurface = Object.fromEntries(
    properties.map((property) => [property, getComputedStyle(text).getPropertyValue(property)])
  );
  const restingShadow = getComputedStyle(text).boxShadow;
  for (const surface of [text, groupSurface, numberSurface]) {
    for (const property of properties) {
      expect(getComputedStyle(surface).getPropertyValue(property)).toBe(commonSurface[property]);
    }
    // Keep state assertions independent of the feedback transition's timing.
    surface.style.transitionDuration = "0s";
  }
  const user = userEvent.setup({ document });
  await user.click(text);
  const focusedShadow = getComputedStyle(text).boxShadow;
  const focusedBorder = getComputedStyle(text).borderTopColor;
  expect(focusedShadow).not.toBe(restingShadow);
  await user.click(groupedText);
  expect(getComputedStyle(groupSurface).boxShadow).toBe(focusedShadow);
  expect(getComputedStyle(groupSurface).borderTopColor).toBe(focusedBorder);
  await user.click(number);
  expect(getComputedStyle(numberSurface).boxShadow).toBe(focusedShadow);
  expect(getComputedStyle(numberSurface).borderTopColor).toBe(focusedBorder);
  const increment = screen.getByRole("button", { name: "Increase count" });
  increment.focus();
  expect(document.activeElement).toBe(increment);
  expect(getComputedStyle(numberSurface).boxShadow).toBe(restingShadow);

  view.rerender(
    <>
      <Input aria-label="Title" disabled />
      <InputGroupWrapper>
        <Input aria-label="Subtitle" disabled />
      </InputGroupWrapper>
      <NumberField defaultValue={2} disabled>
        <NumberFieldGroup>
          <NumberFieldInput aria-label="Count" />
        </NumberFieldGroup>
      </NumberField>
    </>
  );
  const disabledFill = getComputedStyle(
    screen.getByRole("textbox", { name: "Title" })
  ).backgroundColor;
  for (const name of ["Title", "Subtitle", "Count"]) {
    const input = screen.getByRole<HTMLInputElement>("textbox", { name });
    const surface = name === "Title" ? input : input.parentElement;
    if (!surface) {
      throw new Error("Expected a disabled field surface");
    }
    expect(input.disabled).toBe(true);
    expect(getComputedStyle(surface).backgroundColor).toBe(disabledFill);
    expect(getComputedStyle(surface).boxShadow).toBe("none");
    expect(getComputedStyle(surface).borderTopColor).toBe("rgba(0, 0, 0, 0)");
  }
});

test("the public frost inset sizes the face inside a stationary action", () => {
  const view = render(<Button aria-label="Start" iconOnly />);
  const button = screen.getByRole("button", { name: "Start" });
  const face = button.querySelector("[data-frost]");
  if (!face) {
    throw new Error("Expected a frost face");
  }
  const target = button.getBoundingClientRect().width;
  const original = face.getBoundingClientRect().width;
  expect(target).toBeGreaterThan(0);
  expect(original).toBe(target);
  expect(getComputedStyle(face).backdropFilter).toBe(
    getComputedStyle(document.documentElement).getPropertyValue("--sys-filter-frost").trim()
  );
  expect(getComputedStyle(face).backgroundImage).toContain("linear-gradient");
  expect(getComputedStyle(button).boxSizing).toBe("border-box");
  expect(getComputedStyle(button).padding).toBe("0px");
  view.rerender(<Button appearance="inset" aria-label="Start" iconOnly />);
  const inset =
    target *
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--sys-ratio-frost-inset")
    );
  expect(Number.parseFloat(getComputedStyle(button).padding)).toBeCloseTo(inset);
  expect(button.getBoundingClientRect().width).toBe(target);
  expect(face.getBoundingClientRect().width).toBeCloseTo(original - inset * 2, 1);
  expect(button.querySelector('[data-ripple="pressure"]')).toBeTruthy();
  expect(button.querySelector('[data-ripple="release"]')).toBeTruthy();
});

test("a link-style action uses its intent ink and retains a transparent face", () => {
  render(
    <Button appearance="link" intent="error">
      Retry
    </Button>
  );
  const button = screen.getByRole("button", { name: "Retry" });
  const reference = document.createElement("span");
  reference.style.color = "var(--sys-color-error)";
  button.append(reference);
  expect(getComputedStyle(button).color).toBe(getComputedStyle(reference).color);
  expect(getComputedStyle(button).backgroundColor).toBe("rgba(0, 0, 0, 0)");
});

test("inset word actions expose a well and retain consumer sizing", () => {
  const view = render(<Button>Apply</Button>);
  const button = screen.getByRole("button", { name: "Apply" });
  const { height, width } = button.getBoundingClientRect();
  view.rerender(<Button appearance="inset">Apply</Button>);
  expect(Number.parseFloat(getComputedStyle(button).padding)).toBeGreaterThan(0);
  expect(button.getBoundingClientRect().height).toBe(height);
  expect(button.getBoundingClientRect().width).toBeCloseTo(width, 1);
  button.style.setProperty("--cmp-space-button-frost-inset", "6px");
  expect(getComputedStyle(button).padding).toBe("6px");
  expect(button.getBoundingClientRect().height).toBe(height);
  expect(button.getBoundingClientRect().width).toBeCloseTo(width, 1);
});

test("a brush-size consumer gets the public dial material styles", () => {
  render(<Dial label="Brush size" max={100} min={0} onValueChange={vi.fn()} value={25} />);
  const input = screen.getByRole<HTMLInputElement>("slider", { name: "Brush size" });
  const well = input.parentElement;
  const face = well?.querySelector("[data-frost]");
  if (!(well && face)) {
    throw new Error("Expected the default dial well and face");
  }
  expect(getComputedStyle(well).cursor).toBe("grab");
  expect(getComputedStyle(well).boxShadow).toContain("inset");
  expect(getComputedStyle(face).borderRadius).toBe("50%");
  expect(getComputedStyle(face).backdropFilter).toBe(
    getComputedStyle(document.documentElement).getPropertyValue("--sys-filter-frost").trim()
  );
  expect(getComputedStyle(face).backgroundImage).toContain("linear-gradient");
});

test("choosing an option preserves its depth until the caller requests an inset", () => {
  const view = render(<Button aria-pressed={false}>Snap to grid</Button>);
  const option = screen.getByRole("button", { name: "Snap to grid" });
  const { height } = option.getBoundingClientRect();
  const face = option.querySelector("[data-frost]");
  if (!face) {
    throw new Error("Expected the selectable word action's face");
  }
  const ink = getComputedStyle(face).color;
  const fill = getComputedStyle(face).backgroundColor;
  expect(getComputedStyle(option).padding).toBe("0px");
  view.rerender(<Button aria-pressed>Snap to grid</Button>);
  expect(getComputedStyle(face).color).toBe(ink);
  expect(getComputedStyle(face).backgroundColor).not.toBe(fill);
  expect(getComputedStyle(option).padding).toBe("0px");
  expect(getComputedStyle(option, "::after").boxShadow).not.toBe("none");
  view.rerender(
    <Button appearance="inset" aria-pressed>
      Snap to grid
    </Button>
  );
  expect(Number.parseFloat(getComputedStyle(option).padding)).toBeGreaterThan(0);
  expect(option.getBoundingClientRect().height).toBe(height);
});

test("joined words retain their light face and inset focus follows each control's ink", () => {
  render(
    <>
      <Button>Standalone</Button>
      <ButtonGroup
        actions={<Button>Edit document</Button>}
        aria-label="Document actions"
        variant="expandable"
      >
        <Button aria-label="Play document" iconOnly />
      </ButtonGroup>
    </>
  );
  const standalone = screen
    .getByRole("button", { name: "Standalone" })
    .querySelector("[data-frost]");
  if (!standalone) {
    throw new Error("Expected the standalone action's face");
  }
  for (const name of ["Edit document", "Play document"]) {
    const button = screen.getByRole("button", { name });
    const face = button.querySelector("[data-frost]");
    if (!face) {
      throw new Error("Expected each joined action's face");
    }
    button.focus();
    expect(getComputedStyle(button).outlineColor).toBe(getComputedStyle(face).color);
    if (name === "Edit document") {
      expect(getComputedStyle(face).backgroundColor).toBe(
        getComputedStyle(standalone).backgroundColor
      );
      expect(getComputedStyle(face).color).toBe(getComputedStyle(standalone).color);
    }
  }
});

test("a keyboard-operated switch gets its track and thumb from the system", async () => {
  render(<Switch aria-label="Show guides" />);
  const toggle = screen.getByRole("switch", { name: "Show guides" });
  const thumb = toggle.querySelector('[data-ui="thumb"]');
  if (!thumb) {
    throw new Error("Expected a switch thumb");
  }
  const { width, height } = toggle.getBoundingClientRect();
  expect(height).toBeGreaterThan(0);
  expect(width).toBeCloseTo(height * 2);
  expect(getComputedStyle(thumb).borderRadius).toBe("50%");
  const user = userEvent.setup({ document });
  toggle.focus();
  await user.keyboard(" ");
  expect(toggle.getAttribute("aria-checked")).toBe("true");
});

test("one scoped frost treatment reaches the action, switch, summary and backing", () => {
  const { container } = render(
    <div>
      <ButtonGroupSummary summary="Six pages">
        <Button appearance="inset" aria-label="Edit" iconOnly />
      </ButtonGroupSummary>
      <Switch aria-label="Show guides" />
      <span data-blurred-background="inset">Saved</span>
    </div>
  );
  const backing = screen.getByText("Saved");
  const originalShadow = getComputedStyle(backing).boxShadow;
  container.style.setProperty("--sys-filter-frost", "blur(7px)");
  container.style.setProperty("--sys-ratio-frost-inset", "0.1");
  container.style.setProperty("--sys-color-well-shade", "var(--ref-color-paper)");
  try {
    const summary = container.querySelector(".button-group-summary-panel-surface");
    const faces = container.querySelectorAll("[data-frost]");
    if (!summary || faces.length !== 2) {
      throw new Error("Expected both frosted controls and the summary surface");
    }
    for (const surface of [...faces, summary, backing]) {
      expect(getComputedStyle(surface).backdropFilter).toBe("blur(7px)");
    }
    expect(getComputedStyle(backing).boxShadow).not.toBe(originalShadow);
    expect(getComputedStyle(summary).boxShadow).toBe(getComputedStyle(backing).boxShadow);
    for (const control of [
      screen.getByRole("button", { name: "Edit" }),
      screen.getByRole("switch"),
    ]) {
      expect(Number.parseFloat(getComputedStyle(control).paddingLeft)).toBeCloseTo(
        control.getBoundingClientRect().height * 0.1
      );
    }
  } finally {
    container.removeAttribute("style");
  }
});

test("an action icon is decorative beside its caller-owned accessible name", () => {
  const { container } = render(
    <Button aria-label="Schedule document" iconOnly>
      <Icon icon={Clock01Icon} ink="control" />
    </Button>
  );
  const glyph = container.querySelector("svg");
  expect(glyph?.getAttribute("aria-hidden")).toBe("true");
  expect(screen.getByRole("button", { name: "Schedule document" })).toBeTruthy();
  expect(screen.queryByRole("img")).toBeNull();
});

test("a narrow document summary aligns its details with the trailing word action", async () => {
  const { container } = render(
    <div style={{ width: 350 }}>
      <ButtonGroupSummary
        details={{ content: <p>Seven pages ready</p>, label: "Document overview" }}
        summary={<span data-ink="summary">20 pages</span>}
      >
        <Button>Print</Button>
      </ButtonGroupSummary>
    </div>
  );
  const surface = container.querySelector(".button-group-summary-panel-surface");
  expect(surface).toBeTruthy();
  if (!surface) {
    throw new Error("Expected summary surface");
  }
  const user = userEvent.setup({ document });
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Document overview" }));
  await user.keyboard("{Enter}");
  const fold = screen.getByText("Seven pages ready").parentElement;
  const print = screen.getByRole("button", { name: "Print" });
  if (!fold) {
    throw new Error("Expected expanded summary details");
  }
  // The fold aligns with the actual trailing control, including word buttons.
  expect(fold.getBoundingClientRect().right).toBeCloseTo(print.getBoundingClientRect().right, 1);
  expect(fold.getBoundingClientRect().top).toBeCloseTo(surface.getBoundingClientRect().bottom, 1);
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByText("Seven pages ready")).toBeNull());
});
