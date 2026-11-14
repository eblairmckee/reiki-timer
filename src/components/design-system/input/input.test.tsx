import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { Input } from ".";

test("frost input keeps its native search contract when the appearance changes", () => {
  const ref = createRef<HTMLInputElement>();
  const change = vi.fn();
  const field = (appearance?: "frost") => (
    <>
      <label htmlFor="card-query">Find a card</label>
      <Input
        appearance={appearance}
        id="card-query"
        name="query"
        onValueChange={change}
        placeholder="Card name"
        ref={ref}
        required
        type="search"
        value="Justice"
      />
    </>
  );
  const view = render(field());
  const input = screen.getByRole<HTMLInputElement>("searchbox", { name: "Find a card" });
  expect(input.hasAttribute("data-appearance")).toBe(false);
  view.rerender(field("frost"));

  expect(ref.current).toBe(input);
  expect(input.dataset.appearance).toBe("frost");
  expect(input.name).toBe("query");
  expect(input.placeholder).toBe("Card name");
  expect(input.required).toBe(true);
  fireEvent.change(input, { target: { value: "Strength" } });
  expect(change).toHaveBeenCalledExactlyOnceWith("Strength", expect.anything());
  expect(input.value).toBe("Justice");
});
