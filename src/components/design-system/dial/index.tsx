// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
import "../shared/recessed-frost.css";
import "./style.css";
import type { AnimationPlaybackControls } from "motion";
import { motion, useMotionValue, useTransform } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { settleMotionValue } from "../shared/settle-motion-value";
import { useFrostMotion } from "../shared/use-frost-motion";

export interface DialProps {
  /** Disable pointer, keyboard and native range input. */
  disabled?: boolean;
  /** Format the visible value; defaults to its numeric string. */
  formatValue?: (value: number) => string;
  /** Format the accessible value; defaults to formatValue. */
  formatValueText?: (value: number) => string;
  /** Optional native range id for external label relationships. */
  id?: string;
  /** Required accessible name for the interactive numeric range. */
  label: string;
  /** Maximum value, inclusive. Must be finite and greater than min. */
  max: number;
  /** Minimum value, inclusive. Must be finite. */
  min: number;
  /** Controlled value request: every handled key/native change and pointer release (even unchanged); never during drag preview or cancellation. */
  onValueChange: (value: number) => void;
  /** Positive finite increment, relative to min. Defaults to 1; (max - min) must be a whole number of steps. */
  step?: number;
  /** Controlled numeric value. The dial returns to this value when a gesture ends. */
  value: number;
}
interface Drag {
  angle: number;
  centerX: number;
  centerY: number;
  id: number;
  lastAngle: number;
  moved: boolean;
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function decimalPlaces(value: number) {
  const [coefficient = "", exponent = "0"] = String(value).split("e");
  return Math.max(0, (coefficient.split(".")[1]?.length ?? 0) - Number(exponent));
}

function dialRange(min: number, max: number, step: number) {
  const origin = Math.min(0, min);
  const extent = max - origin;
  const intervals = (max - min) / step;
  const count = Math.round(intervals);
  const precision = Math.max(decimalPlaces(min), decimalPlaces(step));
  if (
    !(Number.isFinite(min) && Number.isFinite(max) && Number.isFinite(step)) ||
    min >= max ||
    step <= 0 ||
    !Number.isFinite(extent) ||
    !Number.isSafeInteger(count) ||
    count < 1 ||
    Math.abs(intervals - count) > Number.EPSILON * Math.max(1, intervals) * 4 ||
    min + step === min ||
    max - step === max ||
    precision > 100
  ) {
    throw new RangeError(
      "Dial requires finite increasing bounds and a positive representable step that divides the range"
    );
  }
  function at(index: number) {
    if (index <= 0) {
      return min;
    }
    if (index >= count) {
      return max;
    }
    return Number((min + index * step).toFixed(precision));
  }
  function snap(candidate: number) {
    return at(clamp(Math.round((candidate - min) / step), 0, count));
  }
  return { at, count, extent, origin, snap };
}

function dialMarks(range: ReturnType<typeof dialRange>, step: number) {
  const stride = Math.max(1, Math.ceil((range.count + 1) / 12));
  const marks: { angle: number; major: boolean }[] = [];
  // Count indexes instead of repeatedly subtracting floats; work is always bounded.
  for (let mark = 0; mark < 12; mark += 1) {
    const index = range.count - mark * stride;
    if (index < 0) {
      break;
    }
    const tick = range.at(index);
    const majorStride = stride === 1 ? 5 : stride * 3;
    const majorIndex = tick / step / majorStride;
    marks.push({
      angle: ((tick - range.origin) / range.extent) * 360,
      major: mark === 0 || Math.abs(majorIndex - Math.round(majorIndex)) < 1e-10,
    });
  }
  return marks;
}

/** A controlled rotary slider for a stepped numeric range. Supply a label and update
 * the value on keyboard changes or pointer release. Dragging previews the next value.
 *
 * Public CSS hooks, inherited from a caller-owned wrapper: --cmp-size-dial-diameter
 * sets the control diameter; --cmp-space-dial-value-gap sets the orbiting value's clearance.
 * Reserve that clearance around the control in the caller's layout. Internal .dial-* classes
 * and material attributes are implementation details, not caller styling hooks.
 * The native range uses label as its accessible name and formatValueText for its value. */
export function Dial({
  value,
  onValueChange,
  label,
  id: providedId,
  min,
  max,
  step = 1,
  formatValue = String,
  formatValueText = formatValue,
  disabled = false,
}: DialProps) {
  const range = dialRange(min, max, step);
  // Positive lower bounds reserve the arc below min, preserving absolute dial positions.
  const { origin, extent } = range;
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const controlledAngle = ((value - origin) / extent) * 360;
  const angle = useMotionValue(controlledAngle);
  const valueLeft = useTransform(angle, (degrees) => {
    const radial = Math.sin((degrees * Math.PI) / 180);
    return `calc(${50 + radial * 50}% + ${radial} * var(--cmp-space-dial-value-gap, 1.5rem))`;
  });
  const valueTop = useTransform(angle, (degrees) => {
    const radial = Math.cos((degrees * Math.PI) / 180);
    return `calc(${50 - radial * 50}% - ${radial} * var(--cmp-space-dial-value-gap, 1.5rem))`;
  });
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const reduced = useReducedMotion();
  const feedback = useFrostMotion({ disabled });
  const displayed = disabled ? value : (preview ?? value);

  function toAngle(nextValue: number) {
    return ((nextValue - origin) / extent) * 360;
  }
  function toValue(degrees: number) {
    return range.snap(origin + (degrees / 360) * extent);
  }
  const settle = useCallback(() => {
    animation.current = settleMotionValue(angle, controlledAngle, reduced, animation.current);
  }, [angle, controlledAngle, reduced]);

  useEffect(() => {
    if (!drag.current) {
      settle();
    }
    return () => animation.current?.stop();
  }, [settle]);

  const endDrag = useCallback(() => {
    const { current } = drag;
    if (!current) {
      return;
    }
    drag.current = null;
    setPreview(null);
    const root = rootRef.current;
    root?.removeAttribute("data-dragging");
    if (root?.hasPointerCapture?.(current.id)) {
      root.releasePointerCapture(current.id);
    }
    settle();
  }, [settle]);

  useLayoutEffect(() => {
    if (disabled) {
      endDrag();
    }
  }, [disabled, endDrag]);

  function pointAngle(x: number, y: number, centerX: number, centerY: number) {
    return (Math.atan2(x - centerX, centerY - y) * 180) / Math.PI;
  }
  function begin(event: PointerEvent<HTMLDivElement>) {
    if (disabled || drag.current || event.button !== 0 || event.isPrimary === false) {
      return;
    }
    event.preventDefault(); // The native range supplies semantics; this control uses angular input.
    inputRef.current?.focus({ preventScroll: true });
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    animation.current?.stop();
    drag.current = {
      angle: toAngle(value),
      centerX,
      centerY,
      id: event.pointerId,
      lastAngle: pointAngle(event.clientX, event.clientY, centerX, centerY),
      moved: false,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setAttribute("data-dragging", "");
    event.currentTarget.setPointerCapture?.(event.pointerId);
    feedback.onPointerDown(event);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const { current } = drag;
    if (!current || current.id !== event.pointerId) {
      return;
    }
    if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 4) {
      return;
    }
    current.moved = true;
    const next = pointAngle(event.clientX, event.clientY, current.centerX, current.centerY);
    const delta = ((next - current.lastAngle + 540) % 360) - 180;
    current.lastAngle = next;
    current.angle = clamp(current.angle + delta, toAngle(min), 360);
    const nearest = toValue(current.angle);
    // Gentle resistance around each detent, with exact snapping on release.
    const detent = toAngle(nearest);
    angle.set(detent + (current.angle - detent) * 0.4);
    setPreview(nearest);
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    const { current } = drag;
    if (!current || current.id !== event.pointerId) {
      return;
    }
    let next = toValue(current.angle);
    if (!current.moved) {
      const raw = pointAngle(event.clientX, event.clientY, current.centerX, current.centerY);
      // Zero is noon. The same top tick represents the upper bound.
      const clockwise = (raw + 360) % 360;
      next = toValue(clockwise === 0 ? 360 : clockwise);
      if (Math.hypot(event.clientX - current.centerX, event.clientY - current.centerY) < 20) {
        next = value;
      }
    }
    feedback.onPointerUp(event);
    endDrag();
    onValueChange(next);
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) {
      return;
    }
    let next: number;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        next = value + step;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next = value - step;
        break;
      case "PageUp":
        next = value + 5 * step;
        break;
      case "PageDown":
        next = value - 5 * step;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      case "Escape":
        endDrag();
        return;
      default:
        return;
    }
    event.preventDefault();
    onValueChange(range.snap(next));
  }

  return (
    <div className="dial" data-disabled={disabled || undefined}>
      <div
        className="dial-control"
        data-disabled={disabled || undefined}
        data-frost-control=""
        data-recess=""
        ref={rootRef}
        {...feedback}
        onLostPointerCapture={(event) => {
          if (drag.current?.id === event.pointerId) {
            endDrag();
            feedback.onLostPointerCapture(event);
          }
        }}
        onPointerCancel={(event) => {
          if (drag.current?.id === event.pointerId) {
            endDrag();
            feedback.onPointerCancel(event);
          }
        }}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={release}
      >
        <span aria-hidden="true" data-ripple="pressure" />
        <span aria-hidden="true" data-ripple="release" />
        <svg aria-hidden="true" className="dial-ticks" viewBox="0 0 300 300">
          {dialMarks(range, step).map(({ angle: tickAngle, major }) => (
            <g key={tickAngle} transform={`rotate(${tickAngle} 150 150)`}>
              <path className="dial-tick-light" d={`M150.5 11.5v${major ? 16 : 8}`} />
              <path
                className={major ? "dial-tick-major" : "dial-tick-minor"}
                d={`M150 11v${major ? 16 : 8}`}
              />
            </g>
          ))}
        </svg>
        <span aria-hidden="true" className="dial-face" data-frost="">
          <motion.span className="dial-rotor" style={{ rotate: angle }}>
            <span className="dial-index" />
          </motion.span>
        </span>
        <input
          aria-label={label}
          aria-valuetext={formatValueText(displayed)}
          className="dial-input"
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onChange={(event) => {
            if (!disabled) {
              onValueChange(range.snap(Number(event.target.value)));
            }
          }}
          onKeyDown={keyDown}
          ref={inputRef}
          step={step}
          type="range"
          value={displayed}
        />
      </div>
      <motion.output
        aria-hidden="true"
        className="dial-value"
        data-ink="detail"
        htmlFor={id}
        style={{ left: valueLeft, top: valueTop }}
      >
        {formatValue(displayed)}
      </motion.output>
    </div>
  );
}
