import { BellIcon } from "@/components/atoms/icons";
import type { TimelineItem } from "@/components/molecules/timeline";
import type { TimelineEntry } from "@/features/timer/model/timer-timeline";
import { formatClock } from "@/utils/time/format-duration";

const hasDigit = /\d/u;

function emphasizeNumbers(text: string) {
  return Array.from(text.matchAll(/\d+|\D+/gu), (match) =>
    hasDigit.test(match[0]) ? <b key={match.index}>{match[0]}</b> : match[0]
  );
}

/** Project timer clock, cue meaning and round detail into the shared sequence presentation. */
export function timelineItems(entries: readonly TimelineEntry[]): TimelineItem[] {
  return entries.map((entry) => ({
    content: entry.label,
    detail: entry.detail ? emphasizeNumbers(entry.detail) : undefined,
    key: entry.at,
    leading: formatClock(Math.round(entry.at / 1000)),
    marker: entry.chime ? (
      <span>
        <BellIcon />
        <span className="visually-hidden">Chime</span>
      </span>
    ) : undefined,
  }));
}
