import { motion } from "motion/react";
import type { ReactNode } from "react";
import { motion as systemMotion } from "@/components/design-system/shared/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Animate inside the real item's footprint, so revealing never changes wrapping or layout.
 * StudySection supplies the concealed/revealed variant and the field's keyboard activation. */
export function StudyItem({
  children,
  className,
  order = 0,
}: {
  children: ReactNode;
  className: string;
  order?: number;
}) {
  const reduced = useReducedMotion();
  const delay = reduced
    ? 0
    : systemMotion.disclosure.stagger.lead +
      Math.min(order, 6) * systemMotion.disclosure.stagger.item;
  return (
    <span className={`tarot-study-item ${className}`}>
      <motion.span
        className="tarot-study-content"
        transition={
          reduced
            ? { duration: 0 }
            : {
                ...systemMotion.disclosure.pop,
                opacity: systemMotion.disclosure.fade,
              }
        }
        variants={{
          concealed: { opacity: 0, scale: reduced ? 1 : 0.88, y: reduced ? 0 : 8 },
          revealed: {
            opacity: 1,
            scale: 1,
            transition: {
              ...(reduced ? { duration: 0 } : systemMotion.disclosure.pop),
              delay,
              opacity: { delay, duration: reduced ? 0 : systemMotion.disclosure.fade.duration },
            },
            y: 0,
          },
        }}
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="tarot-study-mask"
        transition={
          reduced
            ? { duration: 0 }
            : {
                ...systemMotion.disclosure.pop,
                opacity: systemMotion.disclosure.handoff,
              }
        }
        variants={{
          concealed: { opacity: 1, scale: 1 },
          revealed: { opacity: 0, scale: reduced ? 1 : 0.88 },
        }}
      />
    </span>
  );
}
