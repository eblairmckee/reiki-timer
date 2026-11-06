import { AnimatePresence } from "motion/react";
import { type ReactNode, useId, useRef } from "react";
import { Disclosure } from "@/components/atoms/disclosure";
import { TimePicker } from "@/components/atoms/time-picker";
import { TimerSummary } from "@/components/molecules/timer-summary";
import { Switch } from "@/components/ui/switch";
import type { ChimeId } from "../../chimes";
import {
  availableChimeCues,
  formatRemaining,
  hasChimeCue,
  normalizeChimes,
  sessionPhase,
  summarizeTimer,
  type TimerConfig,
} from "../../timer-state";
import { ChimePicker } from "./chime-picker";
import "./style.css";

type Props = {
  config: TimerConfig;
  onChange: (next: TimerConfig) => void;
  onPreviewChime: (id: ChimeId) => void;
  audioError: string;
};
type FieldProps = {
  id: string;
  label?: string;
  description?: ReactNode;
  children: ReactNode;
  related?: boolean;
};

function Field({ id, label, description, children, related }: FieldProps) {
  return (
    <section className="timer-field" data-related={related || undefined}>
      {label && (
        <div className="timer-field-copy">
          <label className="timer-label" data-ink="label" data-lettering="etched" htmlFor={id}>
            {label}
          </label>
          {description && (
            <div className="timer-description" data-ink="detail" id={`${id}-description`}>
              {description}
            </div>
          )}
        </div>
      )}
      <div className="timer-field-control">{children}</div>
    </section>
  );
}

function FieldPreview({ context, children }: { context: string; children: ReactNode }) {
  return (
    <div className="timer-field-preview">
      <span className="visually-hidden">{context}</span>
      <span>Like: </span>
      {children}
    </div>
  );
}

