import { motion, useIsPresent } from "motion/react";
import type { ReactNode } from "react";
import { disclosureMotion } from "../../ui/shared/motion";
import { useReducedMotion } from "../../ui/shared/use-reduced-motion";

interface Props {
  children: ReactNode;
  className: string;
  id?: string;
  reveal: "below" | "beside" | "overlay" | "fade";
}

/** The anchor stays still. In-flow panels make room, while overlays fade at their final size. */
export function Disclosure({ reveal, children, ...props }: Props) {
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
              default: disclosureMotion.slide,
              opacity: present ? disclosureMotion.appear : disclosureMotion.disappear,
            }
      }
    >
      {children}
    </motion.div>
  );
}
