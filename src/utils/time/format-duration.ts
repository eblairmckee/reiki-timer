/** Countdown milliseconds: round up to a whole second and clamp negative input to zero. */
export function formatRemaining(milliseconds: number) {
  return formatClock(Math.max(0, Math.ceil(milliseconds / 1000)));
}
/** Clock seconds: format minutes and the seconds remainder without rounding or clamping. */
export function formatClock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