export function TimerSettings({ config, onChange, onPreviewChime, audioError }: Props) {
  const id = useId();
  const summary = summarizeTimer(config);
  const chimesRef = useRef<HTMLSpanElement>(null);
  return (
    <div className="timer-settings">
      <Field id={`${id}-duration`} label="Healing time">
        <TimePicker
          id={`${id}-duration`}
          label="Healing time"
          value={config.minutes}
          onValueChange={(minutes) => onChange({ ...config, minutes })}
        />
      </Field>
      <div className="timer-field-group">
        <Field
          id={`${id}-warm`}
          label="Warm up"
          description="Give yourself a moment for gassho and invocation"
        >
          <Switch
            id={`${id}-warm`}
            checked={config.warmUp}
            onCheckedChange={(warmUp) => onChange(normalizeChimes({ ...config, warmUp }))}
            aria-describedby={`${id}-warm-description`}
          />
        </Field>
        <AnimatePresence initial={false}>
          {config.warmUp && (
            <Disclosure reveal="below" className="timer-progressive" key="warm-up-time">
              <Field id={`${id}-warm-duration`} related>
                <TimePicker
                  id={`${id}-warm-duration`}
                  label="Warm up time"
                  min={1}
                  max={10}
                  value={config.warmUpMinutes}
                  onValueChange={(warmUpMinutes) => onChange({ ...config, warmUpMinutes })}
                />
              </Field>
            </Disclosure>
          )}
        </AnimatePresence>
      </div>
      <div className="timer-field-group">
        <Field id={`${id}-cool`} label="Cool down" description="A quiet moment to finish">
          <Switch
            id={`${id}-cool`}
            checked={config.coolDown}
            onCheckedChange={(coolDown) => onChange(normalizeChimes({ ...config, coolDown }))}
            aria-describedby={`${id}-cool-description`}
          />
        </Field>
        <AnimatePresence initial={false}>
          {config.coolDown && (
            <Disclosure reveal="below" className="timer-progressive" key="cool-down-time">
              <Field id={`${id}-cool-duration`} related>
                <TimePicker
                  id={`${id}-cool-duration`}
                  label="Cool down time"
                  min={1}
                  max={10}
                  value={config.coolDownMinutes}
                  onValueChange={(coolDownMinutes) => onChange({ ...config, coolDownMinutes })}
                />
              </Field>
            </Disclosure>
          )}
        </AnimatePresence>
      </div>
      <div className="timer-field-group">
        <Field
          id={`${id}-show-time`}
          label="Show timer"
          description={
            <FieldPreview context="Starting countdown">
              <span data-blurred-background="" data-lettering="frosted">
                {formatRemaining(sessionPhase(config, 0).remaining)}
              </span>
            </FieldPreview>
          }
        >
          <Switch
            id={`${id}-show-time`}
            checked={config.showTime}
            onCheckedChange={(showTime) => onChange({ ...config, showTime })}
            aria-describedby={`${id}-show-time-description`}
          />
        </Field>
        <AnimatePresence initial={false}>
          {config.showTime && (
            <Disclosure reveal="below" className="timer-progressive" key="breakdown">
              <Field
                id={`${id}-breakdown`}
                label="Show breakdown"
                related
                description={
                  <FieldPreview context="Shown beneath the countdown">
                    <div className="timer-breakdown-example">
                      {/* Later switches can wrap the preview. Reserve that line before they open. */}
                      <div className="timer-preview-reserve" aria-hidden="true" inert>
                        <TimerSummary {...summary} repeat chimes asDescription blurredBackground />
                      </div>
                      <TimerSummary {...summary} asDescription blurredBackground />
                    </div>
                  </FieldPreview>
                }
              >
                <Switch
                  id={`${id}-breakdown`}
                  checked={config.showBreakdown}
                  onCheckedChange={(showBreakdown) => onChange({ ...config, showBreakdown })}
                  aria-describedby={`${id}-breakdown-description`}
                />
              </Field>
            </Disclosure>
          )}
        </AnimatePresence>
      </div>
      <Field
        id={`${id}-repeat`}
        label="Repeat chakras"
        description="Move through the seven chakras twice"
      >
        <Switch
          id={`${id}-repeat`}
          checked={config.repeat}
          onCheckedChange={(repeat) => onChange({ ...config, repeat })}
          aria-describedby={`${id}-repeat-description`}
        />
      </Field>
      <div className="timer-field-group">
        <Field
          id={`${id}-chimes`}
          label="Chimes"
          description="Cue when to change positions with a chime"
        >
          <Switch
            id={`${id}-chimes`}
            ref={chimesRef}
            checked={config.chimes}
            aria-describedby={`${id}-chimes-description`}
            onCheckedChange={(chimes) =>
              onChange({
                ...config,
                chimes,
                chimeOnChange: config.chimeOnChange || (chimes && !hasChimeCue(config)),
              })
            }
          />
        </Field>
        <AnimatePresence initial={false}>
          {config.chimes && (
            <Disclosure reveal="below" className="timer-progressive" key="chime-settings">
              <div className="timer-field timer-chime-field" data-related="">
                <span
                  className="timer-label"
                  data-ink="label"
                  data-lettering="etched"
                  id={`${id}-chime-sound`}
                >
                  Tone
                </span>
                <div className="timer-chime-picker">
                  <ChimePicker
                    labelledBy={`${id}-chime-sound`}
                    value={config.chime}
                    onSelect={(chime) => {
                      onChange({ ...config, chime });
                      onPreviewChime(chime);
                    }}
                  />
                </div>
              </div>
              <AnimatePresence initial={false}>
                {availableChimeCues(config).map((cue) => (
                  <Disclosure key={cue} reveal="below" className="timer-cue-disclosure">
                    <Field id={`${id}-${cue}`} label={chimeLabels[cue]} related>
                      <Switch
                        id={`${id}-${cue}`}
                        checked={config[cue]}
                        onCheckedChange={(checked) => {
                          const next = normalizeChimes({ ...config, [cue]: checked });
                          if (!next.chimes) chimesRef.current?.focus({ preventScroll: true });
                          onChange(next);
                        }}
                      />
                    </Field>
                  </Disclosure>
                ))}
              </AnimatePresence>
            </Disclosure>
          )}
        </AnimatePresence>
      </div>
      {audioError && (
        <p className="timer-audio-error" data-ink="detail" role="alert">
          {audioError}
        </p>
      )}
    </div>
  );
}

const chimeLabels = {
  chimeOnChange: "When chakras change",
  chimeOnWarmUpEnd: "When warm up ends",
  chimeOnSessionEnd: "End of session",
  chimeOnCoolDownEnd: "When cool down ends",
};
