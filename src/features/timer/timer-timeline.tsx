import { BellIcon } from "@/components/atoms/timer-icons";
import { formatClock, type TimelineEntry } from "./timer-state";
import "./timer-timeline.css";

function emphasizeNumbers(text: string) {
  return Array.from(text.matchAll(/\d+|\D+/g), (match) =>
    /\d/.test(match[0]) ? <b key={match.index}>{match[0]}</b> : match[0],
  );
}

export function TimerTimeline({ entries }: { entries: readonly TimelineEntry[] }) {
  return (
    <div className="timer-timeline">
      <h2>Session timeline</h2>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: the bounded list scrolls with the arrow and page keys. */}
      <ol aria-label="Session timeline" tabIndex={0}>
        {entries.map((entry) => (
          <li key={entry.at}>
            <b className="timeline-time">{formatClock(Math.round(entry.at / 1000))}</b>
            <span className="timeline-marker">
              {entry.chime ? (
                <span className="timeline-bell">
                  <BellIcon />
                  <span className="visually-hidden">Chime</span>
                </span>
              ) : (
                <span className="timeline-dot" aria-hidden="true" />
              )}
            </span>
            <span className="timeline-event">
              {entry.label}
              {entry.detail && <small>{emphasizeNumbers(entry.detail)}</small>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
