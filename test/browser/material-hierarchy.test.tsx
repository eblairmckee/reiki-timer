import { Clock01Icon } from "@hugeicons/core-free-icons";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { blend, converter, wcagContrast } from "culori";
import { afterEach, expect, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import { Button } from "@/components/design-system/button";
import { ButtonGroup } from "@/components/design-system/button-group";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/design-system/dialog";
import { Icon } from "@/components/design-system/icon";
import { Input } from "@/components/design-system/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/design-system/select";
import { Tag } from "@/components/design-system/tag";
import { Textarea } from "@/components/design-system/textarea";
import { TagInput } from "@/components/molecules/tag-input";
import { browserAction, userEvent } from "./react-browser";
import "@/app/styles/global.css";

async function setMedia(overrides: Record<string, string> = {}) {
  const preferences = {
    "forced-colors": "none",
    "prefers-contrast": "no-preference",
    "prefers-reduced-motion": "reduce",
    "prefers-reduced-transparency": "no-preference",
    ...overrides,
  };
  await browserAction(() =>
    cdp().send("Emulation.setEmulatedMedia", {
      features: Object.entries(preferences).map(([name, value]) => ({ name, value })),
    })
  );
  await waitFor(() => {
    for (const [name, value] of Object.entries(preferences)) {
      expect(matchMedia(`(${name}: ${value})`).matches).toBe(true);
    }
  });
}

afterEach(async () => {
  await userEvent.cleanup();
  cleanup();
  await setMedia();
});

function elementWithin(parent: ParentNode, selector: string) {
  const element = parent.querySelector(selector);
  if (!element) {
    throw new Error(`No element matched ${selector}`);
  }
  return element;
}

const faceOf = (button: Element) => elementWithin(button, "[data-frost]");
const parseRgb = converter("rgb");

function rgb(value: string) {
  const color = parseRgb(value);
  if (!color) {
    throw new Error(`Cannot parse browser color ${value}`);
  }
  return color;
}

function paint(element: Element) {
  const style = getComputedStyle(element);
  return {
    backdropFilter: style.backdropFilter,
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage,
    borderColor: style.borderTopColor,
    boxShadow: style.boxShadow,
  };
}

function hasTransition(element: Element) {
  return getComputedStyle(element)
    .transitionDuration.split(",")
    .some((time) => Number.parseFloat(time) > 0);
}

function buttonSurface(button: Element) {
  const group = button.closest('[data-ui="button-group"]');
  const face = getComputedStyle(faceOf(button));
  const body = rgb(getComputedStyle(document.body).backgroundColor);
  return blend([
    body,
    rgb(group ? getComputedStyle(group).backgroundColor : "transparent"),
    rgb(getComputedStyle(button).backgroundColor),
    rgb(face.backgroundColor),
  ]);
}

function expectReadableFace(button: Element, minimumContrast: number) {
  // Compare resolved ink and base fills over the fixture's theme backing.
  const surface = buttonSurface(button);
  const ink = blend([surface, rgb(getComputedStyle(faceOf(button)).color)]);
  expect(wcagContrast(ink, surface)).toBeGreaterThanOrEqual(minimumContrast);
}

function expectVisibleFocus(button: Element) {
  const outline = getComputedStyle(button);
  expect(document.activeElement).toBe(button);
  expect(button.matches(":focus-visible")).toBe(true);
  expect(outline.outlineStyle).toBe("solid");
  expect(Number.parseFloat(outline.outlineWidth)).toBeGreaterThan(0);
  const surface = buttonSurface(button);
  const focus = blend([surface, rgb(outline.outlineColor)]);
  expect(wcagContrast(focus, surface)).toBeGreaterThanOrEqual(3);
}

function ActionFixture({ onActivate }: { onActivate: () => void }) {
  return (
    <>
      <Button appearance="primary">Save draft</Button>
      <Button appearance="primary" aria-label="Start timer" iconOnly>
        <Icon icon={Clock01Icon} />
      </Button>
      <Button appearance="secondary" aria-label="Preview timer" iconOnly>
        <Icon icon={Clock01Icon} />
      </Button>
      <ButtonGroup
        actions={
          <>
            <Button appearance="primary" onClick={onActivate}>
              Save draft
            </Button>
            <Button appearance="secondary" aria-label="Preview timer" iconOnly>
              <Icon icon={Clock01Icon} />
            </Button>
          </>
        }
        aria-label="Timer actions"
        variant="expandable"
      >
        <Button appearance="primary" aria-label="Start timer" iconOnly onClick={onActivate}>
          <Icon icon={Clock01Icon} />
        </Button>
      </ButtonGroup>
    </>
  );
}

test("primary has a denser frost face and grouped actions keep their roles and native focus", async () => {
  const onActivate = vi.fn();
  render(<ActionFixture onActivate={onActivate} />);
  const grouped = within(screen.getByRole("group", { name: "Timer actions" }));
  for (const name of ["Save draft", "Start timer", "Preview timer"]) {
    const [alone] = screen.getAllByRole("button", { name });
    const joined = grouped.getByRole("button", { name });
    expect(paint(faceOf(joined))).toEqual(paint(faceOf(alone)));
    expect(paint(joined)).toEqual(paint(alone));
    expectReadableFace(alone, name === "Save draft" ? 4.5 : 3);
    expectReadableFace(joined, name === "Save draft" ? 4.5 : 3);
  }
  const [primary] = screen.getAllByRole("button", { name: "Start timer" });
  const [secondary] = screen.getAllByRole("button", { name: "Preview timer" });
  const primaryFace = paint(faceOf(primary));
  const secondaryFace = paint(faceOf(secondary));
  expect(primaryFace.backgroundImage).toBe(secondaryFace.backgroundImage);
  expect(primaryFace.backgroundImage).not.toBe("none");
  expect(primaryFace.backdropFilter).toBe(secondaryFace.backdropFilter);
  expect(primaryFace.backdropFilter).not.toBe("none");
  expect(rgb(primaryFace.backgroundColor).alpha ?? 1).toBeGreaterThan(
    rgb(secondaryFace.backgroundColor).alpha ?? 1
  );

  // Enter the grouped controls via real browser Tab navigation from the previous button.
  secondary.focus();
  const word = grouped.getByRole("button", { name: "Save draft" });
  const icon = grouped.getByRole("button", { name: "Start timer" });
  await userEvent.tab();
  expectVisibleFocus(word);
  await userEvent.keyboard("{Enter}");
  await userEvent.tab();
  await userEvent.tab();
  expectVisibleFocus(icon);
  await userEvent.keyboard(" ");
  expect(onActivate).toHaveBeenCalledTimes(2);
});

function FieldFixture() {
  return (
    <div style={{ maxInlineSize: "24rem", padding: "1rem" }}>
      <Input appearance="frost" aria-label="Title" />
      <Textarea aria-label="Notes" rows={1} />
      <Select defaultValue="Personal">
        <SelectTrigger aria-label="Folder">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Personal">Personal</SelectItem>
          <SelectItem value="Shared">Shared</SelectItem>
        </SelectContent>
      </Select>
      <TagInput
        aria-label="Labels"
        onValuesChange={vi.fn()}
        options={["Review"]}
        values={["Draft"]}
      />
      <Tag>Draft</Tag>
      <Dialog>
        <DialogTrigger>Review draft</DialogTrigger>
        <DialogPortal>
          <DialogBackdrop />
          <DialogPopup>
            <DialogTitle>Review draft</DialogTitle>
            <DialogDescription>Check the title before saving.</DialogDescription>
            <DialogClose>Continue editing</DialogClose>
          </DialogPopup>
        </DialogPortal>
      </Dialog>
    </div>
  );
}

function fields(container: HTMLElement) {
  return {
    chip: elementWithin(container, '[data-ui="combobox-chip"]'),
    chipsField: elementWithin(container, '[data-ui="combobox-chips"]'),
    input: screen.getByRole("textbox", { name: "Title" }),
    select: screen.getByRole("combobox", { name: "Folder" }),
    tag: elementWithin(container, '[data-ui="tag"]'),
    textarea: screen.getByRole("textbox", { name: "Notes" }),
  };
}

async function openPopup(trigger: HTMLElement, container: HTMLElement) {
  await userEvent.click(trigger);
  const list = await screen.findByRole("listbox");
  const popup = list.closest('[data-ui="choice-popup"]');
  if (!popup) {
    throw new Error("Missing popup surface surrounding the listbox");
  }
  expect(container.contains(popup)).toBe(false);
  return popup;
}

test.each(["no-preference", "reduce"])(
  "%s motion preserves shared field, tag and popup materials and the distinct dialog surface",
  async (motion) => {
    await setMedia({ "prefers-reduced-motion": motion });
    const { container } = render(<FieldFixture />);
    const { chip, chipsField, input, select, tag, textarea } = fields(container);
    const fieldPaint = paint(input);
    expect(fieldPaint.backdropFilter).not.toBe("none");
    expect(paint(textarea)).toEqual(fieldPaint);
    expect(paint(select)).toEqual(fieldPaint);
    expect(paint(chipsField)).toEqual(fieldPaint);
    const tagPaint = paint(tag);
    expect(tagPaint.backgroundImage).not.toBe("none");
    expect(paint(chip)).toEqual(tagPaint);
    const first = await openPopup(select, container);
    const firstPaint = paint(first);
    const firstTransition = getComputedStyle(first).transition;
    expect(firstPaint.backdropFilter).not.toBe("none");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    const second = await openPopup(screen.getByRole("combobox", { name: "Labels" }), container);
    expect(paint(second)).toEqual(firstPaint);
    expect(getComputedStyle(second).transition).toBe(firstTransition);
    expect(hasTransition(second)).toBe(motion === "no-preference");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await userEvent.click(screen.getByRole("button", { name: "Review draft" }));
    const dialog = await screen.findByRole("dialog", { name: "Review draft" });
    expect(container.contains(dialog)).toBe(false);
    expect(hasTransition(dialog)).toBe(motion === "no-preference");
    const dialogPaint = paint(dialog);
    expect(rgb(dialogPaint.backgroundColor).alpha ?? 1).toBeGreaterThan(
      rgb(firstPaint.backgroundColor).alpha ?? 1
    );
    expect(dialogPaint.boxShadow).not.toBe("none");
    expect(dialogPaint.backdropFilter).not.toBe("none");
  }
);

test.each([
  ["prefers-reduced-transparency", "reduce"],
  ["prefers-contrast", "more"],
  ["forced-colors", "active"],
])("%s gives fields, tags and popup opaque boundaries without blur", async (preference, value) => {
  await setMedia({ [preference]: value });
  const { container } = render(<FieldFixture />);
  const { chip, chipsField, input, select, tag, textarea } = fields(container);
  const actions = render(<ActionFixture onActivate={vi.fn()} />);
  const [primary] = within(actions.container).getAllByRole("button", { name: "Start timer" });
  const [secondary] = within(actions.container).getAllByRole("button", { name: "Preview timer" });
  const popup = await openPopup(select, container);
  for (const surface of [chip, chipsField, input, popup, select, tag, textarea]) {
    expectOpaque(surface);
    const boundary = getComputedStyle(surface);
    expect(boundary.borderTopStyle).toBe("solid");
    expect(Number.parseFloat(boundary.borderTopWidth)).toBeGreaterThan(0);
  }
  for (const action of [primary, secondary]) {
    expectOpaque(faceOf(action));
  }
  await userEvent.keyboard("{Escape}");
  await userEvent.click(screen.getByRole("button", { name: "Review draft" }));
  expectOpaque(await screen.findByRole("dialog", { name: "Review draft" }));
});

function expectOpaque(surface: Element) {
  const style = getComputedStyle(surface);
  expect(style.backdropFilter).toBe("none");
  expect(style.backgroundImage).toBe("none");
  expect(rgb(style.backgroundColor).alpha ?? 1).toBe(1);
}
