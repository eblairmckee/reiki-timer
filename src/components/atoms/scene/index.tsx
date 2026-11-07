import { motion, useIsPresent } from "motion/react";
import type { ReactNode } from "react";
import { motion as systemMotion } from "@/components/design-system/shared/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function Scene({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const transition = present ? systemMotion.scene.enter : systemMotion.scene.exit;
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      inert={!present}
      initial={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : transition}
    >
      {children}
    </motion.div>
  );
}
