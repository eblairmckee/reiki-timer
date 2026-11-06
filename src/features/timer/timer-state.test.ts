import { expect, test } from "bun:test";
import {
  defaultConfig,
  durationMs,
  elapsedAt,
  formatRemaining,
  parseConfig,
  sessionPhase,
} from "./timer-state";

test("stored configuration is validated, including malformed and out-of-range values", () => {
  expect(parseConfig(null)).toEqual(defaultConfig);
  expect(parseConfig({ minutes: 120, repeat: "true", warmUpMinutes: -1 })).toEqual(defaultConfig);
  expect(parseConfig({ ...defaultConfig, minutes: 5, repeat: true }).minutes).toBe(5);
});
test("elapsed time uses the clock and stays fixed while paused", () => {
  expect(elapsedAt({ mode: "running", elapsed: 3000, startedAt: 10_000 }, 22_000)).toBe(15_000);
  expect(elapsedAt({ mode: "paused", elapsed: 3000, startedAt: 0 }, 22_000)).toBe(3000);
  expect(formatRemaining(59_001)).toBe("1:00");
});
test("warm-up, repeated chakra cycles and cool-down share the configured total duration", () => {
  const config = { ...defaultConfig, minutes: 14, repeat: true, warmUp: true, coolDown: true };
  expect(durationMs(config)).toBe(16 * 60_000);
  expect(sessionPhase(config, 0)).toMatchObject({ name: "Warm up", dim: 1 });
  expect(sessionPhase(config, 60_000)).toMatchObject({ name: "Root", dim: 0 });
  expect(sessionPhase(config, 8 * 60_000).name).toBe("Root");
  expect(sessionPhase(config, 15 * 60_000).name).toBe("Cool down");
  expect(sessionPhase(config, 16 * 60_000).dim).toBe(1);
  expect(sessionPhase(defaultConfig, durationMs(defaultConfig) + 250).dim).toBe(0);
});
