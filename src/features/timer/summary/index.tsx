import { AnimatePresence, motion, useIsPresent } from "motion/react";
import type { ReactNode, Ref } from "react";
import { motion as systemMotion } from "../../../components/design-system/shared/motion";
import { useReducedMotion } from "../../../components/design-system/shared/use-reduced-motion";
import { BellIcon, ClockIcon, RepeatIcon } from "../icons";
import "./style.css";

function SummaryItem({
  children,
  reduced,
  ref,
}: {
  children: ReactNode;
  reduced: boolean;
  ref?: Ref<HTMLLIElement>;
}) {
  const present = useIsPresent();
  return (
    <motion.li
      animate={{ opacity: 1, scale: 1 }}
      aria-hidden={!present}
      exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
      layout={reduced ? false : "position"}
      ref={ref}
      transition={
        reduced
          ? { duration: 0 }
          : {
              layout: systemMotion.control.settle,
              opacity: { duration: 0.22 },
              scale: systemMotion.control.settle,
            }
      }
    >
      {children}
    </motion.li>
  );
}

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

/** Informational list with built-in readable item labels; accepts durations and flags, no actions. */
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
  const reduced = useReducedMotion();
  return (
    <ul
      aria-label={asDescription ? undefined : "Timer summary"}
      className="timer-summary"
      data-as-description={asDescription || undefined}
      data-blurred-background={blurredBackground ? "inset" : undefined}
      data-ink="summary"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {warmUpMinutes !== undefined && (
          <SummaryItem key={`warm-${warmUpMinutes}`} reduced={reduced}>
            <span>
              <b>{warmUpMinutes}</b>m warm up
            </span>
          </SummaryItem>
        )}
        {sessionMinutes !== undefined && (
          <SummaryItem key={`session-${sessionMinutes}`} reduced={reduced}>
            <span>
              <b>{sessionMinutes}</b>m session
            </span>
          </SummaryItem>
        )}
        {coolDownMinutes !== undefined && (
          <SummaryItem key={`cool-${coolDownMinutes}`} reduced={reduced}>
            <span>
              <b>{coolDownMinutes}</b>m cooldown
            </span>
          </SummaryItem>
        )}
        {Boolean(repeat) && (
          <SummaryItem key="repeat" reduced={reduced}>
            <RepeatIcon />
            <span aria-hidden="true">
              <b>2</b>x
            </span>
            <span className="visually-hidden">Repeat chakras twice</span>
          </SummaryItem>
        )}
        {Boolean(chimes) && (
          <SummaryItem key="chimes" reduced={reduced}>
            <BellIcon />
            <span className="visually-hidden">Chimes enabled</span>
          </SummaryItem>
        )}
        {Boolean(showTimerIcon) && (
          <SummaryItem key="timer" reduced={reduced}>
            <ClockIcon />
            <span className="visually-hidden">Timer visible</span>
          </SummaryItem>
        )}
      </AnimatePresence>
    </ul>
  );
}
