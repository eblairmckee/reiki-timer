import { motion, useIsPresent } from "motion/react";
import type { ReactNode } from "react";
import { sceneMotion } from "../../components/ui/shared/motion";
import { useReducedMotion } from "../../components/ui/shared/use-reduced-motion";

export function TimerScene({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  const transition = present ? sceneMotion.enter : sceneMotion.exit;
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
