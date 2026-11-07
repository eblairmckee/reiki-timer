import { chakras } from "../data/chakras";
import type { TimerConfig } from "./timer-config";

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
/** A late browser tick emits one cue, never a burst of missed transitions. */
export function crossedChimeBoundary(timeline: readonly TimelineEntry[], from: number, to: number) {
  return timeline.some((entry) => entry.chime && from < entry.at && entry.at <= to);
}
