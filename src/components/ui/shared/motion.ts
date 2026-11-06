export const controlSpring = { damping: 32, mass: 0.8, stiffness: 420, type: "spring" } as const;

export const disclosureMotion = {
  appear: { duration: 0.5, ease: "easeInOut" },
  disappear: { duration: 0.28, ease: "easeOut" },
  slide: { damping: 29, mass: 1, stiffness: 195, type: "spring" },
} as const;

export const sceneMotion = {
  // Reach black just before the foreground exit completes and the clock starts.
  blackout: { duration: 0.84, ease: "easeInOut" },
  enter: { duration: 1.2, ease: "easeInOut" },
  exit: { duration: 0.9, ease: "easeInOut" },
  reveal: { duration: 2.8, ease: "easeInOut" },
} as const;
