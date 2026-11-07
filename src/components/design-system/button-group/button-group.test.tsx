import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { ButtonGroup, ButtonGroupSummary } from ".";

test("action slots preserve accessible names and repeated caller-owned activation", async () => {
  const preview = vi.fn();
  render(
    <ButtonGroup
      actions={
        <button onClick={preview} type="button">
          Preview
        </button>
      }
      aria-label="Document actions"
      variant="expandable"
    >
      <button type="button">Print</button>
    </ButtonGroup>
  );
  expect(screen.getByRole("group", { name: "Document actions" })).toBeTruthy();
  const user = userEvent.setup({ document });
  await user.click(screen.getByRole("button", { name: "Preview" }));
  await user.click(screen.getByRole("button", { name: "Preview" }));
  expect(preview).toHaveBeenCalledTimes(2);
});

test("standalone action groups accept their own accessible group name", () => {
  render(
    <ButtonGroup aria-label="Playback actions" variant="expandable">
      <button type="button">Play</button>
    </ButtonGroup>
  );
  expect(screen.getByRole("group", { name: "Playback actions" })).toBeTruthy();
});

test("summary slots render information and expose named details on focus", async () => {
  render(
    <ButtonGroupSummary
      details={{ content: <p>Seven pages</p>, label: "Document overview" }}
      summary={<p>20 pages</p>}
    >
      <button type="button">Print</button>
    </ButtonGroupSummary>
  );
  expect(screen.getByText("20 pages")).toBeTruthy();
  expect(screen.getAllByRole("group")).toHaveLength(1);
  const summary = screen.getByRole("group", { name: "Document overview" });
  expect(screen.queryByText("Seven pages")).toBeNull();
  const user = userEvent.setup({ document });
  await user.tab();
  expect(document.activeElement).toBe(summary);
  expect(screen.getByText("Seven pages")).toBeTruthy();
});

test("ordinary groups retain native props, refs, material and vertical layout", async () => {
  const ref = createRef<HTMLDivElement>();
  const click = vi.fn();
  render(
    <>
      <span id="document-actions-heading">Document tools</span>
      <ButtonGroup
        aria-labelledby="document-actions-heading"
        data-document-id="draft"
        material="frost"
        onClick={click}
        orientation="vertical"
        ref={ref}
      >
        <button type="button">Archive</button>
      </ButtonGroup>
    </>
  );
  const group = screen.getByRole("group", { name: "Document tools" });
  expect(ref.current).toBe(group);
  expect(group.getAttribute("data-document-id")).toBe("draft");
  expect(group.getAttribute("data-material")).toBe("frost");
  expect(group.getAttribute("data-orientation")).toBe("vertical");
  await userEvent.setup({ document }).click(screen.getByRole("button", { name: "Archive" }));
  expect(click).toHaveBeenCalledTimes(1);
});

function Controls({ expanded }: { expanded: boolean }) {
  return (
    <ButtonGroupSummary summary={expanded ? "20 pages" : undefined}>
      <ButtonGroup
        actions={expanded ? <button type="button">Preview</button> : undefined}
        aria-label="Print actions"
        variant="expandable"
      >
        <button type="button">Print</button>
      </ButtonGroup>
    </ButtonGroupSummary>
  );
}

test("summary and adjacent action changes preserve the stationary primary control and focus", async () => {
  const { rerender } = render(<Controls expanded={false} />);
  const primary = screen.getByRole("button", { name: "Print" });
  await userEvent.setup({ document }).tab();
  expect(document.activeElement).toBe(primary);
  rerender(<Controls expanded />);
  expect(screen.getByRole("button", { name: "Print" })).toBe(primary);
  expect(document.activeElement).toBe(primary);
  expect(screen.getAllByRole("group")).toHaveLength(2);
  expect(screen.getAllByRole("group", { name: "Print actions" })).toHaveLength(1);
  expect(screen.getByRole("group", { name: "Print actions" }).getAttribute("data-material")).toBe(
    "frost"
  );
  rerender(<Controls expanded={false} />);
  expect(document.activeElement).toBe(primary);
  await waitFor(() => expect(screen.queryByRole("button", { name: "Preview" })).toBeNull());
  expect(screen.getByRole("button", { name: "Print" })).toBe(primary);
});
