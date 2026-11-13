import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { expect, test } from "vitest";
import { SummaryList } from ".";

function DocumentRow({ title }: { title: string }) {
  const [views, setViews] = useState(0);
  return (
    <button onClick={() => setViews((count) => count + 1)} type="button">
      {title} ({views})
    </button>
  );
}

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

test("document rows keep caller content state by stable key as parent values and order change", () => {
  const view = render(
    <SummaryList
      items={[
        { content: <DocumentRow title="Draft" />, key: "draft" },
        { content: <DocumentRow title="Outline" />, key: "outline" },
      ]}
      label="Reading list"
    />
  );

  fireEvent.click(screen.getByRole("button", { name: "Draft (0)" }));
  view.rerender(
    <SummaryList
      items={[
        { content: <DocumentRow title="Revised outline" />, key: "outline" },
        { content: <DocumentRow title="Updated draft" />, key: "draft" },
      ]}
      label="Reading list"
    />
  );

  const list = screen.getByRole("list", { name: "Reading list" });
  expect(
    within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent)
  ).toEqual(["Revised outline (0)", "Updated draft (1)"]);
});

test("interactive custom content is inert while its list item exits", () => {
  const view = render(
    <SummaryList
      items={[{ content: <button type="button">Open document</button>, key: "draft" }]}
    />
  );

  view.rerender(<SummaryList items={[]} />);

  const exitingItem = view.container.querySelector("li");
  expect(exitingItem?.getAttribute("aria-hidden")).toBe("true");
  expect(exitingItem?.hasAttribute("inert")).toBe(true);
});
