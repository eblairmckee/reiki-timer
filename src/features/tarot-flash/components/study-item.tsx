import { Note01Icon, Saturn02Icon, Tag01Icon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";
import { Icon, type IconProps } from "@/components/design-system/icon";

// Domain symbols missing from Hugeicons, using its 24px unfilled stroke contract.
const elements: IconProps["icon"] = [
  [
    "path",
    {
      d: "M6 2 2 9h8ZM14 2h8l-4 7ZM6 15l-4 7h8ZM14 15h8l-4 7ZM2 19h8M14 18h8",
      key: "elements",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
  ],
];
const zodiacWheel: IconProps["icon"] = [
  ["circle", { cx: 12, cy: 12, key: "outer", r: 10 }],
  ["circle", { cx: 12, cy: 12, key: "inner", r: 6 }],
  [
    "path",
    {
      d: "M12 2v4M17 3.34l-2 3.46M20.66 7l-3.46 2M22 12h-4M20.66 17l-3.46-2M17 20.66l-2-3.46M12 22v-4M7 20.66l2-3.46M3.34 17l3.46-2M2 12h4M3.34 7 6.8 9M7 3.34l2 3.46",
      key: "divisions",
    },
  ],
];
const fieldIcons = {
  element: elements,
  keywords: Tag01Icon,
  notes: Note01Icon,
  planet: Saturn02Icon,
  zodiac: zodiacWheel,
};

/** A concealment layer on the real item: identical wrapping, borders and geometry in both states.
 * StudySection owns visibility and the single keyboard activation for the entire field. */
export function StudyItem({
  children,
  field,
  className,
}: {
  children: ReactNode;
  field: keyof typeof fieldIcons;
  className: string;
}) {
  return (
    <span className={`tarot-study-item ${className}`}>
      <span className="tarot-study-content">{children}</span>
      <span aria-hidden="true" className="tarot-study-mask">
        <Icon className="tarot-study-hint" icon={fieldIcons[field]} />
      </span>
    </span>
  );
}
