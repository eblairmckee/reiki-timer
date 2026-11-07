import { useEffect, useMemo, useRef, useState } from "react";
import type { TimerConfig } from "../model/timer-config";
import { elapsedAt, type Session } from "../model/timer-session";
import {
  crossedChimeBoundary,
  durationMs,
  sessionPhase,
  timerTimeline,
} from "../model/timer-timeline";
import { loadConfig, loadDraft, saveConfig, storeDraft } from "../services/timer-storage";
import { useChimes } from "./use-chimes";

interface SessionView {
  home: boolean;
  playback: boolean;
  transitioning: boolean;
}

/** Owns the single timer draft, wall clock, audio and persistence lifetime.
 * prepareStart runs within the user gesture; commit starts its clock only after
 * the layout accepts the route/exit transaction. Route identity and focus stay
 * with the layout. Derived values never become a second session store.
 */
export function useTimerSession({ home, playback, transitioning: transition }: SessionView) {
  const [{ config, session }, setDraft] = useState(() => loadDraft(!home));
  const [now, setNow] = useState(Date.now);
  const [saveError, setSaveError] = useState(false);
  const lastElapsed = useRef(elapsedAt(session, now));
  const { prepare, play, stop: stopChime, error: audioError } = useChimes();
  const elapsed = elapsedAt(session, now);
  const total = durationMs(config);
  const phase = sessionPhase(config, elapsed);
  const timeline = useMemo(() => timerTimeline(config), [config]);
  const saved = session.mode === "saved";
  const completed = saved || session.mode === "complete" || session.mode === "edit-before-save";
  useEffect(() => {
    storeDraft(home && session.mode === "setup" ? null : { config, session });
  }, [home, config, session]);

  useEffect(() => {
    if (session.mode !== "running") {
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
    if (transition) {
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

  function prepareStart(restart: boolean): Session {
    stopChime();
    if (config.chimes) {
      prepare(config.chime);
    }
    return { elapsed: restart ? 0 : session.elapsed, mode: "running", startedAt: 0 };
  }

  /** Commit only an accepted transaction; elapsed excludes time spent exiting. */
  function commit(next: Session, reloadConfig = false) {
    const startedAt = next.mode === "running" ? Date.now() : 0;
    if (next.mode === "running") {
      lastElapsed.current = next.elapsed;
      setNow(startedAt);
    }
    const homeConfig = reloadConfig ? loadConfig() : undefined;
    setDraft((draft) => ({ config: homeConfig ?? draft.config, session: { ...next, startedAt } }));
  }

  function prepareEdit(): Session {
    stopChime();
    const position = Math.min(total, elapsedAt(session, Date.now()));
    return {
      elapsed: position,
      mode: completed || position >= total ? "edit-before-save" : "paused",
      startedAt: 0,
    };
  }

  function save(): Session | null {
    if (!saveConfig(config)) {
      setSaveError(true);
      return null;
    }
    setSaveError(false);
    stopChime();
    const next: Session = { ...session, mode: "saved" };
    setDraft({ config, session: next });
    return next;
  }

  function clearSaveError() {
    setSaveError(false);
  }

  return {
    audioError,
    changeConfig,
    clearSaveError,
    commit,
    completed,
    config,
    dismissFinish,
    elapsed,
    finish,
    pause,
    phase,
    play,
    prepareEdit,
    prepareStart,
    save,
    saved,
    saveError,
    session,
    stopChime,
    timeline,
    total,
  };
}
