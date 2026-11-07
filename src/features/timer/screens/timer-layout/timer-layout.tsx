// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
import { Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Scene } from "@/components/atoms/scene";
import { Timeline } from "@/components/molecules/timeline";
import { CyclingAtmosphere } from "@/components/organisms/cycling-atmosphere";
import { FinishTimerDialog } from "@/features/timer/components/finish-timer-dialog/finish-timer-dialog";
import { TimerHud } from "@/features/timer/components/timer-hud/timer-hud";
import { TimerSummary } from "@/features/timer/components/timer-summary/timer-summary";
import { chakraPalettes } from "@/features/timer/data/chakra-palettes";
import { useTimerSession } from "@/features/timer/hooks/use-timer-session";
import { readySession, type Session } from "@/features/timer/model/timer-session";
import { summarizeTimer } from "@/features/timer/model/timer-timeline";
import { TimerContext } from "@/features/timer/state/timer-context";
import { timelineItems } from "@/features/timer/utils/timeline-items";
import "./style.css";

interface Transition {
  from: string;
  navigationVersion: number;
  restart: boolean;
  session: Session;
  to: "/" | "/reiki-on" | "/reiki-on/edit";
}

const trailingSlash = /\/$/u;

/** Coordinates timer route/exit transactions, scene composition and focus.
 * Routes select views; they do not create playback sessions.
 * The session hook owns product commands, pure models own rules and services own browser I/O.
 */
export function TimerLayout() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const router = useRouter();
  const home = pathname === "/";
  const editing = pathname.replace(trailingSlash, "") === "/reiki-on/edit";
  const playback = !(home || editing);
  const [resetId, setResetId] = useState(0);
  const [transition, setTransition] = useState<Transition | null>(null);
  const pendingTransition = useRef<Transition | null>(null);
  const committingTransition = useRef<Transition | null>(null);
  const navigationVersion = useRef(0);
  const hudRef = useRef<HTMLButtonElement>(null);
  const finishRef = useRef<HTMLButtonElement>(null);
  const timer = useTimerSession({ home, playback, transitioning: !!transition });
  const {
    config,
    session,
    elapsed,
    total,
    phase,
    timeline,
    saved,
    completed,
    audioError,
    saveError,
    changeConfig,
    play,
    stopChime,
    pause,
    finish,
    dismissFinish,
  } = timer;
  const saveFirst =
    editing && (completed || session.mode === "setup" || transition?.session.mode === "saved");
  const blackout = transition?.restart === true;

  useEffect(() => {
    // Count navigations, including leave-and-return to the same path. Audio belongs
    // to the view that requested it, even when that view has a paused session.
    const unsubscribe = router.subscribe("onBeforeNavigate", () => {
      navigationVersion.current += 1;
      stopChime();
    });
    return () => {
      unsubscribe();
      pendingTransition.current = null;
      committingTransition.current = null;
    };
  }, [router, stopChime]);

  useEffect(() => {
    if (!transition && (editing || session.mode === "running" || session.mode === "paused")) {
      hudRef.current?.focus({ preventScroll: true });
    }
  }, [editing, transition, session.mode]);

  function go(to: Transition["to"], next: Session, restart = false) {
    if (pendingTransition.current) {
      return;
    }
    timer.clearSaveError();
    const pending = {
      from: pathname,
      navigationVersion: navigationVersion.current,
      restart,
      session: next,
      to,
    };
    pendingTransition.current = pending;
    setTransition(pending);
  }

  async function afterExit() {
    if (
      !transition ||
      pendingTransition.current !== transition ||
      committingTransition.current === transition
    ) {
      return;
    }
    committingTransition.current = transition;
    // A history navigation during the exit takes precedence over the pending action.
    try {
      if (
        navigationVersion.current !== transition.navigationVersion ||
        router.state.location.pathname !== transition.from
      ) {
        return;
      }
      // Motion owns this exit and entrance, including browsers without native view transitions.
      if (transition.to !== transition.from) {
        await router.navigate({
          replace: transition.to === "/",
          to: transition.to,
          viewTransition: false,
        });
        if (
          pendingTransition.current !== transition ||
          navigationVersion.current !== transition.navigationVersion + 1 ||
          router.state.location.pathname !== transition.to
        ) {
          return;
        }
      }
      applyTransition(transition);
    } finally {
      if (pendingTransition.current === transition) {
        pendingTransition.current = null;
        setTransition(null);
      }
    }
  }

  function applyTransition(pending: Transition) {
    timer.commit(pending.session, pending.to === "/");
    if (pending.restart) {
      setResetId((id) => id + 1);
    }
    window.scrollTo?.({ behavior: "instant", top: 0 });
    if (pending.to === "/") {
      requestAnimationFrame(() => hudRef.current?.focus({ preventScroll: true }));
    }
  }

  function start(restart: boolean) {
    const next = timer.prepareStart(restart);
    if (!restart && playback) {
      timer.commit(next);
    } else {
      go("/reiki-on", next, restart);
    }
  }
  function edit() {
    go("/reiki-on/edit", timer.prepareEdit());
  }
  function leave() {
    stopChime();
    go("/", readySession);
  }
  function save() {
    const next = timer.save();
    if (next && editing) {
      go("/reiki-on", next);
    }
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
      <CyclingAtmosphere
        blackout={blackout}
        cycling={(!playback || saved) && !blackout}
        dim={playback && !completed ? phase.dim : 0}
        fixedIndex={phase.index}
        palettes={chakraPalettes}
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
                        timeline: (
                          <Timeline heading="Session timeline" items={timelineItems(timeline)} />
                        ),
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
                <Scene key="route">
                  <Outlet />
                </Scene>
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
      </CyclingAtmosphere>
    </TimerContext>
  );
}
