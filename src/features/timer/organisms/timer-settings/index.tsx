// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
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

interface Props {
  audioError: string;
  config: TimerConfig;
  onChange: (next: TimerConfig) => void;
  onPreviewChime: (id: ChimeId) => void;
}
interface FieldProps {
  children: ReactNode;
  description?: ReactNode;
  id: string;
  label?: string;
  related?: boolean;
}

function Field({ id, label, description, children, related }: FieldProps) {
  return (
    <section className="timer-field" data-related={related || undefined}>
      {Boolean(label) && (
        <div className="timer-field-copy">
          <label className="timer-label" data-ink="label" data-lettering="etched" htmlFor={id}>
            {label}
          </label>
          {Boolean(description) && (
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
          onValueChange={(minutes) => onChange({ ...config, minutes })}
          value={config.minutes}
        />
      </Field>
      <div className="timer-field-group">
        <Field
          description="Give yourself a moment for gassho and invocation"
          id={`${id}-warm`}
          label="Warm up"
        >
          <Switch
            aria-describedby={`${id}-warm-description`}
            checked={config.warmUp}
            id={`${id}-warm`}
            onCheckedChange={(warmUp) => onChange(normalizeChimes({ ...config, warmUp }))}
          />
        </Field>
        <AnimatePresence initial={false}>
          {Boolean(config.warmUp) && (
            <Disclosure className="timer-progressive" key="warm-up-time" reveal="below">
              <Field id={`${id}-warm-duration`} related>
                <TimePicker
                  id={`${id}-warm-duration`}
                  label="Warm up time"
                  max={10}
                  min={1}
                  onValueChange={(warmUpMinutes) => onChange({ ...config, warmUpMinutes })}
                  value={config.warmUpMinutes}
                />
              </Field>
            </Disclosure>
          )}
        </AnimatePresence>
      </div>
      <div className="timer-field-group">
        <Field description="A quiet moment to finish" id={`${id}-cool`} label="Cool down">
          <Switch
            aria-describedby={`${id}-cool-description`}
            checked={config.coolDown}
            id={`${id}-cool`}
            onCheckedChange={(coolDown) => onChange(normalizeChimes({ ...config, coolDown }))}
          />
        </Field>
        <AnimatePresence initial={false}>
          {Boolean(config.coolDown) && (
            <Disclosure className="timer-progressive" key="cool-down-time" reveal="below">
              <Field id={`${id}-cool-duration`} related>
                <TimePicker
                  id={`${id}-cool-duration`}
                  label="Cool down time"
                  max={10}
                  min={1}
                  onValueChange={(coolDownMinutes) => onChange({ ...config, coolDownMinutes })}
                  value={config.coolDownMinutes}
                />
              </Field>
            </Disclosure>
          )}
        </AnimatePresence>
      </div>
      <div className="timer-field-group">
        <Field
          description={
            <FieldPreview context="Starting countdown">
              <span data-blurred-background="" data-lettering="frosted">
                {formatRemaining(sessionPhase(config, 0).remaining)}
              </span>
            </FieldPreview>
          }
          id={`${id}-show-time`}
          label="Show timer"
        >
          <Switch
            aria-describedby={`${id}-show-time-description`}
            checked={config.showTime}
            id={`${id}-show-time`}
            onCheckedChange={(showTime) => onChange({ ...config, showTime })}
          />
        </Field>
        <AnimatePresence initial={false}>
          {Boolean(config.showTime) && (
            <Disclosure className="timer-progressive" key="breakdown" reveal="below">
              <Field
                description={
                  <FieldPreview context="Shown beneath the countdown">
                    <div className="timer-breakdown-example">
                      {/* Later switches can wrap the preview. Reserve that line before they open. */}
                      <div aria-hidden="true" className="timer-preview-reserve" inert>
                        <TimerSummary {...summary} asDescription blurredBackground chimes repeat />
                      </div>
                      <TimerSummary {...summary} asDescription blurredBackground />
                    </div>
                  </FieldPreview>
                }
                id={`${id}-breakdown`}
                label="Show breakdown"
                related
              >
                <Switch
                  aria-describedby={`${id}-breakdown-description`}
                  checked={config.showBreakdown}
                  id={`${id}-breakdown`}
                  onCheckedChange={(showBreakdown) => onChange({ ...config, showBreakdown })}
                />
              </Field>
            </Disclosure>
          )}
        </AnimatePresence>
      </div>
      <Field
        description="Move through the seven chakras twice"
        id={`${id}-repeat`}
        label="Repeat chakras"
      >
        <Switch
          aria-describedby={`${id}-repeat-description`}
          checked={config.repeat}
          id={`${id}-repeat`}
          onCheckedChange={(repeat) => onChange({ ...config, repeat })}
        />
      </Field>
      <div className="timer-field-group">
        <Field
          description="Cue when to change positions with a chime"
          id={`${id}-chimes`}
          label="Chimes"
        >
          <Switch
            aria-describedby={`${id}-chimes-description`}
            checked={config.chimes}
            id={`${id}-chimes`}
            onCheckedChange={(chimes) =>
              onChange({
                ...config,
                chimeOnChange: config.chimeOnChange || (chimes && !hasChimeCue(config)),
                chimes,
              })
            }
            ref={chimesRef}
          />
        </Field>
        <AnimatePresence initial={false}>
          {Boolean(config.chimes) && (
            <Disclosure className="timer-progressive" key="chime-settings" reveal="below">
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
                    onSelect={(chime) => {
                      onChange({ ...config, chime });
                      onPreviewChime(chime);
                    }}
                    value={config.chime}
                  />
                </div>
              </div>
              <AnimatePresence initial={false}>
                {availableChimeCues(config).map((cue) => (
                  <Disclosure className="timer-cue-disclosure" key={cue} reveal="below">
                    <Field id={`${id}-${cue}`} label={chimeLabels[cue]} related>
                      <Switch
                        checked={config[cue]}
                        id={`${id}-${cue}`}
                        onCheckedChange={(checked) => {
                          const next = normalizeChimes({ ...config, [cue]: checked });
                          if (!next.chimes) {
                            chimesRef.current?.focus({ preventScroll: true });
                          }
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
      {Boolean(audioError) && (
        <p className="timer-audio-error" data-ink="detail" role="alert">
          {audioError}
        </p>
      )}
    </div>
  );
}

const chimeLabels = {
  chimeOnChange: "When chakras change",
  chimeOnCoolDownEnd: "When cool down ends",
  chimeOnSessionEnd: "End of session",
  chimeOnWarmUpEnd: "When warm up ends",
};
