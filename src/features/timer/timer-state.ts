import { type ChimeId, defaultChime, isChimeId } from "./chimes";

type ChimeCues = {
  chimeOnChange: boolean;
  chimeOnWarmUpEnd: boolean;
  chimeOnSessionEnd: boolean;
  chimeOnCoolDownEnd: boolean;
};

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
  minutes: 20,
  repeat: false,
  showTime: false,
  showBreakdown: false,
  warmUp: false,
  warmUpMinutes: 1,
  coolDown: false,
  coolDownMinutes: 1,
  chimes: false,
  chime: defaultChime,
  chimeOnChange: false,
  chimeOnWarmUpEnd: false,
  chimeOnSessionEnd: false,
  chimeOnCoolDownEnd: false,
};
export const configStorageKey = "reiki-timer.config";

export function availableChimeCues({ warmUp, coolDown }: TimerConfig) {
  const cues: (keyof ChimeCues)[] = ["chimeOnChange"];
  if (warmUp) cues.push("chimeOnWarmUpEnd");
  cues.push("chimeOnSessionEnd");
  if (coolDown) cues.push("chimeOnCoolDownEnd");
  return cues;
}

export function hasChimeCue(config: TimerConfig) {
  return availableChimeCues(config).some((cue) => config[cue]);
}

export function normalizeChimes(config: TimerConfig): TimerConfig {
  return config.chimes && !hasChimeCue(config) ? { ...config, chimes: false } : config;
}

export function parseConfig(value: unknown): TimerConfig {
  if (typeof value !== "object" || value === null) return { ...defaultConfig };
  const data = value as Record<string, unknown>;
  function minutes(key: string, fallback: number, min: number, max: number) {
    const value = data[key];
    return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
      ? value
      : fallback;
  }
  const cues = {
    chimeOnChange: data.chimeOnChange === true,
    chimeOnWarmUpEnd: data.chimeOnWarmUpEnd === true,
    chimeOnSessionEnd: data.chimeOnSessionEnd === true,
    chimeOnCoolDownEnd: data.chimeOnCoolDownEnd === true,
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
    minutes: minutes("minutes", 20, 5, 60),
    repeat: data.repeat === true,
    showTime: data.showTime === true,
    showBreakdown: data.showBreakdown === true,
    warmUp: data.warmUp === true,
    warmUpMinutes: minutes("warmUpMinutes", 1, 1, 10),
    coolDown: data.coolDown === true,
    coolDownMinutes: minutes("coolDownMinutes", 1, 1, 10),
    chimes: data.chimes === true,
    chime: isChimeId(data.chime) ? data.chime : defaultChime,
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
  return { warmUpEnd, sessionEnd, timerEnd };
}
export function durationMs(config: TimerConfig) {
  return phaseEnds(config).timerEnd;
}

export function summarizeTimer(config: TimerConfig, elapsed = 0) {
  const { warmUpEnd, sessionEnd, timerEnd } = phaseEnds(config);
  return {
    warmUpMinutes: config.warmUp && elapsed < warmUpEnd ? config.warmUpMinutes : undefined,
    coolDownMinutes: config.coolDown && elapsed < timerEnd ? config.coolDownMinutes : undefined,
    sessionMinutes: elapsed < sessionEnd ? config.minutes : undefined,
    repeat: config.repeat && elapsed < sessionEnd,
    chimes: config.chimes,
  };
}

export type Session = {
  mode: "setup" | "running" | "paused" | "complete" | "edit-before-save" | "saved";
  elapsed: number;
  startedAt: number;
};
export function elapsedAt(session: Session, now: number) {
  return session.elapsed + (session.mode === "running" ? Math.max(0, now - session.startedAt) : 0);
}
const chakras = ["Root", "Sacral", "Solar plexus", "Heart", "Throat", "Third eye", "Crown"];
function positionCount(config: TimerConfig) {
  return chakras.length * (config.repeat ? 2 : 1);
}

export type TimelineEntry = {
  at: number;
  label: string;
  position?: number;
  detail?: string;
  chime: boolean;
};

export function timerTimeline(config: TimerConfig): TimelineEntry[] {
  const { warmUpEnd, sessionEnd, timerEnd } = phaseEnds(config);
  const count = positionCount(config);
  const entries: TimelineEntry[] = [];
  if (config.warmUp) entries.push({ at: 0, label: "Warm up", chime: false });
  // Position one is a timed change only when a warm up precedes it.
  for (let i = config.warmUp ? 0 : 1; i < count; i++) {
    const chakra = i % chakras.length;
    const cue = i === 0 ? config.warmUp && config.chimeOnWarmUpEnd : config.chimeOnChange;
    entries.push({
      at: warmUpEnd + ((sessionEnd - warmUpEnd) * i) / count,
      label: chakras[chakra],
      position: chakra + 1,
      detail: config.repeat && chakra === 0 ? `Round ${i === 0 ? 1 : 2}` : undefined,
      chime: config.chimes && cue,
    });
  }
  entries.push({
    at: sessionEnd,
    label: config.coolDown ? "Cool down begins" : "Session ends",
    chime: config.chimes && config.chimeOnSessionEnd,
  });
  if (config.coolDown)
    entries.push({
      at: timerEnd,
      label: "Cool down ends",
      chime: config.chimes && config.chimeOnCoolDownEnd,
    });
  return entries;
}

export function sessionPhase(config: TimerConfig, elapsed: number) {
  const { warmUpEnd, sessionEnd, timerEnd } = phaseEnds(config);
  if (elapsed < warmUpEnd)
    return {
      index: 0,
      name: "Warm up",
      label: "Warm up",
      remaining: warmUpEnd - elapsed,
      dim: 1 - elapsed / warmUpEnd,
    };
  if (elapsed >= sessionEnd) {
    if (!config.coolDown) return { index: 6, name: chakras[6], label: null, remaining: 0, dim: 0 };
    return {
      index: 6,
      name: "Cool down",
      label: "Cool down",
      remaining: Math.max(0, timerEnd - elapsed),
      dim: Math.min(1, (elapsed - sessionEnd) / (timerEnd - sessionEnd)),
    };
  }
  const index =
    Math.floor(((elapsed - warmUpEnd) * positionCount(config)) / (sessionEnd - warmUpEnd)) %
    chakras.length;
  return { index, name: chakras[index], label: null, remaining: sessionEnd - elapsed, dim: 0 };
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
