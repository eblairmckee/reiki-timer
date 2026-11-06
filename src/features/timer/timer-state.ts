import { type ChimeId, defaultChime, isChimeId } from "./chimes";

interface ChimeCues {
  chimeOnChange: boolean;
  chimeOnCoolDownEnd: boolean;
  chimeOnSessionEnd: boolean;
  chimeOnWarmUpEnd: boolean;
}

export type TimerConfig = ChimeCues & {
  minutes: number;
  repeat: boolean;
  showTime: boolean;
  showBreakdown: boolean;
  warmUp: boolean;
  warmUpMinutes: number;
  coolDown: boolean;
  coolDownMinutes: number;
  chimes: boolean;
  chime: ChimeId;
};
export const defaultConfig: TimerConfig = {
  chime: defaultChime,
  chimeOnChange: false,
  chimeOnCoolDownEnd: false,
  chimeOnSessionEnd: false,
  chimeOnWarmUpEnd: false,
  chimes: false,
  coolDown: false,
  coolDownMinutes: 1,
  minutes: 20,
  repeat: false,
  showBreakdown: false,
  showTime: false,
  warmUp: false,
  warmUpMinutes: 1,
};
export const configStorageKey = "reiki-timer.config";

export function availableChimeCues({ warmUp, coolDown }: TimerConfig) {
  const cues: (keyof ChimeCues)[] = ["chimeOnChange"];
  if (warmUp) {
    cues.push("chimeOnWarmUpEnd");
  }
  cues.push("chimeOnSessionEnd");
  if (coolDown) {
    cues.push("chimeOnCoolDownEnd");
  }
  return cues;
}

export function hasChimeCue(config: TimerConfig) {
  return availableChimeCues(config).some((cue) => config[cue]);
}

export function normalizeChimes(config: TimerConfig): TimerConfig {
  return config.chimes && !hasChimeCue(config) ? { ...config, chimes: false } : config;
}

