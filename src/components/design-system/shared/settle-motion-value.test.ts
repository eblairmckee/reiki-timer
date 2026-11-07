import { motionValue } from "motion";
import { expect, test, vi } from "vitest";
import { settleMotionValue } from "./settle-motion-value";

test("reducing motion during a spring stops it and jumps to the new target", () => {
  const value = motionValue(0);
  const spring = settleMotionValue(value, 100, false, null);
  if (!spring) {
    throw new Error("Expected a running spring");
  }
  const stop = vi.spyOn(spring, "stop");
  expect(settleMotionValue(value, 42, true, spring)).toBeNull();
  expect(stop).toHaveBeenCalledOnce();
  expect(value.get()).toBe(42);
});
