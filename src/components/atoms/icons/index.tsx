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
import { Icon } from "@/components/design-system/icon";

export function PlayIcon() {
  return <Icon fill="currentColor" icon={PlayGlyph} ink="control" />;
}

export function PauseIcon() {
  return <Icon fill="currentColor" icon={PauseGlyph} ink="control" />;
}

export function ExitIcon() {
  return <Icon icon={Logout05Icon} ink="control" />;
}

export function EditIcon() {
  return <Icon fill="currentColor" fillOpacity={0.78} icon={Edit03Icon} ink="control" />;
}

export function ResetIcon() {
  return <Icon icon={TimerResetIcon} ink="control" />;
}

/** Decorative bell; the parent control or readable text supplies its meaning. */
export function BellIcon({
  onFrost = false,
}: {
  /** Use control ink when displayed on a frosted surface. Defaults to false. */
  onFrost?: boolean;
}) {
  return <Icon icon={Notification02Icon} ink={onFrost ? "control" : "inherit"} />;
}

export function ClockIcon() {
  return <Icon icon={Clock01Icon} />;
}

export function RepeatIcon() {
  return <Icon icon={RepeatGlyph} />;
}
