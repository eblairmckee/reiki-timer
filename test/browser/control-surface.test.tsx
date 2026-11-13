import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef, type Ref } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { cdp, page } from "vitest/browser";
import { SummaryList } from "@/components/molecules/summary-list";
import { ControlSurface } from "@/components/organisms/control-surface";
import { browserAction, userEvent } from "./react-browser";
import "@/app/styles/global.css";

const originalViewport = { height: innerHeight, width: innerWidth };

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
  await userEvent.cleanup();
  cleanup();
  await motionPreference("reduce");
  await page.viewport(originalViewport.width, originalViewport.height);
});

function DocumentSurface({
  hidden,
  onPrint,
  onPreview,
  surfaceRef,
}: {
  hidden: boolean;
  onPrint: () => void;
  onPreview: () => void;
  surfaceRef: Ref<HTMLFieldSetElement>;
}) {
  return (
    <div style={{ padding: "1rem" }}>
      <button type="button">Before controls</button>
      <ControlSurface
        actions={
          <button onClick={onPreview} type="button">
            Preview
          </button>
        }
        details={{ content: <p>Seven chapters ready</p>, label: "Document overview" }}
        groupLabel="Document actions"
        hidden={hidden}
        label="Document controls"
        ref={surfaceRef}
        summary={<SummaryList items={[{ content: "12 pages", key: "pages" }]} />}
      >
        <button onClick={onPrint} type="button">
          Print
        </button>
      </ControlSurface>
      <button type="button">After controls</button>
    </div>
  );
}

test.each(["reduce", "no-preference"] as const)(
  "%s: custom controls fit a narrow viewport and hidden controls leave native Tab order",
  async (preference) => {
    await motionPreference(preference);
    await page.viewport(390, 700);
    const surfaceRef = createRef<HTMLFieldSetElement>();
    const onPrint = vi.fn();
    const onPreview = vi.fn();
    const props = { onPreview, onPrint, surfaceRef };
    const view = render(<DocumentSurface {...props} hidden={false} />);
    const surface = surfaceRef.current;
    if (!surface) {
      throw new Error("Missing public control-surface ref");
    }
    const before = screen.getByRole("button", { name: "Before controls" });
    const after = screen.getByRole("button", { name: "After controls" });
    const print = screen.getByRole("button", { name: "Print" });
    const overview = screen.getByRole("button", { name: "Document overview" });
    const bounds = surface.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(innerWidth);

    await userEvent.click(before);
    await userEvent.tab();
    expect(document.activeElement).toBe(overview);
    await userEvent.keyboard("{Enter}");
    expect(overview.getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).toBe(overview);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Preview" }));
    await userEvent.keyboard(" ");
    expect(onPreview).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    expect(document.activeElement).toBe(print);
    await userEvent.keyboard("{Enter}");
    expect(onPrint).toHaveBeenCalledTimes(1);

    // Hide while a descendant owns focus; exclusion must precede the visual fade.
    view.rerender(<DocumentSurface {...props} hidden />);
    expect(surface.inert).toBe(true);
    await waitFor(() => expect(document.activeElement).not.toBe(print));
    print.focus();
    expect(document.activeElement).not.toBe(print);
    await userEvent.click(before);
    await userEvent.tab();
    expect(document.activeElement).toBe(after);

    // Reverse before requiring exit completion; the same custom control must recover.
    view.rerender(<DocumentSurface {...props} hidden={false} />);
    expect(surface.inert).toBe(false);
    expect(screen.getByRole("button", { name: "Print" })).toBe(print);
    await waitFor(() => expect(getComputedStyle(surface).opacity).toBe("1"), { timeout: 3000 });
    await userEvent.click(print);
    expect(onPrint).toHaveBeenCalledTimes(2);
  }
);

function SummaryFixture({ showItem }: { showItem: boolean }) {
  return (
    <>
      <button type="button">Before summary</button>
      <SummaryList
        items={
          showItem ? [{ content: <button type="button">Open draft</button>, key: "draft" }] : []
        }
        label="Document summary"
      />
      <button type="button">After summary</button>
    </>
  );
}

test("custom summary controls are excluded from focus during ordinary-motion removal", async () => {
  await motionPreference("no-preference");
  const view = render(<SummaryFixture showItem />);
  const draft = screen.getByRole("button", { name: "Open draft" });
  await userEvent.click(draft);
  expect(document.activeElement).toBe(draft);
  view.rerender(<SummaryFixture showItem={false} />);
  await waitFor(() => expect(document.activeElement).not.toBe(draft));
  draft.focus();
  expect(document.activeElement).not.toBe(draft);
  await userEvent.click(screen.getByRole("button", { name: "Before summary" }));
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "After summary" }));
});
