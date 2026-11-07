import { AnimatePresence } from "motion/react";
import { Scene } from "@/components/atoms/scene";
import { TimerSaved } from "@/features/timer/components/timer-saved/timer-saved";
import { TimerSummary } from "@/features/timer/components/timer-summary/timer-summary";
import { summarizeTimer } from "@/features/timer/model/timer-timeline";
import { useTimer } from "@/features/timer/state/timer-context";
import { formatRemaining } from "@/utils/time/format-duration";

import "./style.css";
import "../../styles/session.css";

export function TimerPlayback() {
  const { config, elapsed, phase, saved, onDone } = useTimer();
  return (
    <AnimatePresence initial={false} mode="wait">
      {saved ? (
        <Scene key="saved">
          <TimerSaved onDone={onDone} />
        </Scene>
      ) : (
        <Scene key="playback">
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
        </Scene>
      )}
    </AnimatePresence>
  );
}
