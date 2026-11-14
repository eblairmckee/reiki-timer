import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MouseEvent, Ref } from "react";
import { expect, test, vi } from "vitest";
import { ControlSurface } from ".";

function DocumentControls({
  hidden = false,
  surfaceRef,
  onPreview,
}: {
  hidden?: boolean;
  surfaceRef: Ref<HTMLFieldSetElement>;
  onPreview: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <ControlSurface
      actions={
        <button onClick={onPreview} type="button">
          Preview
        </button>
      }
      details={{ content: <p>Includes seven sections</p>, label: "Document overview" }}
      groupLabel="Document actions"
      hidden={hidden}
      label="Document controls"
      ref={surfaceRef}
      summary={<p>12 pages · 3 min read</p>}
    >
      <button type="button">Print</button>
    </ControlSurface>
  );
}

test("independent document controls preserve slots, native names, refs, and disclosure behavior", async () => {
  const user = userEvent.setup({ document });
  let assignedSurface: HTMLFieldSetElement | null = null;
  const surfaceRef = (node: HTMLFieldSetElement | null) => {
    assignedSurface = node;
  };
  const preview = vi.fn((event: MouseEvent<HTMLButtonElement>) => event.preventDefault());
  render(<DocumentControls onPreview={preview} surfaceRef={surfaceRef} />);

  expect(assignedSurface).toBe(document.querySelector('fieldset[aria-label="Document controls"]'));
  expect(screen.getByRole("group", { name: "Document actions" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Print" })).toBeTruthy();
  const previewButton = screen.getByRole("button", { name: "Preview" });
  expect(previewButton).toBeTruthy();
  await user.click(previewButton);
  await user.click(previewButton);
  expect(preview).toHaveBeenCalledTimes(2);
  expect(preview.mock.lastCall?.[0].defaultPrevented).toBe(true);
  expect(screen.getByText("12 pages · 3 min read")).toBeTruthy();

  const overview = screen.getByRole("button", { name: "Document overview" });
  await user.click(overview);
  expect(overview.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("Includes seven sections")).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(document.activeElement).toBe(overview);
  expect(overview.getAttribute("aria-expanded")).toBe("false");
});

function ControlledSurface({ hidden }: { hidden: boolean }) {
  return (
    <ControlSurface
      details={{ content: "Stereo audio", label: "Recording details" }}
      groupLabel="Media actions"
      hidden={hidden}
      label="Media controls"
      summary="12 minute recording"
    >
      <button type="button">Play recording</button>
    </ControlSurface>
  );
}

test("hidden lifecycle follows the caller and restores the native control surface", async () => {
  const user = userEvent.setup({ document });
  const { rerender } = render(<ControlledSurface hidden={false} />);
  const fieldset = document.querySelector('fieldset[aria-label="Media controls"]');
  expect(fieldset?.getAttribute("aria-hidden")).toBe("false");
  expect(fieldset?.hasAttribute("inert")).toBe(false);
  expect(screen.getByRole("button", { name: "Play recording" })).toBeTruthy();
  const detailToggle = screen.getByRole("button", { name: "Recording details" });
  await user.click(detailToggle);
  expect(detailToggle.getAttribute("aria-expanded")).toBe("true");

  rerender(<ControlledSurface hidden />);
  expect(fieldset?.getAttribute("aria-hidden")).toBe("true");
  expect(fieldset?.hasAttribute("inert")).toBe(true);
  // Disclosure open state is not asserted here; browser blur/outside dismissal may close it.
  rerender(<ControlledSurface hidden={false} />);
  expect(fieldset?.getAttribute("aria-hidden")).toBe("false");
  expect(fieldset?.hasAttribute("inert")).toBe(false);
  expect(screen.getByRole("button", { name: "Play recording" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Recording details" })).toBeTruthy();
});

test("two surfaces keep their disclosures isolated", async () => {
  const user = userEvent.setup({ document });
  render(
    <>
      <ControlSurface
        details={{ content: "Draft metadata", label: "Draft details" }}
        groupLabel="Draft actions"
        label="Draft controls"
        summary="Draft"
      >
        <button type="button">Save draft</button>
      </ControlSurface>
      <ControlSurface
        details={{ content: "Recording metadata", label: "Recording details" }}
        groupLabel="Recording actions"
        label="Recording controls"
        summary="Recording"
      >
        <button type="button">Play recording</button>
      </ControlSurface>
    </>
  );
  const draftToggle = screen.getByRole("button", { name: "Draft details" });
  const recordingToggle = screen.getByRole("button", { name: "Recording details" });
  await user.click(draftToggle);
  expect(draftToggle.getAttribute("aria-expanded")).toBe("true");
  expect(recordingToggle.getAttribute("aria-expanded")).toBe("false");
  expect(screen.getByText("Draft metadata")).toBeTruthy();
  expect(screen.queryByText("Recording metadata")).toBeNull();
});
