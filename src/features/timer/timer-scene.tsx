import { motion, useIsPresent } from "motion/react";
import type { ReactNode } from "react";
import { sceneMotion } from "../../components/ui/shared/motion";
import { useReducedMotion } from "../../components/ui/shared/use-reduced-motion";

export function TimerScene({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return (
    <motion.div
      inert={!present}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : present ? sceneMotion.enter : sceneMotion.exit}
    >
      {children}
    </motion.div>
  );
}
