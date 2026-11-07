import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { Timeline } from ".";

test("itinerary slots retain caller content, markers and stable item identity", () => {
  const items = [
    {
      content: "Arrive in Kyoto",
      detail: (
        <>
          <b>2</b> nights
        </>
      ),
      key: "arrival",
      leading: "Monday",
      marker: <span>Train</span>,
    },
    { content: "Garden walk", detail: "", key: "walk", leading: "Tuesday" },
  ];
  const view = render(<Timeline heading="Trip itinerary" items={items} />);
  const list = screen.getByRole("list", { name: "Trip itinerary" });
  expect(list.tabIndex).toBe(0);
  expect(within(list).getByText("Train")).toBeTruthy();
  expect(within(list).getByText("2").tagName).toBe("B");
  const [firstRow] = within(list).getAllByRole("listitem");
  expect(list.querySelectorAll("small")).toHaveLength(1);
  view.rerender(
    <Timeline
      heading="Trip itinerary"
      items={[{ ...items[0], content: "Arrive in Osaka" }, items[1]]}
    />
  );
  expect(within(list).getAllByRole("listitem")[0]).toBe(firstRow);
  expect(within(list).getByText("Arrive in Osaka")).toBeTruthy();
});
