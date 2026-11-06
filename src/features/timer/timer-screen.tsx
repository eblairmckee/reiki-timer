import { Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TimerSummary } from "@/components/molecules/timer-summary";
import { Atmosphere } from "../../components/atoms/atmosphere";
import { FinishTimerDialog } from "./finish-timer-dialog";
import { TimerContext } from "./timer-context";
import { loadDraft, readySession, storeDraft } from "./timer-draft";
import { TimerHud } from "./timer-hud";
import { TimerScene } from "./timer-scene";
import {
  crossedChimeBoundary,
  durationMs,
  elapsedAt,
  loadConfig,
  type Session,
  saveConfig,
  sessionPhase,
  summarizeTimer,
  type TimerConfig,
  timerTimeline,
} from "./timer-state";
import { TimerTimeline } from "./timer-timeline";
import { useChimes } from "./use-chimes";
import "./style.css";

type Transition = {
  from: string;
  to: "/" | "/reiki-on" | "/reiki-on/edit";
  session: Session;
  restart: boolean;
};

export function TimerLayout() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const router = useRouter();
  const home = pathname === "/";
  const editing = pathname.replace(/\/$/, "") === "/reiki-on/edit";
  const playback = !home && !editing;
  const [{ config, session }, setDraft] = useState(() => loadDraft(!home));
  const [now, setNow] = useState(Date.now);
  const [resetId, setResetId] = useState(0);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [saveError, setSaveError] = useState(false);
  const hudRef = useRef<HTMLButtonElement>(null);
  const finishRef = useRef<HTMLButtonElement>(null);
  // Restoring a running tab skips cues that occurred while its document was closed.
  const lastElapsed = useRef(elapsedAt(session, now));
  const { prepare, play, stop: stopChime, error: audioError } = useChimes();
  const elapsed = elapsedAt(session, now);
  const total = durationMs(config);
  const phase = sessionPhase(config, elapsed);
  const timeline = useMemo(() => timerTimeline(config), [config]);
  const saved = session.mode === "saved";
  const completed = saved || session.mode === "complete" || session.mode === "edit-before-save";
  const saveFirst =
    editing && (completed || session.mode === "setup" || transition?.session.mode === "saved");
  const blackout = transition?.restart === true;

  useEffect(() => {
    storeDraft(home && session.mode === "setup" ? null : { config, session });
  }, [home, config, session]);

  useEffect(() => {
    if (transition || session.mode !== "running") return;
    if (!playback) {
      // Back/Forward or a direct edit link can leave playback without using Pause.
      stopChime();
      const pausedAt = Math.min(total, elapsedAt(session, Date.now()));
      setDraft((draft) => ({
        ...draft,
        session: {
          mode: pausedAt >= total ? "complete" : "paused",
          elapsed: pausedAt,
          startedAt: 0,
        },
      }));
      return;
    }
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [playback, session, total, stopChime, transition]);

  useEffect(() => {
    if (transition || !playback || session.mode !== "running") return;
    if (crossedChimeBoundary(timeline, lastElapsed.current, elapsed)) play(config.chime);
    lastElapsed.current = elapsed;
    if (elapsed >= total)
      setDraft((draft) => ({
        ...draft,
        session: { mode: "complete", elapsed: total, startedAt: 0 },
      }));
  }, [playback, elapsed, total, session.mode, timeline, config.chime, play, transition]);

  useEffect(() => {
    if (!transition && (editing || session.mode === "running" || session.mode === "paused")) {
      hudRef.current?.focus({ preventScroll: true });
    }
  }, [editing, transition, session.mode]);

  function go(to: Transition["to"], next: Session, restart = false) {
    setSaveError(false);
    setTransition({ from: pathname, to, session: next, restart });
  }

  async function afterExit() {
    if (!transition) return;
    // A history navigation during the exit takes precedence over the pending action.
    try {
      if (router.state.location.pathname !== transition.from) return;
      // Motion owns this exit and entrance, including browsers without native view transitions.
      if (transition.to !== transition.from) {
        await router.navigate({
          to: transition.to,
          replace: transition.to === "/",
          viewTransition: false,
        });
        if (router.state.location.pathname !== transition.to) return;
      }
      const next = transition.session;
      const startedAt = next.mode === "running" ? Date.now() : 0;
      if (next.mode === "running") {
        lastElapsed.current = next.elapsed;
        setNow(startedAt);
      }
      if (transition.restart) setResetId((id) => id + 1);
      const homeConfig = transition.to === "/" ? loadConfig() : undefined;
      setDraft((draft) => ({
        config: homeConfig ?? draft.config,
        session: { ...next, startedAt },
      }));
      window.scrollTo?.({ top: 0, behavior: "instant" });
      if (transition.to === "/")
        requestAnimationFrame(() => hudRef.current?.focus({ preventScroll: true }));
    } finally {
      setTransition(null);
    }
  }

  function start(restart: boolean) {
    stopChime();
    if (config.chimes) prepare(config.chime);
    const next: Session = { mode: "running", elapsed: restart ? 0 : session.elapsed, startedAt: 0 };
    if (!restart && playback) {
      const timestamp = Date.now();
      lastElapsed.current = next.elapsed;
      setNow(timestamp);
      setDraft({ config, session: { ...next, startedAt: timestamp } });
    } else {
      go("/reiki-on", next, restart);
    }
  }
  function pause() {
    const position = Math.min(total, elapsedAt(session, Date.now()));
    stopChime();
    if (crossedChimeBoundary(timeline, lastElapsed.current, position)) play(config.chime);
    setDraft({
      config,
      session: { mode: position >= total ? "complete" : "paused", elapsed: position, startedAt: 0 },
    });
  }
  function finish() {
    stopChime();
    setSaveError(false);
    setDraft({
      config,
      session: {
        mode: "complete",
        elapsed: Math.min(total, elapsedAt(session, Date.now())),
        startedAt: 0,
      },
    });
  }
  function dismissFinish() {
    setSaveError(false);
    setDraft((draft) => ({
      ...draft,
      session: { ...draft.session, mode: "paused", startedAt: 0 },
    }));
  }
  function edit() {
    stopChime();
    const position = Math.min(total, elapsedAt(session, Date.now()));
    go("/reiki-on/edit", {
      mode: completed || position >= total ? "edit-before-save" : "paused",
      elapsed: position,
      startedAt: 0,
    });
  }
  function leave() {
    stopChime();
    go("/", readySession);
  }
  function save() {
    if (!saveConfig(config)) {
      setSaveError(true);
      return;
    }
    setSaveError(false);
    stopChime();
    const next: Session = { ...session, mode: "saved" };
    setDraft({ config, session: next });
    if (editing) go("/reiki-on", next);
  }
  function changeConfig(next: TimerConfig) {
    if (next.chimes && !config.chimes) prepare(next.chime);
    if (!next.chimes && config.chimes) stopChime();
    setSaveError(false);
    setDraft({ session, config: next });
  }

  function hudMode() {
    if (saveFirst) return "save";
    if (playback && completed) return "paused";
    if (home || completed) return "setup";
    return session.mode === "running" ? "running" : session.mode === "paused" ? "paused" : "setup";
  }

  return (
    <TimerContext
      value={{
        config,
        elapsed,
        phase,
        saved,
        audioError,
        onChange: changeConfig,
        onPreviewChime: play,
        onDone: leave,
      }}
    >
      <Atmosphere
        cycling={(!playback || saved) && !blackout}
        phase={phase.index}
        dim={playback && !completed ? phase.dim : 0}
        blackout={blackout}
        resetId={resetId}
      >
        <section className="timer-screen" aria-label="Reiki timer">
          <div className="timer-foreground" inert={!!transition}>
            <header className="timer-header" data-playback={playback || undefined}>
              <TimerHud
                mode={hudMode()}
                hidden={!!transition || (playback && saved)}
                summary={
                  !playback
                    ? {
                        content: (
                          <TimerSummary
                            {...summarizeTimer(config)}
                            showTimerIcon={config.showTime}
                          />
                        ),
                        timeline: <TimerTimeline entries={timeline} />,
                      }
                    : undefined
                }
                editing={editing}
                canResume={session.elapsed < total}
                primaryRef={hudRef}
                finishRef={finishRef}
                onStart={start}
                onPause={pause}
                onFinish={finish}
                onEdit={edit}
                onSave={save}
              />
              {saveFirst && saveError && (
                <p className="timer-hud-error" data-ink="detail" role="alert">
                  Couldn’t save in this browser. Try again.
                </p>
              )}
            </header>
            <AnimatePresence mode="wait" initial={false} onExitComplete={afterExit}>
              {!transition && (
                <TimerScene key="route">
                  <Outlet />
                </TimerScene>
              )}
            </AnimatePresence>
          </div>
          <FinishTimerDialog
            open={playback && completed && !saved && !transition}
            expired={session.elapsed >= total}
            saveError={saveError}
            finishRef={finishRef}
            onDismiss={dismissFinish}
            onLeave={leave}
            onSave={save}
            onEdit={edit}
          />
          <span className="visually-hidden" role="status">
            {playback &&
              (completed
                ? "Your Reiki session is complete."
                : session.mode === "paused"
                  ? "Timer paused."
                  : session.mode === "running"
                    ? "Timer running."
                    : "")}
          </span>
        </section>
      </Atmosphere>
    </TimerContext>
  );
}
