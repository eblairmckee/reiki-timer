import { createContext, useContext } from "react";
import type { ChimeId } from "@/features/timer/data/chimes";
import type { TimerConfig } from "@/features/timer/model/timer-config";
import type { sessionPhase } from "@/features/timer/model/timer-timeline";

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
