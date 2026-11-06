import { createContext, useContext } from "react";
import type { ChimeId } from "./chimes";
import type { sessionPhase, TimerConfig } from "./timer-state";

interface TimerContextValue {
  audioError: string;
  config: TimerConfig;
  elapsed: number;
  onChange: (config: TimerConfig) => void;
  onDone: () => void;
  onPreviewChime: (id: ChimeId) => void;
  phase: ReturnType<typeof sessionPhase>;
  saved: boolean;
}

export const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimer() {
  const value = useContext(TimerContext);
  if (!value) {
    throw new Error("Timer routes must render inside TimerLayout.");
  }
  return value;
}
