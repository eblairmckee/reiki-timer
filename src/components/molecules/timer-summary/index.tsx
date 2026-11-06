import { AnimatePresence, motion, useIsPresent } from "motion/react";
import type { ReactNode, Ref } from "react";
import { BellIcon, ClockIcon, RepeatIcon } from "../../atoms/timer-icons";
import { controlSpring } from "../../ui/shared/motion";
import { useReducedMotion } from "../../ui/shared/use-reduced-motion";
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
          : { layout: controlSpring, opacity: { duration: 0.22 }, scale: controlSpring }
      }
    >
      {children}
    </motion.li>
  );
}

interface TimerSummaryProps {
  asDescription?: boolean;
  blurredBackground?: boolean;
  chimes: boolean;
  coolDownMinutes?: number;
  repeat: boolean;
  sessionMinutes?: number;
  showTimerIcon?: boolean;
  warmUpMinutes?: number;
}

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
      data-blurred-background={blurredBackground || undefined}
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
