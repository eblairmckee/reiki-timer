import { expect, test } from "vitest";
import { defaultConfig, parseConfig } from "./timer-config";

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
