import { expect, test } from "vitest";
import { defaultConfig } from "./timer-config";
import { crossedChimeBoundary, durationMs, sessionPhase, timerTimeline } from "./timer-timeline";

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
