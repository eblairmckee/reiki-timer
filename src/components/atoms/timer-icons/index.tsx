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
      aria-hidden="true"
      data-ink="control"
      fill="currentColor"
      icon={PlayGlyph}
      strokeWidth={1.5}
    />
  );
}

export function PauseIcon() {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      data-ink="control"
      fill="currentColor"
      icon={PauseGlyph}
      strokeWidth={1.5}
    />
  );
}

export function FinishIcon() {
  return (
    <HugeiconsIcon aria-hidden="true" data-ink="control" icon={Logout05Icon} strokeWidth={1.5} />
  );
}

export function EditIcon() {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      data-ink="control"
      fill="currentColor"
      fillOpacity={0.78}
      icon={Edit03Icon}
      strokeWidth={1.5}
    />
  );
}

export function RestartIcon() {
  return (
    <HugeiconsIcon aria-hidden="true" data-ink="control" icon={TimerResetIcon} strokeWidth={1.5} />
  );
}

export function BellIcon({ onFrost = false }: { onFrost?: boolean }) {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      data-ink={onFrost ? "control" : undefined}
      icon={Notification02Icon}
      strokeWidth={1.5}
    />
  );
}

export function ClockIcon() {
  return <HugeiconsIcon aria-hidden="true" icon={Clock01Icon} strokeWidth={1.5} />;
}

export function RepeatIcon() {
  return <HugeiconsIcon aria-hidden="true" icon={RepeatGlyph} strokeWidth={1.5} />;
}
