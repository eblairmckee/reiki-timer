import { createContext, useContext } from "react";
import type { ChimeId } from "./chimes";
import type { sessionPhase, TimerConfig } from "./timer-state";

type TimerContextValue = {
  config: TimerConfig;
  elapsed: number;
  phase: ReturnType<typeof sessionPhase>;
  saved: boolean;
  audioError: string;
  onChange: (config: TimerConfig) => void;
  onPreviewChime: (id: ChimeId) => void;
  onDone: () => void;
};

export const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimer() {
  const value = useContext(TimerContext);
  if (!value) throw new Error("Timer routes must render inside TimerLayout.");
  return value;
}
