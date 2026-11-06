import { AnimatePresence } from "motion/react";
import { TimerSummary } from "@/components/molecules/timer-summary";
import { SaveTimer } from "./save-timer";
import { useTimer } from "./timer-context";
import { TimerScene } from "./timer-scene";
import { formatRemaining, summarizeTimer } from "./timer-state";

export function TimerPlayback() {
  const { config, elapsed, phase, saved } = useTimer();
  return (
    <AnimatePresence initial={false} mode="wait">
      {saved ? (
        <TimerScene key="saved">
          <SaveTimer />
        </TimerScene>
      ) : (
        <TimerScene key="playback">
          <div className="timer-session">
            {Boolean(config.showTime) && (
              <>
                <div
                  aria-label="Time remaining"
                  className="timer-countdown"
                  data-ink="display"
                  data-lettering="frosted"
                  role="timer"
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
