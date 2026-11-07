import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { defaultConfig } from "../model/timer-config";
import { readySession, type Session } from "../model/timer-session";
import {
  configStorageKey,
  draftStorageKey,
  loadConfig,
  loadDraft,
  saveConfig,
  storeDraft,
} from "./timer-storage";

const preferences = { ...defaultConfig, minutes: 30, showTime: true };
const draftConfig = { ...defaultConfig, minutes: 5 };

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

test("configuration reads migrate old preferences without rewriting storage", () => {
  const stored = JSON.stringify({ chime: "zen-deep", chimes: true, minutes: 15 });
  window.localStorage.setItem(configStorageKey, stored);
  expect(loadConfig()).toEqual({
    ...defaultConfig,
    chime: "zen-deep",
    chimeOnChange: true,
    chimes: true,
    minutes: 15,
  });
  expect(window.localStorage.getItem(configStorageKey)).toBe(stored);
});

test.each([null, "{broken", "null", '"text"', '{"minutes":120,"repeat":"true"}'])(
  "missing or malformed configuration %s uses defaults without writing",
  (stored) => {
    if (stored !== null) {
      window.localStorage.setItem(configStorageKey, stored);
    }
    expect(loadConfig()).toEqual(defaultConfig);
    expect(window.localStorage.getItem(configStorageKey)).toBe(stored);
  }
);

test("configuration reads tolerate unavailable browser storage", () => {
  vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
    throw new Error("Access denied");
  });
  expect(loadConfig()).toEqual(defaultConfig);
});

test("configuration is saved explicitly and a failed save can be retried", () => {
  const write = vi.spyOn(window.localStorage, "setItem").mockImplementationOnce(() => {
    throw new Error("Quota exceeded");
  });
  expect(saveConfig(preferences)).toBe(false);
  expect(window.localStorage.getItem(configStorageKey)).toBeNull();
  expect(saveConfig(preferences)).toBe(true);
  expect(write).toHaveBeenCalledTimes(2);
  expect(JSON.parse(window.localStorage.getItem(configStorageKey) ?? "null")).toEqual(preferences);
});

test.each<Session["mode"]>(["setup", "running", "paused", "complete", "edit-before-save", "saved"])(
  "restores a %s draft with only canonical session fields",
  (mode) => {
    const session = { elapsed: 12.5, mode, startedAt: 1234.5 };
    const stored = JSON.stringify({
      config: draftConfig,
      session: { ...session, obsolete: "discard" },
    });
    window.sessionStorage.setItem(draftStorageKey, stored);
    const restored = loadDraft(true);
    expect(restored).toEqual({ config: draftConfig, session });
    expect(window.sessionStorage.getItem(draftStorageKey)).toBe(stored);
  }
);

test.each([
  { elapsed: -1 },
  { elapsed: null },
  { elapsed: "0" },
  { startedAt: -1 },
  { startedAt: null },
  { startedAt: "1" },
  { mode: "running", startedAt: 0 },
  { mode: "unknown" },
])("rejects invalid persisted session fields %j", (invalid) => {
  window.localStorage.setItem(configStorageKey, JSON.stringify(preferences));
  window.sessionStorage.setItem(
    draftStorageKey,
    JSON.stringify({
      config: draftConfig,
      session: { elapsed: 0, mode: "paused", startedAt: 0, ...invalid },
    })
  );
  expect(loadDraft(true)).toEqual({ config: preferences, session: readySession });
});

test.each(["elapsed", "startedAt"])("rejects non-finite %s parsed from JSON", (field) => {
  window.localStorage.setItem(configStorageKey, JSON.stringify(preferences));
  window.sessionStorage.setItem(
    draftStorageKey,
    `{"config":{},"session":{"elapsed":0,"mode":"paused","startedAt":0,"${field}":1e309}}`
  );
  expect(loadDraft(true)).toEqual({ config: preferences, session: readySession });
});

test("non-running sessions preserve zero timestamps and elapsed time", () => {
  const draft = { config: draftConfig, session: readySession };
  storeDraft(draft);
  expect(loadDraft(true)).toEqual(draft);
});

test("restoring a draft validates its configuration without saving preferences", () => {
  window.localStorage.setItem(configStorageKey, JSON.stringify(preferences));
  window.sessionStorage.setItem(
    draftStorageKey,
    JSON.stringify({ config: { minutes: -1 }, session: readySession })
  );
  expect(loadDraft(true)).toEqual({ config: defaultConfig, session: readySession });
  expect(loadConfig()).toEqual(preferences);
});

test("restore false ignores tab storage and uses saved preferences", () => {
  window.localStorage.setItem(configStorageKey, JSON.stringify(preferences));
  storeDraft({ config: draftConfig, session: { elapsed: 10, mode: "paused", startedAt: 1 } });
  const read = vi.spyOn(window.sessionStorage, "getItem");
  expect(loadDraft(false)).toEqual({ config: preferences, session: readySession });
  expect(read).not.toHaveBeenCalled();
});

test.each([null, "broken", "null", "{}", '{"config":{}}', '{"config":{},"session":null}'])(
  "unavailable or malformed draft %s falls back to saved preferences",
  (stored) => {
    window.localStorage.setItem(configStorageKey, JSON.stringify(preferences));
    if (stored !== null) {
      window.sessionStorage.setItem(draftStorageKey, stored);
    }
    expect(loadDraft(true)).toEqual({ config: preferences, session: readySession });
  }
);

test("tab storage access failures still permit a fresh editor and in-memory draft", () => {
  window.localStorage.setItem(configStorageKey, JSON.stringify(preferences));
  vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => {
    throw new Error("Access denied");
  });
  expect(loadDraft(true)).toEqual({ config: preferences, session: readySession });
  expect(() => storeDraft({ config: draftConfig, session: readySession })).not.toThrow();
  expect(() => storeDraft(null)).not.toThrow();
});

test("draft writes and clears recover after storage failures without changing preferences", () => {
  window.localStorage.setItem(configStorageKey, JSON.stringify(preferences));
  const draft = { config: draftConfig, session: readySession };
  vi.spyOn(window.sessionStorage, "setItem").mockImplementationOnce(() => {
    throw new Error("Quota exceeded");
  });
  expect(() => storeDraft(draft)).not.toThrow();
  expect(window.sessionStorage.getItem(draftStorageKey)).toBeNull();
  storeDraft(draft);
  expect(loadDraft(true)).toEqual(draft);
  vi.spyOn(window.sessionStorage, "removeItem").mockImplementationOnce(() => {
    throw new Error("Access denied");
  });
  expect(() => storeDraft(null)).not.toThrow();
  expect(loadDraft(true)).toEqual(draft);
  storeDraft(null);
  expect(window.sessionStorage.getItem(draftStorageKey)).toBeNull();
  expect(loadDraft(true)).toEqual({ config: preferences, session: readySession });
  expect(loadConfig()).toEqual(preferences);
});
