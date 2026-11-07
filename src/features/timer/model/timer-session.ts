import type { TimerConfig } from "./timer-config";

/** Playback state is independent of the selected route. elapsed is accumulated milliseconds;
 * startedAt is the wall-clock origin only while running. Route departure freezes playback.
 * complete/edit-before-save/saved preserve the finish and explicit-save workflow.
 */
export interface Session {
  elapsed: number;
  mode: "setup" | "running" | "paused" | "complete" | "edit-before-save" | "saved";
  startedAt: number;
}
export function elapsedAt(session: Session, now: number) {
  return session.elapsed + (session.mode === "running" ? Math.max(0, now - session.startedAt) : 0);
}
export const readySession: Session = { elapsed: 0, mode: "setup", startedAt: 0 };
export interface TimerDraft {
  config: TimerConfig;
  session: Session;
}
