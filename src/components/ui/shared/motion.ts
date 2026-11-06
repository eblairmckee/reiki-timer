export const controlSpring = { type: "spring", stiffness: 420, damping: 32, mass: 0.8 } as const;

export const disclosureMotion = {
  slide: { type: "spring", stiffness: 195, damping: 29, mass: 1 },
  appear: { duration: 0.5, ease: "easeInOut" },
  disappear: { duration: 0.28, ease: "easeOut" },
} as const;

export const sceneMotion = {
  exit: { duration: 0.9, ease: "easeInOut" },
  enter: { duration: 1.2, ease: "easeInOut" },
  // Reach black just before the foreground exit completes and the clock starts.
  blackout: { duration: 0.84, ease: "easeInOut" },
  reveal: { duration: 2.8, ease: "easeInOut" },
} as const;
