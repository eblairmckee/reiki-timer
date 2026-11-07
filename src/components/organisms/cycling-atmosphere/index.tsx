import { useEffect, useEffectEvent, useState } from "react";
import {
  Atmosphere,
  type AtmospherePalette,
  type AtmosphereProps,
} from "@/components/design-system/atmosphere";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface CyclingAtmosphereProps extends Omit<AtmosphereProps, "palette"> {
  /** Advance at intervalMs while visible and motion is allowed; defaults to true. */
  cycling?: boolean;
  /** Initial uncontrolled cycling index; defaults to 0 and later changes are ignored. */
  defaultIndex?: number;
  /** Palette displayed when cycling is false; defaults to 0. The cycling index is retained. */
  fixedIndex?: number;
  /** Controlled cycling index. Requests never change the rendered index until the caller updates it. */
  index?: number;
  /** Cycling cadence in milliseconds; defaults to 10,000. Must be positive and finite. */
  intervalMs?: number;
  /** Called with each requested cycling advance in controlled and uncontrolled modes. */
  onIndexChange?: (index: number) => void;
  /** Ordered theme palettes; at least one is required. Empty runtime input throws RangeError. */
  palettes: readonly [AtmospherePalette, ...AtmospherePalette[]];
}

function normalizeIndex(index: number, length: number) {
  return Number.isFinite(index) ? Math.max(0, Math.min(length - 1, Math.trunc(index))) : 0;
}

/**
 * Decorative palette sequence with caller-owned content and product meaning.
 * All indices truncate and clamp to the available range; nonfinite indices use zero.
 * Hidden ticks are skipped without catch-up. Fixed mode and reduced motion stop the interval.
 * Keep controlled/uncontrolled ownership stable for the lifetime of an instance.
 */
export function CyclingAtmosphere({
  palettes,
  cycling = true,
  intervalMs = 10_000,
  index,
  defaultIndex = 0,
  onIndexChange,
  fixedIndex = 0,
  ...props
}: CyclingAtmosphereProps) {
  const reduced = useReducedMotion();
  const [previewIndex, setPreviewIndex] = useState(defaultIndex);
  const { length } = palettes;
  if (length === 0) {
    throw new RangeError("CyclingAtmosphere requires at least one palette");
  }
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new RangeError("CyclingAtmosphere intervalMs must be positive and finite");
  }
  const cyclingIndex = normalizeIndex(index ?? previewIndex, length);
  const advance = useEffectEvent(() => {
    if (document.hidden) {
      return;
    }
    const next = (cyclingIndex + 1) % length;
    if (index === undefined) {
      setPreviewIndex(next);
    }
    onIndexChange?.(next);
  });

  useEffect(() => {
    if (!cycling || reduced) {
      return;
    }
    const interval = window.setInterval(advance, intervalMs);
    return () => window.clearInterval(interval);
  }, [cycling, reduced, intervalMs]);

  return (
    <Atmosphere
      {...props}
      palette={palettes[cycling ? cyclingIndex : normalizeIndex(fixedIndex, length)]}
    />
  );
}
