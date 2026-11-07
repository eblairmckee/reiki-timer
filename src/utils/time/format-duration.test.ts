import { expect, test } from "vitest";
import { formatClock, formatRemaining } from "./format-duration";

test.each([
  [0, "0:00"],
  [9, "0:09"],
  [59, "0:59"],
  [60, "1:00"],
  [61, "1:01"],
  [3599, "59:59"],
  [3600, "60:00"],
])("stopwatch elapsed seconds %s format as %s", (seconds, expected) => {
  expect(formatClock(seconds)).toBe(expected);
});

test.each([
  [-1000, "0:00"],
  [0, "0:00"],
  [0.1, "0:01"],
  [999, "0:01"],
  [1000, "0:01"],
  [1000.1, "0:02"],
  [59_000, "0:59"],
  [59_001, "1:00"],
  [60_000, "1:00"],
  [60_001, "1:01"],
])("countdown milliseconds %s round up and clamp as %s", (milliseconds, expected) => {
  expect(formatRemaining(milliseconds)).toBe(expected);
});
