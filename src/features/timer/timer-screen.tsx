// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
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

interface Transition {
  from: string;
  restart: boolean;
  session: Session;
  to: "/" | "/reiki-on" | "/reiki-on/edit";
}

const trailingSlash = /\/$/u;

export function TimerLayout() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const router = useRouter();
  const home = pathname === "/";
  const editing = pathname.replace(trailingSlash, "") === "/reiki-on/edit";
  const playback = !(home || editing);
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
    if (transition || session.mode !== "running") {
      return;
    }
    if (!playback) {
      // Back/Forward or a direct edit link can leave playback without using Pause.
      stopChime();
      const pausedAt = Math.min(total, elapsedAt(session, Date.now()));
      setDraft((draft) => ({
        ...draft,
        session: {
          elapsed: pausedAt,
          mode: pausedAt >= total ? "complete" : "paused",
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
    if (transition || !playback || session.mode !== "running") {
      return;
    }
    if (crossedChimeBoundary(timeline, lastElapsed.current, elapsed)) {
      play(config.chime);
    }
    lastElapsed.current = elapsed;
    if (elapsed >= total) {
      setDraft((draft) => ({
        ...draft,
        session: { elapsed: total, mode: "complete", startedAt: 0 },
      }));
    }
  }, [playback, elapsed, total, session.mode, timeline, config.chime, play, transition]);

  useEffect(() => {
    if (!transition && (editing || session.mode === "running" || session.mode === "paused")) {
      hudRef.current?.focus({ preventScroll: true });
    }
  }, [editing, transition, session.mode]);

  function go(to: Transition["to"], next: Session, restart = false) {
    setSaveError(false);
    setTransition({ from: pathname, restart, session: next, to });
  }

  async function afterExit() {
    if (!transition) {
      return;
    }
    // A history navigation during the exit takes precedence over the pending action.
    try {
      if (router.state.location.pathname !== transition.from) {
        return;
      }
      // Motion owns this exit and entrance, including browsers without native view transitions.
      if (transition.to !== transition.from) {
        await router.navigate({
          replace: transition.to === "/",
          to: transition.to,
          viewTransition: false,
        });
        if (router.state.location.pathname !== transition.to) {
          return;
        }
      }
      const next = transition.session;
      const startedAt = next.mode === "running" ? Date.now() : 0;
      if (next.mode === "running") {
        lastElapsed.current = next.elapsed;
        setNow(startedAt);
      }
      if (transition.restart) {
        setResetId((id) => id + 1);
      }
      const homeConfig = transition.to === "/" ? loadConfig() : undefined;
      setDraft((draft) => ({
        config: homeConfig ?? draft.config,
        session: { ...next, startedAt },
      }));
      window.scrollTo?.({ behavior: "instant", top: 0 });
      if (transition.to === "/") {
        requestAnimationFrame(() => hudRef.current?.focus({ preventScroll: true }));
      }
    } finally {
      setTransition(null);
    }
  }

  function start(restart: boolean) {
    stopChime();
    if (config.chimes) {
      prepare(config.chime);
    }
    const next: Session = { elapsed: restart ? 0 : session.elapsed, mode: "running", startedAt: 0 };
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
    if (crossedChimeBoundary(timeline, lastElapsed.current, position)) {
      play(config.chime);
    }
    setDraft({
      config,
      session: { elapsed: position, mode: position >= total ? "complete" : "paused", startedAt: 0 },
    });
  }
  function finish() {
    stopChime();
    setSaveError(false);
    setDraft({
      config,
      session: {
        elapsed: Math.min(total, elapsedAt(session, Date.now())),
        mode: "complete",
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
      elapsed: position,
      mode: completed || position >= total ? "edit-before-save" : "paused",
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
    if (editing) {
      go("/reiki-on", next);
    }
  }
  function changeConfig(next: TimerConfig) {
    if (next.chimes && !config.chimes) {
      prepare(next.chime);
    }
    if (!next.chimes && config.chimes) {
      stopChime();
    }
    setSaveError(false);
    setDraft({ config: next, session });
  }

  function hudMode() {
    if (saveFirst) {
      return "save";
    }
    if (playback && completed) {
      return "paused";
    }
    if (home || completed) {
      return "setup";
    }
    if (session.mode === "running" || session.mode === "paused") {
      return session.mode;
    }
    return "setup";
  }

  let status = "";
  if (completed) {
    status = "Your Reiki session is complete.";
  } else if (session.mode === "paused") {
    status = "Timer paused.";
  } else if (session.mode === "running") {
    status = "Timer running.";
  }

  return (
    <TimerContext
      value={{
        audioError,
        config,
        elapsed,
        onChange: changeConfig,
        onDone: leave,
        onPreviewChime: play,
        phase,
        saved,
      }}
    >
      <Atmosphere
        blackout={blackout}
        cycling={(!playback || saved) && !blackout}
        dim={playback && !completed ? phase.dim : 0}
        phase={phase.index}
        resetId={resetId}
      >
        <section aria-label="Reiki timer" className="timer-screen">
          <div className="timer-foreground" inert={!!transition}>
            <header className="timer-header" data-playback={playback || undefined}>
              <TimerHud
                canResume={session.elapsed < total}
                editing={editing}
                finishRef={finishRef}
                hidden={!!transition || (playback && saved)}
                mode={hudMode()}
                onEdit={edit}
                onFinish={finish}
                onPause={pause}
                onSave={save}
                onStart={start}
                primaryRef={hudRef}
                summary={
                  playback
                    ? undefined
                    : {
                        content: (
                          <TimerSummary
                            {...summarizeTimer(config)}
                            showTimerIcon={config.showTime}
                          />
                        ),
                        timeline: <TimerTimeline entries={timeline} />,
                      }
                }
              />
              {Boolean(saveFirst && saveError) && (
                <p className="timer-hud-error" data-ink="detail" role="alert">
                  Couldn’t save in this browser. Try again.
                </p>
              )}
            </header>
            <AnimatePresence initial={false} mode="wait" onExitComplete={afterExit}>
              {!transition && (
                <TimerScene key="route">
                  <Outlet />
                </TimerScene>
              )}
            </AnimatePresence>
          </div>
          <FinishTimerDialog
            expired={session.elapsed >= total}
            finishRef={finishRef}
            onDismiss={dismissFinish}
            onEdit={edit}
            onLeave={leave}
            onSave={save}
            open={playback && completed && !saved && !transition}
            saveError={saveError}
          />
          <span className="visually-hidden" role="status">
            {playback && status}
          </span>
        </section>
      </Atmosphere>
    </TimerContext>
  );
}
