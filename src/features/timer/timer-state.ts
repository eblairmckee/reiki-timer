export type TimerConfig = {
  minutes: number;
  repeat: boolean;
  showTime: boolean;
  warmUp: boolean;
  warmUpMinutes: number;
  coolDown: boolean;
  coolDownMinutes: number;
};
export const defaultConfig: TimerConfig = {
  minutes: 20,
  repeat: false,
  showTime: false,
  warmUp: false,
  warmUpMinutes: 1,
  coolDown: false,
  coolDownMinutes: 1,
};
export const configStorageKey = "reiki-timer.config";

export function parseConfig(value: unknown): TimerConfig {
  if (typeof value !== "object" || value === null) return { ...defaultConfig };
  const data = value as Record<string, unknown>;
  function minutes(key: string, fallback: number, min: number, max: number) {
    const value = data[key];
    return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
      ? value
      : fallback;
  }
  return {
    minutes: minutes("minutes", 20, 5, 60),
    repeat: data.repeat === true,
    showTime: data.showTime === true,
    warmUp: data.warmUp === true,
    warmUpMinutes: minutes("warmUpMinutes", 1, 1, 10),
    coolDown: data.coolDown === true,
    coolDownMinutes: minutes("coolDownMinutes", 1, 1, 10),
  };
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
  } catch {
    /* The timer remains usable when browser storage is unavailable. */
  }
}
export function durationMs(config: TimerConfig) {
  return (
    (config.minutes +
      (config.warmUp ? config.warmUpMinutes : 0) +
      (config.coolDown ? config.coolDownMinutes : 0)) *
    60_000
  );
}
export type Session = {
  mode: "setup" | "starting" | "running" | "paused" | "complete";
  elapsed: number;
  startedAt: number;
};
export function elapsedAt(session: Session, now: number) {
  return session.elapsed + (session.mode === "running" ? Math.max(0, now - session.startedAt) : 0);
}
const chakras = ["Root", "Sacral", "Solar plexus", "Heart", "Throat", "Third eye", "Crown"];
export function sessionPhase(config: TimerConfig, elapsed: number) {
  const warmUp = config.warmUp ? config.warmUpMinutes * 60_000 : 0;
  const main = config.minutes * 60_000;
  if (elapsed < warmUp) return { index: 0, name: "Warm up", dim: 1 - elapsed / warmUp };
  if (elapsed >= warmUp + main) {
    if (!config.coolDown) return { index: 6, name: chakras[6], dim: 0 };
    const coolDown = config.coolDownMinutes * 60_000;
    return { index: 6, name: "Cool down", dim: Math.min(1, (elapsed - warmUp - main) / coolDown) };
  }
  const slice = main / (7 * (config.repeat ? 2 : 1));
  const index = Math.floor((elapsed - warmUp) / slice) % 7;
  return { index, name: chakras[index], dim: 0 };
}
export function formatRemaining(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
