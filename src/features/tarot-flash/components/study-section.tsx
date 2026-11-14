import { motion } from "motion/react";
import { type ComponentProps, type ReactNode, useRef } from "react";
import { motion as systemMotion } from "@/components/design-system/shared/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { StudyLabel } from "./study-label";

import "./study-section.css";

/** A category label sits beside the concealed values in a permanently reserved gutter;
 * aria-hidden + inert conceal the answer's alternatives and prevent hidden interactions. */
export function StudySection({
  label,
  field,
  populated,
  revealed,
  onReveal,
  children,
}: {
  label: string;
  field: ComponentProps<typeof StudyLabel>["field"];
  populated: boolean;
  revealed: boolean;
  onReveal: () => void;
  children: ReactNode;
}) {
  const content = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  if (!populated) {
    return null;
  }
  return (
    <section aria-label={label} className="tarot-section">
      <motion.div
        animate={revealed ? "revealed" : "concealed"}
        className="tarot-reveal"
        data-revealed={revealed}
        initial={false}
      >
        <motion.span
          aria-hidden="true"
          className="tarot-study-label"
          transition={
            reduced
              ? { duration: 0 }
              : {
                  ...systemMotion.disclosure.pop,
                  opacity: systemMotion.disclosure.handoff,
                }
          }
          variants={{
            concealed: { opacity: 1, scale: 1, x: 0 },
            revealed: { opacity: 0, scale: reduced ? 1 : 0.7, x: reduced ? 0 : 6 },
          }}
        >
          <StudyLabel field={field} />
        </motion.span>
        <div
          aria-hidden={!revealed}
          className="tarot-answer"
          inert={!revealed}
          ref={content}
          tabIndex={-1}
        >
          {children}
        </div>
        {!revealed && (
          <button
            aria-label={`Reveal ${label.toLowerCase()}`}
            className="tarot-reveal-control"
            onClick={() => {
              onReveal();
              requestAnimationFrame(() => content.current?.focus({ preventScroll: true }));
            }}
            type="button"
          />
        )}
      </motion.div>
    </section>
  );
}
