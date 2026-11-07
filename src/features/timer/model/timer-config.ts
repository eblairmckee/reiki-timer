import { type ChimeId, defaultChime, isChimeId } from "../data/chimes";

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
