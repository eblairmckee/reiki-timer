import { BellIcon, ClockIcon, RepeatIcon } from "@/components/atoms/icons";
import { SummaryList, type SummaryListItem } from "@/components/molecules/summary-list";

export interface TimerSummaryProps {
  /** Omit the list name when used as descriptive content; defaults to false. */
  asDescription?: boolean;
  /** Enable the blurred backdrop treatment; defaults to false. */
  blurredBackground?: boolean;
  /** Include the informational chimes-enabled item. */
  chimes: boolean;
  /** Optional cooldown duration to display in minutes. */
  coolDownMinutes?: number;
  /** Include the informational repeat-twice item. */
  repeat: boolean;
  /** Optional session duration to display in minutes. */
  sessionMinutes?: number;
  /** Include the timer-visible informational item; defaults to false. */
  showTimerIcon?: boolean;
  /** Optional warm-up duration to display in minutes. */
  warmUpMinutes?: number;
}

/** Timer-owned duration, repeat and cue wording for the neutral summary presentation. */
export function TimerSummary({
  warmUpMinutes,
  sessionMinutes,
  coolDownMinutes,
  repeat,
  chimes,
  showTimerIcon = false,
  blurredBackground = false,
  asDescription = false,
}: TimerSummaryProps) {
  const items: SummaryListItem[] = [];
  if (warmUpMinutes !== undefined) {
    items.push({
      content: (
        <span>
          <b>{warmUpMinutes}</b>m warm up
        </span>
      ),
      key: `warm-${warmUpMinutes}`,
    });
  }
  if (sessionMinutes !== undefined) {
    items.push({
      content: (
        <span>
          <b>{sessionMinutes}</b>m session
        </span>
      ),
      key: `session-${sessionMinutes}`,
    });
  }
  if (coolDownMinutes !== undefined) {
    items.push({
      content: (
        <span>
          <b>{coolDownMinutes}</b>m cooldown
        </span>
      ),
      key: `cool-${coolDownMinutes}`,
    });
  }
  if (repeat) {
    items.push({
      content: (
        <>
          <RepeatIcon />
          <span aria-hidden="true">
            <b>2</b>x
          </span>
          <span className="visually-hidden">Repeat chakras twice</span>
        </>
      ),
      key: "repeat",
    });
  }
  if (chimes) {
    items.push({
      content: (
        <>
          <BellIcon />
          <span className="visually-hidden">Chimes enabled</span>
        </>
      ),
      key: "chimes",
    });
  }
  if (showTimerIcon) {
    items.push({
      content: (
        <>
          <ClockIcon />
          <span className="visually-hidden">Timer visible</span>
        </>
      ),
      key: "timer",
    });
  }
  return (
    <SummaryList
      asDescription={asDescription}
      blurredBackground={blurredBackground}
      items={items}
      label={asDescription ? undefined : "Timer summary"}
    />
  );
}
