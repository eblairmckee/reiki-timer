import { expect, test } from "vitest";
import { elapsedAt } from "./timer-session";

test("elapsed time uses the clock and stays fixed while paused", () => {
  expect(elapsedAt({ elapsed: 3000, mode: "running", startedAt: 10_000 }, 22_000)).toBe(15_000);
  expect(elapsedAt({ elapsed: 3000, mode: "paused", startedAt: 0 }, 22_000)).toBe(3000);
});
