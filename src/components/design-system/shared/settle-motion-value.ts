import { type AnimationPlaybackControls, animate, type MotionValue } from "motion";
import { motion } from "./motion";

/** Replace a numeric control's current animation without owning its gesture or lifecycle. */
export function settleMotionValue(
  value: MotionValue<number>,
  target: number,
  reduced: boolean,
  previous: AnimationPlaybackControls | null
): AnimationPlaybackControls | null {
  previous?.stop();
  if (reduced) {
    value.jump(target);
    return null;
  }
  return animate(value, target, motion.control.settle);
}
