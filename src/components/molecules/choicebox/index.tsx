// biome-ignore-all lint/performance/noJsxPropsBind: Each activation supplies the caller's option identity.
import type { ReactNode } from "react";
import { Button } from "@/components/design-system/button";
import "./style.css";

export interface ChoiceboxOption<Id extends string> {
  content: ReactNode;
  id: Id;
  /** Accessible button name; content may be decorative. */
  name: string;
}

type AccessibleName = { label: string; labelledBy?: never } | { label?: never; labelledBy: string };

export type ChoiceboxProps<Id extends string> = AccessibleName & {
  options: readonly ChoiceboxOption<Id>[];
  /** Controlled selected identity, including an empty string when used by an option. */
  value: Id;
  /** Fires on every activation, including the selected option; never changes selection itself. */
  onActivate: (id: Id) => void;
};

/** Named group of independent pressed buttons with native keyboard behavior.
 * Set --choicebox-item-size on an ancestor to customize the square button size.
 */
export function Choicebox<Id extends string>({
  options,
  value,
  label,
  labelledBy,
  onActivate,
}: ChoiceboxProps<Id>) {
  return (
    <fieldset aria-label={label} aria-labelledby={labelledBy} className="choicebox">
      {options.map((option) => (
        <Button
          appearance="inset"
          aria-label={option.name}
          aria-pressed={value === option.id}
          iconOnly
          key={option.id}
          onClick={() => onActivate(option.id)}
        >
          {option.content}
        </Button>
      ))}
    </fieldset>
  );
}
