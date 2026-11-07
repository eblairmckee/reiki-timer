import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentPropsWithRef, createRef } from "react";
import { expect, test, vi } from "vitest";
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from ".";

test("independent disclosures toggle with Enter and Space and keep their ARIA relationships", async () => {
  const user = userEvent.setup({ document });
  const changed = vi.fn();
  render(
    <>
      <Collapsible onOpenChange={changed}>
        <CollapsibleTrigger>First details</CollapsibleTrigger>
        <CollapsiblePanel keepMounted>
          <button type="button">First action</button>
        </CollapsiblePanel>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger>Second details</CollapsibleTrigger>
        <CollapsiblePanel keepMounted>
          <button type="button">Second action</button>
        </CollapsiblePanel>
      </Collapsible>
    </>
  );
  const first = screen.getByRole("button", { name: "First details" });
  const second = screen.getByRole("button", { name: "Second details" });
  expect(first.getAttribute("aria-controls")).toBeNull();
  expect(second.getAttribute("aria-controls")).toBeNull();
  expect(first.getAttribute("aria-expanded")).toBe("false");
  expect(second.getAttribute("aria-expanded")).toBe("false");

  await user.tab();
  expect(document.activeElement).toBe(first);
  await user.keyboard("{Enter}");
  expect(changed).toHaveBeenCalledTimes(1);
  expect(first.getAttribute("aria-expanded")).toBe("true");
  expect(second.getAttribute("aria-expanded")).toBe("false");
  const firstId = first.getAttribute("aria-controls");
  expect(firstId).toBeTruthy();
  const action = screen.getByRole("button", { name: "First action" });
  const closedPanel = action.closest("[data-ui=collapsible-panel]");
  expect(closedPanel?.id).toBe(firstId);
  await user.tab();
  expect(document.activeElement).toBe(action);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(first);
  await user.keyboard(" ");
  expect(changed).toHaveBeenCalledTimes(2);
  expect(first.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("button", { name: "First action" })).toBeNull();
  expect(closedPanel?.hasAttribute("inert")).toBe(true);
  expect(closedPanel?.getAttribute("aria-hidden")).toBe("true");
  expect(document.activeElement).toBe(first);
  // Happy DOM does not model inert tab exclusion; assert inert above and focus the next trigger.
  second.focus();
  expect(document.activeElement).toBe(second);
  await user.keyboard(" ");
  expect(second.getAttribute("aria-expanded")).toBe("true");
  const secondId = second.getAttribute("aria-controls");
  expect(secondId).toBeTruthy();
  expect(firstId).not.toBe(secondId);
  expect(first.getAttribute("aria-expanded")).toBe("false");
  expect(screen.getByRole("button", { name: "Second action" })).toBeTruthy();
});

test("controlled panels honor external state, refs, native props and render functions", () => {
  const panelRef = createRef<HTMLDivElement>();
  const renderPanel = vi.fn((props: ComponentPropsWithRef<"div">, _state: { open: boolean }) => (
    <section {...props} />
  ));
  const panel = (
    <CollapsiblePanel
      data-example="dependent-fields"
      id="dependent-panel"
      keepMounted
      ref={panelRef}
      render={renderPanel}
    >
      <button type="button">Dependent action</button>
    </CollapsiblePanel>
  );
  const { rerender } = render(<Collapsible open>{panel}</Collapsible>);
  const surface = panelRef.current;
  expect(surface?.tagName).toBe("SECTION");
  expect(surface?.id).toBe("dependent-panel");
  expect(surface?.getAttribute("data-example")).toBe("dependent-fields");
  expect(screen.getByRole("button", { name: "Dependent action" })).toBeTruthy();
  expect(surface?.hasAttribute("inert")).toBe(false);
  rerender(<Collapsible open={false}>{panel}</Collapsible>);
  expect(surface?.hasAttribute("inert")).toBe(true);
  expect(surface?.getAttribute("aria-hidden")).toBe("true");
  expect(screen.queryByRole("button", { name: "Dependent action" })).toBeNull();
  expect(renderPanel.mock.calls.at(-1)?.[1]).toMatchObject({ open: false });
  rerender(<Collapsible open>{panel}</Collapsible>);
  expect(panelRef.current).toBe(surface);
  expect(surface?.hasAttribute("inert")).toBe(false);
  expect(surface?.hasAttribute("aria-hidden")).toBe(false);
  expect(screen.getByRole("button", { name: "Dependent action" })).toBeTruthy();
});

test("hidden-until-found panels remain searchable and respond to native beforematch", () => {
  const ref = createRef<HTMLDivElement>();
  const changed = vi.fn();
  render(
    <Collapsible onOpenChange={changed}>
      <CollapsibleTrigger>Searchable details</CollapsibleTrigger>
      <CollapsiblePanel hiddenUntilFound ref={ref} render={<section />}>
        <button type="button">Matched action</button>
      </CollapsiblePanel>
    </Collapsible>
  );
  const panel = ref.current;
  expect(panel?.tagName).toBe("SECTION");
  expect(panel?.getAttribute("hidden")).toBe("until-found");
  expect(panel?.hasAttribute("inert")).toBe(false);
  expect(panel?.hasAttribute("aria-hidden")).toBe(false);
  if (!panel) {
    throw new Error("Expected searchable panel");
  }
  fireEvent(panel, new Event("beforematch"));
  expect(changed).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("button", { name: "Searchable details" }).getAttribute("aria-expanded")
  ).toBe("true");
  expect(screen.getByRole("button", { name: "Matched action" })).toBeTruthy();
});
