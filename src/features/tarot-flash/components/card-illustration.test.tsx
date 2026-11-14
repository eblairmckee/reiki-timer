import { act, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { CardIllustration } from "./card-illustration";

const sources = vi.hoisted(() => ({
  fool: vi.fn<() => Promise<string>>(),
  magician: vi.fn<() => Promise<string>>(),
}));
vi.mock("../data/illustrations", () => ({
  illustrations: { "major-00": sources.fool, "major-01": sources.magician },
}));

function drawing(description: string) {
  return `<svg viewBox="0 0 240 360"><desc>${description}</desc><path d="M0 0L1 1"/></svg>`;
}

test("shows a card-specific placeholder and failure for an illustration that cannot load", async () => {
  const pending = Promise.withResolvers<string>();
  sources.fool.mockReturnValue(pending.promise);
  render(<CardIllustration catalogCardId="major-00" />);

  const status = screen.getByRole("status");
  expect(status.textContent).toBe("Loading illustration for The Fool…");
  await act(() => pending.reject(new Error("Illustration module unavailable")));
  expect(status.textContent).toBe("Illustration unavailable for The Fool.");
  expect(screen.queryByRole("img")).toBeNull();
});

test("a late illustration cannot replace the next card's accessible image", async () => {
  const pending = Promise.withResolvers<string>();
  sources.fool.mockReturnValue(pending.promise);
  sources.magician.mockResolvedValue(drawing("A magician raises a wand."));
  const { rerender } = render(<CardIllustration catalogCardId="major-00" />);

  rerender(<CardIllustration catalogCardId="major-01" />);
  expect(screen.getByRole("status").textContent).toBe("Loading illustration for The Magician…");
  expect(await screen.findByRole("img", { name: "A magician raises a wand." })).toBeTruthy();

  await act(() => pending.resolve(drawing("A traveler beside a cliff.")));
  expect(screen.queryByRole("img", { name: "A traveler beside a cliff." })).toBeNull();
  expect(screen.getByRole("img", { name: "A magician raises a wand." })).toBeTruthy();
  expect(screen.queryByRole("status")).toBeNull();
});

test("omits the illustration when the card has no bundled source", () => {
  const { container } = render(<CardIllustration catalogCardId="major-02" />);
  expect(container.childElementCount).toBe(0);
});
