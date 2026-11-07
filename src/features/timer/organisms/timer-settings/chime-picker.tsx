// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.

import { Button } from "@/components/design-system/button";
import { BellIcon } from "@/features/timer/icons";
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
          appearance="inset"
          aria-label={chime.name}
          aria-pressed={value === chime.id}
          iconOnly
          key={chime.id}
          onClick={() => onSelect(chime.id)}
        >
          <BellIcon onFrost />
        </Button>
      ))}
    </fieldset>
  );
}
