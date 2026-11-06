import { AnimatePresence } from "motion/react";
import { TimerSummary } from "@/components/molecules/timer-summary";
import { SaveTimer } from "./save-timer";
import { useTimer } from "./timer-context";
import { TimerScene } from "./timer-scene";
import { formatRemaining, summarizeTimer } from "./timer-state";

export function TimerPlayback() {
  const { config, elapsed, phase, saved } = useTimer();
  return (
    <AnimatePresence mode="wait" initial={false}>
      {saved ? (
        <TimerScene key="saved">
          <SaveTimer />
        </TimerScene>
      ) : (
        <TimerScene key="playback">
          <div className="timer-session">
            {config.showTime && (
              <>
                <div
                  className="timer-countdown"
                  data-ink="display"
                  data-lettering="frosted"
                  role="timer"
                  aria-label="Time remaining"
                >
                  {formatRemaining(phase.remaining)}
                </div>
                {config.showBreakdown ? (
                  <TimerSummary {...summarizeTimer(config, elapsed)} />
                ) : (
                  phase.label && (
                    <p className="timer-phase-label" data-ink="detail">
                      {phase.label}
                    </p>
                  )
                )}
              </>
            )}
          </div>
        </TimerScene>
      )}
    </AnimatePresence>
  );
}