export function parseConfig(storedValue: unknown): TimerConfig {
  if (typeof storedValue !== "object" || storedValue === null) {
    return { ...defaultConfig };
  }
  const data = storedValue as Record<string, unknown>;
  function minutes(key: string, fallback: number, min: number, max: number) {
    const value = data[key];
    return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
      ? value
      : fallback;
  }
  const cues = {
    chimeOnChange: data.chimeOnChange === true,
    chimeOnCoolDownEnd: data.chimeOnCoolDownEnd === true,
    chimeOnSessionEnd: data.chimeOnSessionEnd === true,
    chimeOnWarmUpEnd: data.chimeOnWarmUpEnd === true,
  };
  // Older enabled timers could have every switch off because the session-end cue was implicit.
  if (
    data.chimes === true &&
    !("chimeOnSessionEnd" in data) &&
    !Object.values(cues).some(Boolean)
  ) {
    cues.chimeOnChange = true;
  }
  return normalizeChimes({
    chime: isChimeId(data.chime) ? data.chime : defaultChime,
    chimes: data.chimes === true,
    coolDown: data.coolDown === true,
    coolDownMinutes: minutes("coolDownMinutes", 1, 1, 10),
    minutes: minutes("minutes", 20, 5, 60),
    repeat: data.repeat === true,
    showBreakdown: data.showBreakdown === true,
    showTime: data.showTime === true,
    warmUp: data.warmUp === true,
    warmUpMinutes: minutes("warmUpMinutes", 1, 1, 10),
    ...cues,
  });
}
export function loadConfig(): TimerConfig {
  try {
    return parseConfig(JSON.parse(window.localStorage.getItem(configStorageKey) ?? "null"));
  } catch {
    return { ...defaultConfig };
  }
}
export function saveConfig(config: TimerConfig) {
  try {
    window.localStorage.setItem(configStorageKey, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}
export function phaseEnds(config: TimerConfig) {
  const warmUpEnd = (config.warmUp ? config.warmUpMinutes : 0) * 60_000;
  const sessionEnd = warmUpEnd + config.minutes * 60_000;
  const timerEnd = sessionEnd + (config.coolDown ? config.coolDownMinutes : 0) * 60_000;
  return { sessionEnd, timerEnd, warmUpEnd };
}
export function durationMs(config: TimerConfig) {
  return phaseEnds(config).timerEnd;
}

export function summarizeTimer(config: TimerConfig, elapsed = 0) {
  const { warmUpEnd, sessionEnd, timerEnd } = phaseEnds(config);
  return {
    chimes: config.chimes,
    coolDownMinutes: config.coolDown && elapsed < timerEnd ? config.coolDownMinutes : undefined,
    repeat: config.repeat && elapsed < sessionEnd,
    sessionMinutes: elapsed < sessionEnd ? config.minutes : undefined,
    warmUpMinutes: config.warmUp && elapsed < warmUpEnd ? config.warmUpMinutes : undefined,
  };
}

export interface Session {
  elapsed: number;
  mode: "setup" | "running" | "paused" | "complete" | "edit-before-save" | "saved";
  startedAt: number;
}
export function elapsedAt(session: Session, now: number) {
  return session.elapsed + (session.mode === "running" ? Math.max(0, now - session.startedAt) : 0);
}
const chakras = ["Root", "Sacral", "Solar plexus", "Heart", "Throat", "Third eye", "Crown"];
function positionCount(config: TimerConfig) {
  return chakras.length * (config.repeat ? 2 : 1);
}

export interface TimelineEntry {
  at: number;
  chime: boolean;
  detail?: string;
  label: string;
  position?: number;
}

export function timerTimeline(config: TimerConfig): TimelineEntry[] {
  const { warmUpEnd, sessionEnd, timerEnd } = phaseEnds(config);
  const count = positionCount(config);
  const entries: TimelineEntry[] = [];
  if (config.warmUp) {
    entries.push({ at: 0, chime: false, label: "Warm up" });
  }
  // Position one is a timed change only when a warm up precedes it.
  for (let i = config.warmUp ? 0 : 1; i < count; i += 1) {
    const chakra = i % chakras.length;
    const cue = i === 0 ? config.warmUp && config.chimeOnWarmUpEnd : config.chimeOnChange;
    entries.push({
      at: warmUpEnd + ((sessionEnd - warmUpEnd) * i) / count,
      chime: config.chimes && cue,
      detail: config.repeat && chakra === 0 ? `Round ${i === 0 ? 1 : 2}` : undefined,
      label: chakras[chakra],
      position: chakra + 1,
    });
  }
  entries.push({
    at: sessionEnd,
    chime: config.chimes && config.chimeOnSessionEnd,
    label: config.coolDown ? "Cool down begins" : "Session ends",
  });
  if (config.coolDown) {
    entries.push({
      at: timerEnd,
      chime: config.chimes && config.chimeOnCoolDownEnd,
      label: "Cool down ends",
    });
  }
  return entries;
}

export function sessionPhase(config: TimerConfig, elapsed: number) {
  const { warmUpEnd, sessionEnd, timerEnd } = phaseEnds(config);
  if (elapsed < warmUpEnd) {
    return {
      dim: 1 - elapsed / warmUpEnd,
      index: 0,
      label: "Warm up",
      name: "Warm up",
      remaining: warmUpEnd - elapsed,
    };
  }
  if (elapsed >= sessionEnd) {
    if (!config.coolDown) {
      return { dim: 0, index: 6, label: null, name: chakras[6], remaining: 0 };
    }
    return {
      dim: Math.min(1, (elapsed - sessionEnd) / (timerEnd - sessionEnd)),
      index: 6,
      label: "Cool down",
      name: "Cool down",
      remaining: Math.max(0, timerEnd - elapsed),
    };
  }
  const index =
    Math.floor(((elapsed - warmUpEnd) * positionCount(config)) / (sessionEnd - warmUpEnd)) %
    chakras.length;
  return { dim: 0, index, label: null, name: chakras[index], remaining: sessionEnd - elapsed };
}
export function formatRemaining(milliseconds: number) {
  return formatClock(Math.max(0, Math.ceil(milliseconds / 1000)));
}
export function formatClock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** A late browser tick emits one cue, never a burst of missed transitions. */
export function crossedChimeBoundary(timeline: readonly TimelineEntry[], from: number, to: number) {
  return timeline.some((entry) => entry.chime && from < entry.at && entry.at <= to);
}
