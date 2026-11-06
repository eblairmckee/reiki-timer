import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { BellIcon, ClockIcon, RepeatIcon } from "../../atoms/timer-icons";
import { controlSpring } from "../../ui/shared/motion";
import { useReducedMotion } from "../../ui/shared/use-reduced-motion";
import "./style.css";

const SummaryItem = forwardRef<HTMLLIElement, { children: ReactNode; reduced: boolean }>(
  function SummaryItem({ children, reduced }, ref) {
    const present = useIsPresent();
    return (
      <motion.li
        ref={ref}
        layout={reduced ? false : "position"}
        aria-hidden={!present}
        initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
        transition={
          reduced
            ? { duration: 0 }
            : { layout: controlSpring, scale: controlSpring, opacity: { duration: 0.22 } }
        }
      >
        {children}
      </motion.li>
    );
  },
);

type TimerSummaryProps = {
  warmUpMinutes?: number;
  sessionMinutes?: number;
  coolDownMinutes?: number;
  repeat: boolean;
  chimes: boolean;
  showTimerIcon?: boolean;
  blurredBackground?: boolean;
  asDescription?: boolean;
};

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
      className="timer-summary"
      aria-label={asDescription ? undefined : "Timer summary"}
      data-ink="summary"
      data-as-description={asDescription || undefined}
      data-blurred-background={blurredBackground || undefined}
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
        {repeat && (
          <SummaryItem key="repeat" reduced={reduced}>
            <RepeatIcon />
            <span aria-hidden="true">
              <b>2</b>x
            </span>
            <span className="visually-hidden">Repeat chakras twice</span>
          </SummaryItem>
        )}
        {chimes && (
          <SummaryItem key="chimes" reduced={reduced}>
            <BellIcon />
            <span className="visually-hidden">Chimes enabled</span>
          </SummaryItem>
        )}
        {showTimerIcon && (
          <SummaryItem key="timer" reduced={reduced}>
            <ClockIcon />
            <span className="visually-hidden">Timer visible</span>
          </SummaryItem>
        )}
      </AnimatePresence>
    </ul>
  );
}
