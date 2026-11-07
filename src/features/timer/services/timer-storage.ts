import { defaultConfig, parseConfig, type TimerConfig } from "../model/timer-config";
import { readySession, type Session, type TimerDraft } from "../model/timer-session";

export const configStorageKey = "reiki-timer.config";

/** Saved preferences are loaded without rewriting older JSON; the domain parser owns migration. */
export function loadConfig(): TimerConfig {
  try {
    return parseConfig(JSON.parse(window.localStorage.getItem(configStorageKey) ?? "null"));
  } catch {
    return { ...defaultConfig };
  }
}
/** Explicit Save only. False leaves the in-memory draft available for retry. */
export function saveConfig(config: TimerConfig): boolean {
  try {
    window.localStorage.setItem(configStorageKey, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export const draftStorageKey = "reiki-timer.session";
function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) {
    return false;
  }
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

/** Home starts from saved preferences. Other timer routes may restore this tab's draft,
 * including a running wall-clock session; TimerLayout reconciles it with the current view.
 * Keys and existing unversioned payloads remain compatible. Invalid/denied reads fall back.
 */
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
        const { elapsed, mode, startedAt } = draft.session;
        return { config: parseConfig(draft.config), session: { elapsed, mode, startedAt } };
      }
    } catch {
      /* A fresh editor is still available. */
    }
  }
  return { config: loadConfig(), session: readySession };
}

/** Best-effort tab recovery, independent of explicit Save. Null clears the tab draft. */
export function storeDraft(draft: TimerDraft | null) {
  try {
    if (draft) {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } else {
      window.sessionStorage.removeItem(draftStorageKey);
    }
  } catch {
    /* Keep the in-memory session usable when tab storage is unavailable. */
  }
}
