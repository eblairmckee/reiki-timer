import { AnimatePresence, motion, useIsPresent } from "motion/react";
import type { ReactNode, Ref } from "react";
import { Button } from "../../components/ui/button";
import { sceneMotion } from "../../components/ui/shared/motion";
import { useReducedMotion } from "../../components/ui/shared/use-reduced-motion";
import { PlayIcon, StopIcon } from "./timer-icons";
import type { Session } from "./timer-state";

function SecondaryActions({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="timer-hud-secondary"
      inert={!present}
      aria-hidden={!present}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "auto", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { width: { duration: 0.45, ease: "easeInOut" }, opacity: { duration: 0.3 } }
      }
    >
      <div className="timer-hud-actions">{children}</div>
    </motion.div>
  );
}

type Props = {
  mode: Session["mode"];
  editing: boolean;
  canResume: boolean;
  primaryRef: Ref<HTMLButtonElement>;
  onStart: (restart: boolean) => void;
  onStop: () => void;
  onFinish: () => void;
  onEdit: () => void;
};
export function TimerHud({
  mode,
  editing,
  canResume,
  primaryRef,
  onStart,
  onStop,
  onFinish,
  onEdit,
}: Props) {
  const paused = mode === "paused";
  const reduced = useReducedMotion();
  const leaving = mode === "starting" || mode === "complete";
  return (
    <motion.fieldset
      className="timer-hud"
      aria-label="Timer controls"
      inert={leaving}
      initial={false}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={reduced ? { duration: 0 } : leaving ? sceneMotion.exit : sceneMotion.enter}
    >
      <AnimatePresence initial={false} mode="wait">
        {paused && (
          <SecondaryActions key={editing ? "editing-actions" : "paused-actions"}>
            {editing ? (
              <Button mode="frost-ghost" aria-label="Restart timer" onClick={() => onStart(true)}>
                <span data-ink="">Restart</span>
              </Button>
            ) : (
              <>
                <Button mode="frost-ghost" aria-label="Finish timer" onClick={onFinish}>
                  <span data-ink="">Finish</span>
                </Button>
                <Button mode="frost-ghost" aria-label="Edit timer" onClick={onEdit}>
                  <span data-ink="">Edit</span>
                </Button>
              </>
            )}
          </SecondaryActions>
        )}
      </AnimatePresence>
      <Button
        ref={primaryRef}
        mode="frost"
        asIcon
        className="timer-hud-primary"
        hint={mode === "setup"}
        disabled={paused && !canResume}
        aria-label={mode === "running" ? "Stop timer" : paused ? "Resume timer" : "Start timer"}
        title={mode === "running" ? "Pause" : paused ? "Resume" : "Start"}
        onClick={() => {
          if (!leaving) mode === "running" ? onStop() : onStart(!paused);
        }}
      >
        {mode === "running" ? <StopIcon /> : <PlayIcon />}
      </Button>
    </motion.fieldset>
  );
}
