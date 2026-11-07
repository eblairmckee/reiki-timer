import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Choicebox } from ".";

const brushes = [
  { content: <span aria-hidden="true">S</span>, id: "", name: "Soft brush" },
  { content: <span aria-hidden="true">I</span>, id: "ink", name: "Ink brush" },
];

test("brush presets remain controlled and notify repeated activation including empty identity", () => {
  const onActivate = vi.fn();
  const view = render(
    <Choicebox label="Brush presets" onActivate={onActivate} options={brushes} value="" />
  );
  expect(screen.getByRole("group", { name: "Brush presets" })).toBeTruthy();
  const soft = screen.getByRole("button", { name: "Soft brush" });
  const ink = screen.getByRole("button", { name: "Ink brush" });
  expect(soft.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(soft);
  fireEvent.click(soft);
  fireEvent.click(ink);
  expect(onActivate.mock.calls).toEqual([[""], [""], ["ink"]]);
  expect(ink.getAttribute("aria-pressed")).toBe("false");
  view.rerender(
    <Choicebox label="Brush presets" onActivate={onActivate} options={brushes} value="ink" />
  );
  expect(ink.getAttribute("aria-pressed")).toBe("true");
  expect(soft.getAttribute("aria-pressed")).toBe("false");
});

test("separate named groups do not share selection", () => {
  render(
    <>
      <span id="primary-brush">Primary brush</span>
      <Choicebox labelledBy="primary-brush" onActivate={vi.fn()} options={brushes} value="" />
      <Choicebox label="Alternate brush" onActivate={vi.fn()} options={brushes} value="ink" />
    </>
  );
  expect(screen.getByRole("group", { name: "Primary brush" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Alternate brush" })).toBeTruthy();
  expect(
    screen
      .getAllByRole("button", { name: "Soft brush" })
      .map((button) => button.getAttribute("aria-pressed"))
  ).toEqual(["true", "false"]);
});
