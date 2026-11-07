import { motion, useIsPresent } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motion as systemMotion } from "./motion";

export interface RevealProps {
  /** Content nodes; caller owns readable text and names of any interactive descendants. */
  children: ReactNode;
  /** Layout/styling class for the animated wrapper. */
  className?: string;
  /** Optional DOM id for accessible relationships. */
  id?: string;
  /** Reveal layout: in-flow below/beside, overlay, or opacity-only fade. */
  reveal?: "below" | "beside" | "overlay" | "fade";
}

/** The anchor stays still. In-flow panels make room, while overlays fade at their final size. */
export function Reveal({ reveal = "below", children, ...props }: RevealProps) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const inset = reduced ? 0 : 5;
  const poses = {
    below: { closed: { height: 0, y: -inset }, open: { height: "auto", y: 0 } },
    beside: { closed: { width: 0, x: inset }, open: { width: "auto", x: 0 } },
    fade: { closed: {}, open: {} },
    overlay: { closed: { y: -inset }, open: { y: 0 } },
  }[reveal];
  const closed = { ...poses.closed, opacity: 0 };
  return (
    <motion.div
      {...props}
      animate={{ ...poses.open, opacity: 1 }}
      aria-hidden={!present}
      exit={closed}
      inert={!present}
      initial={closed}
      transition={
        reduced
          ? { duration: 0 }
          : {
              default: systemMotion.disclosure.slide,
              opacity: present ? systemMotion.disclosure.enter : systemMotion.disclosure.exit,
            }
      }
    >
      {children}
    </motion.div>
  );
}
