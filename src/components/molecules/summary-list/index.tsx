import { AnimatePresence, motion, useIsPresent } from "motion/react";
import type { ReactNode, Ref } from "react";
import { motion as systemMotion } from "@/components/design-system/shared/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import "./style.css";

function SummaryItem({
  children,
  reduced,
  ref,
}: {
  children: ReactNode;
  reduced: boolean;
  ref?: Ref<HTMLLIElement>;
}) {
  const present = useIsPresent();
  return (
    <motion.li
      animate={{ opacity: 1, scale: 1 }}
      aria-hidden={!present}
      exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
      layout={reduced ? false : "position"}
      ref={ref}
      transition={
        reduced
          ? { duration: 0 }
          : {
              layout: systemMotion.control.settle,
              opacity: { duration: 0.22 },
              scale: systemMotion.control.settle,
            }
      }
    >
      {children}
    </motion.li>
  );
}

export interface SummaryListItem {
  content: ReactNode;
  /** Stable presence identity. Change it when an item should enter again. */
  key: string | number;
}

export interface SummaryListProps {
  /** Left-align and inherit surrounding text size. Defaults to false. */
  asDescription?: boolean;
  /** Enable the inset blurred backdrop treatment. Defaults to false. */
  blurredBackground?: boolean;
  items: readonly SummaryListItem[];
  /** Optional accessible list name; callers supply readable item content. */
  label?: string;
}

/** Neutral informational list preserving item presence and reduced-motion behavior. */
export function SummaryList({
  items,
  label,
  asDescription = false,
  blurredBackground = false,
}: SummaryListProps) {
  const reduced = useReducedMotion();
  return (
    <ul
      aria-label={label}
      className="summary-list"
      data-as-description={asDescription || undefined}
      data-blurred-background={blurredBackground ? "inset" : undefined}
      data-ink="summary"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <SummaryItem key={item.key} reduced={reduced}>
            {item.content}
          </SummaryItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
