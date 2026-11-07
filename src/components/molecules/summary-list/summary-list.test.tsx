import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { SummaryList } from ".";

test("document metadata supplies its own meaning and controlled empty item collection", () => {
  const view = render(
    <SummaryList
      items={[
        {
          content: (
            <span>
              <b>0</b> pages
            </span>
          ),
          key: "pages",
        },
        { content: "Draft manuscript", key: "tag" },
      ]}
      label="Document metadata"
    />
  );
  const list = screen.getByRole("list", { name: "Document metadata" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  expect(within(list).getByText("0")).toBeTruthy();
  view.rerender(<SummaryList asDescription blurredBackground items={[]} />);
  expect(list.hasAttribute("aria-label")).toBe(false);
  expect(list.getAttribute("data-as-description")).toBe("true");
  expect(list.getAttribute("data-blurred-background")).toBe("inset");
  // Departing content remains visually present during exit but is removed from the accessibility tree.
  expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
});
