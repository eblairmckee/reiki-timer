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
    <fieldset className="chime-picker" aria-labelledby={labelledBy}>
      {chimes.map((chime) => (
        <Button
          key={chime.id}
          mode="frost"
          asIcon
          aria-label={chime.name}
          aria-pressed={value === chime.id}
          onClick={() => onSelect(chime.id)}
        >
          <BellIcon onFrost />
        </Button>
      ))}
    </fieldset>
  );
}
