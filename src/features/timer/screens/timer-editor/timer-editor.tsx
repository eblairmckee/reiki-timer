import { TimerSettings } from "@/features/timer/components/timer-settings/timer-settings";
import { useTimer } from "@/features/timer/state/timer-context";

export function TimerEditor() {
  const { config, onChange, onPreviewChime, audioError } = useTimer();
  return (
    <TimerSettings
      audioError={audioError}
      config={config}
      onChange={onChange}
      onPreviewChime={onPreviewChime}
    />
  );
}
