import { AnimatePresence, LayoutGroup, motion, useIsPresent } from "motion/react";
import { type ReactNode, useId } from "react";
import { TimePicker } from "../../components/atoms/time-picker";
import { controlSpring } from "../../components/ui/shared/motion";
import { useReducedMotion } from "../../components/ui/shared/use-reduced-motion";
import { Switch } from "../../components/ui/switch";
import type { TimerConfig } from "./timer-state";

type Props = { config: TimerConfig; onChange: (next: TimerConfig) => void };
type FieldProps = {
  id: string;
  label: string;
  description?: string;
  children: ReactNode;
  first?: boolean;
  related?: boolean;
};

function Field({ id, label, description, children, first, related }: FieldProps) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      layout="position"
      transition={reduced ? { duration: 0 } : controlSpring}
      className="timer-field"
      data-first={first || undefined}
      data-related={related || undefined}
    >
      <div className="timer-field-copy">
        <label className="timer-label" data-ink="label" htmlFor={id}>
          {label}
        </label>
        {description && (
          <p className="timer-description" data-ink="detail" id={`${id}-description`}>
            {description}
          </p>
        )}
      </div>
      <div className="timer-field-control">{children}</div>
    </motion.section>
  );
}
function ProgressiveField({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const present = useIsPresent();
  return (
    <motion.div
      className="timer-progressive"
      inert={!present}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={reduced ? { duration: 0 } : { height: controlSpring, opacity: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}

export function TimerSettings({ config, onChange }: Props) {
  const id = useId();
  return (
    <LayoutGroup>
      <div className="timer-settings">
        <Field id={`${id}-duration`} label="How long" first>
          <TimePicker
            id={`${id}-duration`}
            label="How long"
            value={config.minutes}
            onValueChange={(minutes) => onChange({ ...config, minutes })}
          />
        </Field>
        <Field
          id={`${id}-repeat`}
          label="Repeat chakras"
          description="Move through the seven chakras twice."
        >
          <Switch
            id={`${id}-repeat`}
            checked={config.repeat}
            onCheckedChange={(repeat) => onChange({ ...config, repeat })}
            aria-describedby={`${id}-repeat-description`}
          />
        </Field>
        <Field id={`${id}-warm`} label="Warm up" description="A little time to arrive.">
          <Switch
            id={`${id}-warm`}
            checked={config.warmUp}
            onCheckedChange={(warmUp) => onChange({ ...config, warmUp })}
            aria-describedby={`${id}-warm-description`}
          />
        </Field>
        <AnimatePresence initial={false}>
          {config.warmUp && (
            <ProgressiveField key="warm-up-time">
              <Field id={`${id}-warm-duration`} label="Warm-up time" related>
                <TimePicker
                  id={`${id}-warm-duration`}
                  label="Warm-up time"
                  min={1}
                  max={10}
                  value={config.warmUpMinutes}
                  onValueChange={(warmUpMinutes) => onChange({ ...config, warmUpMinutes })}
                />
              </Field>
            </ProgressiveField>
          )}
        </AnimatePresence>
        <Field id={`${id}-cool`} label="Cool down" description="A quiet moment to finish.">
          <Switch
            id={`${id}-cool`}
            checked={config.coolDown}
            onCheckedChange={(coolDown) => onChange({ ...config, coolDown })}
            aria-describedby={`${id}-cool-description`}
          />
        </Field>
        <AnimatePresence initial={false}>
          {config.coolDown && (
            <ProgressiveField key="cool-down-time">
              <Field id={`${id}-cool-duration`} label="Cool-down time" related>
                <TimePicker
                  id={`${id}-cool-duration`}
                  label="Cool-down time"
                  min={1}
                  max={10}
                  value={config.coolDownMinutes}
                  onValueChange={(coolDownMinutes) => onChange({ ...config, coolDownMinutes })}
                />
              </Field>
            </ProgressiveField>
          )}
        </AnimatePresence>
        <Field
          id={`${id}-show-time`}
          label="Show time"
          description="Keep the remaining time visible during your session."
        >
          <Switch
            id={`${id}-show-time`}
            checked={config.showTime}
            onCheckedChange={(showTime) => onChange({ ...config, showTime })}
            aria-describedby={`${id}-show-time-description`}
          />
        </Field>
      </div>
    </LayoutGroup>
  );
}
