import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Atmosphere } from "../../components/atoms/atmosphere";
import { sceneMotion } from "../../components/ui/shared/motion";
import { useReducedMotion } from "../../components/ui/shared/use-reduced-motion";
import { TimerHud } from "./timer-hud";
import { TimerSettings } from "./timer-settings";
import {
  durationMs,
  elapsedAt,
  formatRemaining,
  loadConfig,
  type Session,
  saveConfig,
  sessionPhase,
} from "./timer-state";
import "./style.css";

function ScreenContent({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return (
    <motion.div
      inert={!present}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : present ? sceneMotion.enter : sceneMotion.exit}
    >
      {children}
    </motion.div>
  );
}

export function TimerScreen() {
  const reduced = useReducedMotion();
  const [config, setConfig] = useState(loadConfig);
  const [session, setSession] = useState<Session>({ mode: "setup", elapsed: 0, startedAt: 0 });
  const [now, setNow] = useState(Date.now);
  const [editing, setEditing] = useState(false);
  const [resetId, setResetId] = useState(0);
  const [completed, setCompleted] = useState(false);
  const hudRef = useRef<HTMLButtonElement>(null);
  const elapsed = elapsedAt(session, now);
  const total = durationMs(config);
  const remaining = Math.max(0, total - elapsed);
  const phase = sessionPhase(config, elapsed);
  const showingSettings = session.mode === "setup" || editing;
  const leaving = session.mode === "starting" || session.mode === "complete";
  const canResume = session.elapsed < total;

  useEffect(() => {
    if (session.mode !== "running") return;
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [session.mode]);
  useEffect(() => {
    if (session.mode === "running" && elapsed >= total) {
      setCompleted(true);
      setSession({ mode: "complete", elapsed: total, startedAt: 0 });
    }
  }, [elapsed, total, session.mode]);
  useEffect(() => {
    if (session.mode === "running" || session.mode === "paused")
      hudRef.current?.focus({ preventScroll: true });
  }, [session.mode]);

  function start(restart = true) {
    saveConfig(config);
    setCompleted(false);
    setEditing(false);
    if (restart) {
      // The clock starts after the foreground exits and the atmosphere reaches black.
      setSession({ mode: "starting", elapsed: 0, startedAt: 0 });
    } else {
      const timestamp = Date.now();
      setNow(timestamp);
      setSession({ mode: "running", elapsed: session.elapsed, startedAt: timestamp });
    }
    window.scrollTo?.({ top: 0, behavior: "instant" });
  }
  function stop() {
    setSession({
      mode: "paused",
      elapsed: Math.min(total, elapsedAt(session, Date.now())),
      startedAt: 0,
    });
  }
  function finish() {
    setCompleted(false);
    setEditing(false);
    setSession({ mode: "complete", elapsed: session.elapsed, startedAt: 0 });
  }
  function afterExit() {
    if (session.mode === "starting") {
      const timestamp = Date.now();
      setNow(timestamp);
      setResetId((id) => id + 1);
      setSession({ mode: "running", elapsed: 0, startedAt: timestamp });
    } else if (session.mode === "complete") {
      setSession({ mode: "setup", elapsed: 0, startedAt: 0 });
      window.scrollTo?.({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => hudRef.current?.focus({ preventScroll: true }));
    }
  }

  return (
    <Atmosphere
      cycling={showingSettings && !leaving}
      phase={phase.index}
      dim={showingSettings ? 0 : phase.dim}
      blackout={session.mode === "starting"}
      resetId={resetId}
    >
      <section className="timer-screen" aria-label="Reiki timer">
        <div className="timer-foreground" inert={leaving}>
          <header className="timer-header">
            <AnimatePresence initial={false}>
              {showingSettings && !leaving && (
                <motion.h1
                  className="timer-wordmark"
                  data-ink="label"
                  aria-label="Reiki timer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: reduced ? { duration: 0 } : sceneMotion.exit }}
                  transition={reduced ? { duration: 0 } : sceneMotion.enter}
                >
                  <span className="timer-wordmark-initial">R</span>eiki timer
                </motion.h1>
              )}
            </AnimatePresence>
            <TimerHud
              mode={session.mode}
              editing={editing}
              canResume={canResume}
              primaryRef={hudRef}
              onStart={start}
              onStop={stop}
              onFinish={finish}
              onEdit={() => {
                setEditing(!editing);
                hudRef.current?.focus({ preventScroll: true });
                window.scrollTo?.({ top: 0, behavior: "instant" });
              }}
            />
          </header>
          <AnimatePresence mode="wait" initial={false} onExitComplete={afterExit}>
            {!leaving &&
              (showingSettings ? (
                <ScreenContent key="settings">
                  <TimerSettings config={config} onChange={setConfig} />
                </ScreenContent>
              ) : (
                <ScreenContent key="session">
                  <div className="timer-session">
                    {config.showTime && (
                      <div
                        className="timer-countdown"
                        data-ink="display"
                        role="timer"
                        aria-label="Time remaining"
                      >
                        {formatRemaining(remaining)}
                      </div>
                    )}
                  </div>
                </ScreenContent>
              ))}
          </AnimatePresence>
        </div>
        <span className="visually-hidden" role="status">
          {completed
            ? "Your Reiki session is complete."
            : session.mode === "paused"
              ? "Timer paused."
              : session.mode === "running"
                ? "Timer running."
                : ""}
        </span>
      </section>
    </Atmosphere>
  );
}
