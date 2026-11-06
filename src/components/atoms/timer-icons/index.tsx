import {
  Clock01Icon,
  Edit03Icon,
  Logout05Icon,
  Notification02Icon,
  PauseIcon as PauseGlyph,
  PlayIcon as PlayGlyph,
  RepeatIcon as RepeatGlyph,
  TimerResetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function PlayIcon() {
  return (
    <HugeiconsIcon
      icon={PlayGlyph}
      fill="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      data-ink="control"
    />
  );
}

export function PauseIcon() {
  return (
    <HugeiconsIcon
      icon={PauseGlyph}
      fill="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      data-ink="control"
    />
  );
}

export function FinishIcon() {
  return (
    <HugeiconsIcon icon={Logout05Icon} strokeWidth={1.5} aria-hidden="true" data-ink="control" />
  );
}

export function EditIcon() {
  return (
    <HugeiconsIcon
      icon={Edit03Icon}
      fill="currentColor"
      fillOpacity={0.78}
      strokeWidth={1.5}
      aria-hidden="true"
      data-ink="control"
    />
  );
}

export function RestartIcon() {
  return (
    <HugeiconsIcon icon={TimerResetIcon} strokeWidth={1.5} aria-hidden="true" data-ink="control" />
  );
}

export function BellIcon({ onFrost = false }: { onFrost?: boolean }) {
  return (
    <HugeiconsIcon
      icon={Notification02Icon}
      strokeWidth={1.5}
      aria-hidden="true"
      data-ink={onFrost ? "control" : undefined}
    />
  );
}

export function ClockIcon() {
  return <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} aria-hidden="true" />;
}

export function RepeatIcon() {
  return <HugeiconsIcon icon={RepeatGlyph} strokeWidth={1.5} aria-hidden="true" />;
}
