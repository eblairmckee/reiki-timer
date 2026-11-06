import { TimerSettings } from "./organisms/timer-settings";
import { useTimer } from "./timer-context";

export function TimerEditor() {
  const { config, onChange, onPreviewChime, audioError } = useTimer();
  return (
    <TimerSettings
      config={config}
      onChange={onChange}
      onPreviewChime={onPreviewChime}
      audioError={audioError}
    />
  );
}
