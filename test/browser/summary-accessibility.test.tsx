import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useId, useState } from "react";
import { afterEach, expect, test } from "vitest";
import { cdp, page } from "vitest/browser";
import { Button } from "../../src/components/design-system/button";
import { ButtonGroupSummary } from "../../src/components/design-system/button-group";
import { Collapsible, CollapsiblePanel } from "../../src/components/design-system/collapsible";
import { Switch } from "../../src/components/design-system/switch";
import { browserAction, userEvent } from "./react-browser";
import "../../src/components/design-system/styles/index.css";

const documentPages = Array.from({ length: 30 }, (_, index) => `Page ${index + 1}: ready to print`);
const originalViewport = { height: innerHeight, width: innerWidth };

afterEach(async () => {
  await userEvent.cleanup();
  cleanup();
  await browserAction(() => cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false }));
  await page.viewport(originalViewport.width, originalViewport.height);
});

function SummaryFixture() {
  return (
    <div style={{ margin: "1rem", maxWidth: "100%" }}>
      <button type="button">Before summary</button>
      <ButtonGroupSummary
        details={{
          content: (
            <section
              aria-label="Document page details"
              style={{ maxHeight: "8rem", overflowY: "auto", padding: "1rem" }}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: A named bounded scroll region needs keyboard focus for native scrolling.
              tabIndex={0}
            >
              {documentPages.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </section>
          ),
          label: "Document overview",
        }}
        summary={<span data-ink="summary">30 pages</span>}
      >
        <Button>Print document</Button>
      </ButtonGroupSummary>
      <button style={{ marginTop: "12rem" }} type="button">
        Outside summary
      </button>
    </div>
  );
}

async function expectClosed() {
  await waitFor(() =>
    expect(screen.queryByRole("region", { name: "Document page details" })).toBeNull()
  );
  expect(
    screen.getByRole("button", { name: "Document overview" }).getAttribute("aria-expanded")
  ).toBe("false");
}

test.each(["{Enter}", " "])(
  "native summary toggle opens by %j and Escape restores focus from scrollable details",
  async (key) => {
    await page.viewport(390, 700);
    render(<SummaryFixture />);
    const trigger = screen.getByRole<HTMLButtonElement>("button", { name: "Document overview" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.type).toBe("button");
    screen.getByRole("button", { name: "Before summary" }).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    await expectClosed();

    await userEvent.keyboard(key);
    const region = await screen.findByRole("region", { name: "Document page details" });
    await userEvent.tab();
    expect(document.activeElement).toBe(region);
    expect(region.scrollHeight).toBeGreaterThan(region.clientHeight);
    const bounds = region.getBoundingClientRect();
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(innerWidth);
    // Native scroll targeting settles after focus/layout is painted, beyond the React flush.
    await browserAction(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(region.scrollTop).toBeGreaterThan(0));
    await userEvent.keyboard("{Escape}");
    await expectClosed();
    expect(document.activeElement).toBe(trigger);
  }
);

test("click activation stays open through details focus and closes on Tab leave or outside activation", async () => {
  render(<SummaryFixture />);
  const trigger = screen.getByRole("button", { name: "Document overview" });
  await userEvent.click(trigger);
  const region = await screen.findByRole("region", { name: "Document page details" });
  await userEvent.tab();
  expect(document.activeElement).toBe(region);
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Print document" }));
  await expectClosed();

  await userEvent.click(trigger);
  await screen.findByRole("region", { name: "Document page details" });
  await userEvent.click(screen.getByRole("button", { name: "Outside summary" }));
  await expectClosed();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Outside summary" }));
});

// Playwright's installed Vitest pointer provider maps TouchA to mouse input. CDP supplies
// native touch instead; convert the test iframe's coordinates to the top-level viewport.
function touchPoint(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  let x = rect.left + rect.width / 2;
  let y = rect.top + rect.height / 2;
  let current: Window = window;
  while (current.frameElement instanceof HTMLElement) {
    const frame = current.frameElement;
    const bounds = frame.getBoundingClientRect();
    const scaleX = bounds.width / frame.offsetWidth;
    const scaleY = bounds.height / frame.offsetHeight;
    x = bounds.left + (x + frame.clientLeft) * scaleX;
    y = bounds.top + (y + frame.clientTop) * scaleY;
    current = current.parent;
  }
  return { x, y };
}

test("native Chromium touch activates the named summary without a hover prerequisite", async () => {
  await page.viewport(390, 700);
  render(<SummaryFixture />);
  const trigger = screen.getByRole("button", { name: "Document overview" });
  const pointers: { trusted: boolean; type: string }[] = [];
  trigger.addEventListener("pointerdown", (event) => {
    pointers.push({ trusted: event.isTrusted, type: event.pointerType });
  });
  await expectClosed();
  await browserAction(() =>
    cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 })
  );
  await browserAction(() =>
    cdp().send("Input.dispatchTouchEvent", {
      touchPoints: [{ ...touchPoint(trigger), id: 1 }],
      type: "touchStart",
    })
  );
  await browserAction(() =>
    cdp().send("Input.dispatchTouchEvent", { touchPoints: [], type: "touchEnd" })
  );
  await screen.findByRole("region", { name: "Document page details" });
  expect(pointers).toEqual([{ trusted: true, type: "touch" }]);
  await userEvent.keyboard("{Escape}");
  await expectClosed();
});

function DisclosureFixture() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <Collapsible open={open}>
        <Switch
          aria-controls={open ? `${id}-panel` : undefined}
          aria-label="Enable reminders"
          checked={open}
          onCheckedChange={setOpen}
        />
        <CollapsiblePanel id={`${id}-panel`}>
          <input aria-label="Reminder note" />
        </CollapsiblePanel>
      </Collapsible>
      <button type="button">After reminders</button>
    </>
  );
}

test("a controlled Switch disclosure includes open content and skips closed content in native Tab order", async () => {
  render(<DisclosureFixture />);
  const toggle = screen.getByRole("switch", { name: "Enable reminders" });
  const after = screen.getByRole("button", { name: "After reminders" });
  toggle.focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(after);
  await userEvent.tab({ shift: true });
  expect(document.activeElement).toBe(toggle);
  await userEvent.keyboard(" ");
  const input = await screen.findByRole("textbox", { name: "Reminder note" });
  await userEvent.tab();
  expect(document.activeElement).toBe(input);
  await userEvent.tab({ shift: true });
  expect(document.activeElement).toBe(toggle);
  await userEvent.keyboard(" ");
  await userEvent.tab();
  expect(document.activeElement).toBe(after);
});
