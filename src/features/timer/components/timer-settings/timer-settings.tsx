// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
import { AnimatePresence } from "motion/react";
import { useId, useRef } from "react";
import { BellIcon } from "@/components/atoms/icons";
import { Collapsible, CollapsiblePanel } from "@/components/design-system/collapsible";
import { Dial } from "@/components/design-system/dial";
import { Reveal } from "@/components/design-system/shared/reveal";
import { Switch } from "@/components/design-system/switch";
import { Choicebox } from "@/components/molecules/choicebox";
import { TimerSummary } from "@/features/timer/components/timer-summary/timer-summary";
import type { ChimeId } from "@/features/timer/data/chimes";
import { chimes as chimeCatalogue } from "@/features/timer/data/chimes";
import {
  availableChimeCues,
  hasChimeCue,
  normalizeChimes,
  type TimerConfig,
} from "@/features/timer/model/timer-config";
import { sessionPhase, summarizeTimer } from "@/features/timer/model/timer-timeline";
import { formatRemaining } from "@/utils/time/format-duration";
import { FieldPreview } from "./field-preview";
import { Field } from "./settings-field";
import "./style.css";

interface Props {
  audioError: string;
  config: TimerConfig;
  onChange: (next: TimerConfig) => void;
  onPreviewChime: (id: ChimeId) => void;
}
export function TimerSettings({ config, onChange, onPreviewChime, audioError }: Props) {
  const id = useId();
  const summary = summarizeTimer(config);
  const chimesRef = useRef<HTMLSpanElement>(null);
  return (
    <div className="timer-settings">
      <Field id={`${id}-duration`} label="Healing time">
        <Dial
          formatValue={formatDialValue}
          formatValueText={formatDialValueText}
          id={`${id}-duration`}
          label="Healing time"
          max={60}
          min={5}
          onValueChange={(minutes) => onChange({ ...config, minutes })}
          value={config.minutes}
        />
      </Field>
      <Collapsible className="timer-field-group" open={config.warmUp}>
        <Field
          description="Give yourself a moment for gassho and invocation"
          id={`${id}-warm`}
          label="Warm up"
        >
          <Switch
            aria-controls={config.warmUp ? `${id}-warm-up-panel` : undefined}
            aria-describedby={`${id}-warm-description`}
            checked={config.warmUp}
            id={`${id}-warm`}
            onCheckedChange={(warmUp) => onChange(normalizeChimes({ ...config, warmUp }))}
          />
        </Field>
        <CollapsiblePanel className="timer-progressive" id={`${id}-warm-up-panel`}>
          <Field dialLayout id={`${id}-warm-duration`} related>
            <Dial
              formatValue={formatDialValue}
              formatValueText={formatDialValueText}
              id={`${id}-warm-duration`}
              label="Warm up time"
              max={10}
              min={1}
              onValueChange={(warmUpMinutes) => onChange({ ...config, warmUpMinutes })}
              value={config.warmUpMinutes}
            />
          </Field>
        </CollapsiblePanel>
      </Collapsible>
      <Collapsible className="timer-field-group" open={config.coolDown}>
        <Field description="A quiet moment to finish" id={`${id}-cool`} label="Cool down">
          <Switch
            aria-controls={config.coolDown ? `${id}-cool-down-panel` : undefined}
            aria-describedby={`${id}-cool-description`}
            checked={config.coolDown}
            id={`${id}-cool`}
            onCheckedChange={(coolDown) => onChange(normalizeChimes({ ...config, coolDown }))}
          />
        </Field>
        <CollapsiblePanel className="timer-progressive" id={`${id}-cool-down-panel`}>
          <Field dialLayout id={`${id}-cool-duration`} related>
            <Dial
              formatValue={formatDialValue}
              formatValueText={formatDialValueText}
              id={`${id}-cool-duration`}
              label="Cool down time"
              max={10}
              min={1}
              onValueChange={(coolDownMinutes) => onChange({ ...config, coolDownMinutes })}
              value={config.coolDownMinutes}
            />
          </Field>
        </CollapsiblePanel>
      </Collapsible>
      <Collapsible className="timer-field-group" open={config.showTime}>
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
            aria-controls={config.showTime ? `${id}-breakdown-panel` : undefined}
            aria-describedby={`${id}-show-time-description`}
            checked={config.showTime}
            id={`${id}-show-time`}
            onCheckedChange={(showTime) => onChange({ ...config, showTime })}
          />
        </Field>
        <CollapsiblePanel className="timer-progressive" id={`${id}-breakdown-panel`}>
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
        </CollapsiblePanel>
      </Collapsible>
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
      <Collapsible className="timer-field-group" open={config.chimes}>
        <Field
          description="Cue when to change positions with a chime"
          id={`${id}-chimes`}
          label="Chimes"
        >
          <Switch
            aria-controls={config.chimes ? `${id}-chime-settings-panel` : undefined}
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
        <CollapsiblePanel className="timer-progressive" id={`${id}-chime-settings-panel`}>
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
              <Choicebox
                labelledBy={`${id}-chime-sound`}
                onActivate={(chime) => {
                  onChange({ ...config, chime });
                  onPreviewChime(chime);
                }}
                options={chimeCatalogue.map((chime) => ({
                  content: <BellIcon onFrost />,
                  id: chime.id,
                  name: chime.name,
                }))}
                value={config.chime}
              />
            </div>
          </div>
          <AnimatePresence initial={false}>
            {availableChimeCues(config).map((cue) => (
              <Reveal className="timer-cue-disclosure" key={cue}>
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
              </Reveal>
            ))}
          </AnimatePresence>
        </CollapsiblePanel>
      </Collapsible>
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

function formatDialValue(value: number) {
  return `${value}m`;
}

function formatDialValueText(value: number) {
  return `${value} minutes`;
}
