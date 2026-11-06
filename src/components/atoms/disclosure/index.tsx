import { motion, useIsPresent } from "motion/react";
import type { ReactNode } from "react";
import { disclosureMotion } from "../../ui/shared/motion";
import { useReducedMotion } from "../../ui/shared/use-reduced-motion";

type Props = {
  reveal: "below" | "beside" | "overlay" | "fade";
  className: string;
  id?: string;
  children: ReactNode;
};

/** The anchor stays still. In-flow panels make room, while overlays fade at their final size. */
export function Disclosure({ reveal, children, ...props }: Props) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const inset = reduced ? 0 : 5;
  const poses = {
    below: { closed: { height: 0, y: -inset }, open: { height: "auto", y: 0 } },
    beside: { closed: { width: 0, x: inset }, open: { width: "auto", x: 0 } },
    overlay: { closed: { y: -inset }, open: { y: 0 } },
    fade: { closed: {}, open: {} },
  }[reveal];
  const closed = { ...poses.closed, opacity: 0 };
  return (
    <motion.div
      {...props}
      inert={!present}
      aria-hidden={!present}
      initial={closed}
      animate={{ ...poses.open, opacity: 1 }}
      exit={closed}
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
