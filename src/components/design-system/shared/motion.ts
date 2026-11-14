/** Shared interaction and phase names follow the CSS motion tokens. Durations are seconds. */
export const motion = {
  control: {
    settle: { damping: 32, mass: 0.8, stiffness: 420, type: "spring" },
  },
  disclosure: {
    enter: { duration: 0.5, ease: "easeInOut" },
    exit: { duration: 0.28, ease: "easeOut" },
    fade: { duration: 0.16, ease: "easeOut" },
    handoff: { duration: 0.14, ease: "easeOut" },
    pop: { damping: 22, mass: 1, stiffness: 260, type: "spring" },
    slide: { damping: 29, mass: 1, stiffness: 195, type: "spring" },
    // Choreograph dependent content after its anchor starts moving.
    stagger: { content: 0.12, group: 0.22, item: 0.045, lead: 0.06 },
  },
  palette: {
    settle: { duration: 10, ease: "linear" },
  },
  pressure: {
    press: { duration: 0.38, ease: "easeOut" },
    release: { duration: 0.12, ease: "easeIn" },
  },
  ripple: {
    release: { duration: 0.65, ease: "easeOut" },
  },
  scene: {
    // Reach black just before the foreground exit completes.
    blackout: { duration: 0.84, ease: "easeInOut" },
    enter: { duration: 1.2, ease: "easeInOut" },
    exit: { duration: 0.9, ease: "easeInOut" },
    feedback: { duration: 0.24, ease: "easeInOut" },
    reveal: { duration: 2.8, ease: "easeInOut" },
  },
} as const;
