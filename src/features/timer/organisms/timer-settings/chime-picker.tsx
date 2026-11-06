// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
import { BellIcon } from "@/components/atoms/timer-icons";
import { Button } from "@/components/ui/button";
import { type ChimeId, chimes } from "../../chimes";

export function ChimePicker({
  value,
  labelledBy,
  onSelect,
}: {
  value: ChimeId;
  labelledBy: string;
  onSelect: (id: ChimeId) => void;
}) {
  return (
    <fieldset aria-labelledby={labelledBy} className="chime-picker">
      {chimes.map((chime) => (
        <Button
          aria-label={chime.name}
          aria-pressed={value === chime.id}
          asIcon
          key={chime.id}
          mode="frost"
          onClick={() => onSelect(chime.id)}
        >
          <BellIcon onFrost />
        </Button>
      ))}
    </fieldset>
  );
}
