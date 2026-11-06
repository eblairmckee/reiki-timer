import { expect, test } from "vitest";
import {
  crossedChimeBoundary,
  defaultConfig,
  durationMs,
  elapsedAt,
  formatRemaining,
  parseConfig,
  sessionPhase,
  timerTimeline,
} from "./timer-state";

test("stored configuration is validated, including malformed and out-of-range values", () => {
  expect(parseConfig(null)).toEqual(defaultConfig);
  expect(parseConfig({ minutes: 120, repeat: "true", warmUpMinutes: -1 })).toEqual(defaultConfig);
  expect(parseConfig({ ...defaultConfig, minutes: 5, repeat: true }).minutes).toBe(5);
});

test("old and malformed chime settings migrate to safe defaults", () => {
  expect(parseConfig({ minutes: 20 })).toMatchObject({
    chime: "zen-mid",
    chimeOnChange: false,
    chimeOnCoolDownEnd: false,
    chimeOnSessionEnd: false,
    chimeOnWarmUpEnd: false,
    chimes: false,
    showBreakdown: false,
  });
  expect(parseConfig({ chime: "../bad.mp3", chimeOnChange: null, chimes: "true" })).toEqual(
    defaultConfig
  );
  expect(parseConfig({ chime: "bowl-hit", chimeOnChange: true, chimes: true })).toMatchObject({
    chime: "bowl-hit",
    chimeOnChange: true,
    chimes: true,
  });
  expect(parseConfig({ chime: "zen-deep", chimes: true })).toMatchObject({
    chime: "zen-deep",
    chimeOnChange: true,
    chimeOnSessionEnd: false,
    chimes: true,
  });
  expect(parseConfig({ ...defaultConfig, chimes: true })).toEqual(defaultConfig);
  expect(parseConfig({ chimeOnCoolDownEnd: true, chimes: true })).toMatchObject({
    chimeOnChange: false,
    chimeOnCoolDownEnd: true,
    chimeOnSessionEnd: false,
    chimes: false,
  });
});

test("stored phase-end cues only enable chimes when their phase is part of the timer", () => {
  const stored = {
    ...defaultConfig,
    chimeOnCoolDownEnd: true,
    chimeOnWarmUpEnd: true,
    chimes: true,
  };
  expect(parseConfig(stored)).toEqual({ ...stored, chimes: false });
  expect(parseConfig({ ...stored, warmUp: true }).chimes).toBe(true);
  expect(parseConfig({ ...stored, coolDown: true }).chimes).toBe(true);
  expect(parseConfig({ ...stored, chimes: false, coolDown: true }).chimes).toBe(false);
});

test("the timeline and chimes use the same boundaries through both rounds and cool down", () => {
  const config = {
    ...defaultConfig,
    chimeOnChange: true,
    chimeOnCoolDownEnd: true,
    chimeOnSessionEnd: true,
    chimeOnWarmUpEnd: true,
    chimes: true,
    coolDown: true,
    minutes: 14,
    repeat: true,
    warmUp: true,
  };
  const timeline = timerTimeline(config);
  const chakraNames = ["Root", "Sacral", "Solar plexus", "Heart", "Throat", "Third eye", "Crown"];
  expect(timeline).toHaveLength(17);
  expect(timeline.slice(1, 15).map((entry) => entry.label)).toEqual([
    ...chakraNames,
    ...chakraNames,
  ]);
  expect(timeline[0]).toEqual({ at: 0, chime: false, label: "Warm up" });
  expect(timeline[1]).toMatchObject({
    at: 60_000,
    chime: true,
    detail: "Round 1",
    label: "Root",
  });
  expect(timeline[8]).toMatchObject({
    at: 480_000,
    chime: true,
    detail: "Round 2",
    label: "Root",
  });
  expect(timeline[15]).toEqual({ at: 900_000, chime: true, label: "Cool down begins" });
  expect(timeline[16]).toEqual({ at: 960_000, chime: true, label: "Cool down ends" });
  expect(crossedChimeBoundary(timeline, 0, 0)).toBe(false);
  for (let minute = 1; minute <= 16; minute += 1) {
    expect(crossedChimeBoundary(timeline, minute * 60_000 - 1, minute * 60_000)).toBe(true);
    expect(crossedChimeBoundary(timeline, minute * 60_000, minute * 60_000 + 250)).toBe(false);
  }
  expect(crossedChimeBoundary(timerTimeline({ ...config, chimes: false }), 0, 960_000)).toBe(false);
});
test("each cue is optional and position changes exclude the first position and session end", () => {
  const seven = { ...defaultConfig, chimes: true, minutes: 7 };
  const bothPhases = { ...seven, coolDown: true, warmUp: true };
  const cues = (timeline: ReturnType<typeof timerTimeline>) =>
    timeline.filter((entry) => entry.chime).map((entry) => entry.at / 60_000);
  expect(cues(timerTimeline({ ...seven, chimeOnChange: true }))).toEqual([1, 2, 3, 4, 5, 6]);
  expect(cues(timerTimeline({ ...seven, chimeOnSessionEnd: true }))).toEqual([7]);
  expect(cues(timerTimeline({ ...bothPhases, chimeOnChange: true }))).toEqual([2, 3, 4, 5, 6, 7]);
  expect(cues(timerTimeline({ ...bothPhases, chimeOnSessionEnd: true }))).toEqual([8]);
  expect(
    cues(timerTimeline({ ...bothPhases, chimeOnCoolDownEnd: true, chimeOnWarmUpEnd: true }))
  ).toEqual([1, 9]);
});
test("elapsed time uses the clock and stays fixed while paused", () => {
  expect(elapsedAt({ elapsed: 3000, mode: "running", startedAt: 10_000 }, 22_000)).toBe(15_000);
  expect(elapsedAt({ elapsed: 3000, mode: "paused", startedAt: 0 }, 22_000)).toBe(3000);
  expect(formatRemaining(59_001)).toBe("1:00");
});
test("warm-up, repeated chakra cycles and cool-down share the configured total duration", () => {
  const config = { ...defaultConfig, coolDown: true, minutes: 14, repeat: true, warmUp: true };
  expect(durationMs(config)).toBe(16 * 60_000);
  expect(sessionPhase(config, 0)).toMatchObject({ dim: 1, name: "Warm up" });
  expect(sessionPhase(config, 60_000)).toMatchObject({ dim: 0, name: "Root" });
  expect(sessionPhase(config, 8 * 60_000).name).toBe("Root");
  expect(sessionPhase(config, 15 * 60_000).name).toBe("Cool down");
  expect(sessionPhase(config, 16 * 60_000).dim).toBe(1);
  expect(sessionPhase(defaultConfig, durationMs(defaultConfig) + 250).dim).toBe(0);
});
