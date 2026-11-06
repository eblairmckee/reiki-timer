import { loadConfig, parseConfig, type Session, type TimerConfig } from "./timer-state";

export const draftStorageKey = "reiki-timer.session";
export const readySession: Session = { mode: "setup", elapsed: 0, startedAt: 0 };
export type TimerDraft = { config: TimerConfig; session: Session };

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const { mode, elapsed, startedAt } = value as Record<string, unknown>;
  return (
    (mode === "setup" ||
      mode === "paused" ||
      mode === "running" ||
      mode === "complete" ||
      mode === "edit-before-save" ||
      mode === "saved") &&
    typeof elapsed === "number" &&
    Number.isFinite(elapsed) &&
    elapsed >= 0 &&
    typeof startedAt === "number" &&
    Number.isFinite(startedAt) &&
    startedAt >= 0 &&
    (mode !== "running" || startedAt > 0)
  );
}

export function loadDraft(restore: boolean): TimerDraft {
  if (restore) {
    try {
      const draft: unknown = JSON.parse(window.sessionStorage.getItem(draftStorageKey) ?? "null");
      if (
        typeof draft === "object" &&
        draft !== null &&
        "config" in draft &&
        "session" in draft &&
        isSession(draft.session)
      ) {
        return { config: parseConfig(draft.config), session: draft.session };
      }
    } catch {
      /* A fresh editor is still available. */
    }
  }
  return { config: loadConfig(), session: readySession };
}

export function storeDraft(draft: TimerDraft | null) {
  try {
    if (draft) window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    else window.sessionStorage.removeItem(draftStorageKey);
  } catch {
    /* Keep the in-memory session usable when tab storage is unavailable. */
  }
}
