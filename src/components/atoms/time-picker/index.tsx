import "../../ui/shared/recessed-frost.css";
import "./style.css";
import { type AnimationPlaybackControls, animate } from "motion";
import { motion, useMotionValue, useTransform } from "motion/react";
import { type KeyboardEvent, type PointerEvent, useEffect, useId, useRef, useState } from "react";
import { controlSpring } from "../../ui/shared/motion";
import { useFrostMotion } from "../../ui/shared/use-frost-motion";
import { useReducedMotion } from "../../ui/shared/use-reduced-motion";

type TimePickerProps = {
  value: number;
  onValueChange: (minutes: number) => void;
  label: string;
  id?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
};
type Drag = {
  id: number;
  lastAngle: number;
  angle: number;
  initial: number;
  x: number;
  y: number;
  moved: boolean;
  centerX: number;
  centerY: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function dialMarks(min: number, max: number) {
  const stride = Math.max(1, Math.ceil((max - min + 1) / 12));
  const marks = [];
  for (let minutes = max; minutes >= min; minutes -= stride) {
    marks.push({
      angle: (minutes / max) * 360,
      major: minutes === max || minutes % (stride === 1 ? 5 : stride * 3) === 0,
    });
  }
  return marks;
}

export function TimePicker({
  value,
  onValueChange,
  label,
  id: providedId,
  min = 5,
  max = 60,
  disabled = false,
}: TimePickerProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const angle = useMotionValue((value / max) * 360);
  const valueLeft = useTransform(angle, (degrees) => {
    const radial = Math.sin((degrees * Math.PI) / 180);
    return `calc(${50 + radial * 50}% + ${radial} * var(--time-picker-value-gap, 1.5rem))`;
  });
  const valueTop = useTransform(angle, (degrees) => {
    const radial = Math.cos((degrees * Math.PI) / 180);
    return `calc(${50 - radial * 50}% - ${radial} * var(--time-picker-value-gap, 1.5rem))`;
  });
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const reduced = useReducedMotion();
  const feedback = useFrostMotion({ disabled });
  const displayed = preview ?? value;

  function toAngle(minutes: number) {
    return (minutes / max) * 360;
  }
  function toValue(degrees: number) {
    return clamp(Math.round((degrees / 360) * max), min, max);
  }
  function settle(minutes: number) {
    animation.current?.stop();
    if (reduced) angle.jump(toAngle(minutes));
    else animation.current = animate(angle, toAngle(minutes), controlSpring);
  }

  useEffect(() => {
    if (drag.current) return;
    const target = (value / max) * 360;
    animation.current?.stop();
    if (reduced) angle.jump(target);
    else animation.current = animate(angle, target, controlSpring);
    return () => animation.current?.stop();
  }, [value, max, reduced, angle]);

  function pointAngle(x: number, y: number, centerX: number, centerY: number) {
    return (Math.atan2(x - centerX, centerY - y) * 180) / Math.PI;
  }
  function cancel() {
    if (!drag.current) return;
    const initial = drag.current.initial;
    drag.current = null;
    setPreview(null);
    rootRef.current?.removeAttribute("data-dragging");
    settle(initial);
  }
  function begin(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault(); // The native range supplies semantics; this control uses angular input.
    inputRef.current?.focus({ preventScroll: true });
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    animation.current?.stop();
    drag.current = {
      id: event.pointerId,
      lastAngle: pointAngle(event.clientX, event.clientY, centerX, centerY),
      angle: toAngle(value),
      initial: value,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      centerX,
      centerY,
    };
    event.currentTarget.setAttribute("data-dragging", "");
    event.currentTarget.setPointerCapture?.(event.pointerId);
    feedback.onPointerDown(event);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 4)
      return;
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
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    let next = toValue(current.angle);
    if (!current.moved) {
      const raw = pointAngle(event.clientX, event.clientY, current.centerX, current.centerY);
      // Zero is noon. The same top tick represents the full range (60m / 10m).
      const clockwise = (raw + 360) % 360;
      next = toValue(clockwise === 0 ? 360 : clockwise);
      if (Math.hypot(event.clientX - current.centerX, event.clientY - current.centerY) < 20)
        next = current.initial;
    }
    drag.current = null;
    event.currentTarget.removeAttribute("data-dragging");
    setPreview(null);
    onValueChange(next);
    settle(next);
    feedback.onPointerUp(event);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    let next: number;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        next = value + 1;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next = value - 1;
        break;
      case "PageUp":
        next = value + 5;
        break;
      case "PageDown":
        next = value - 5;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      case "Escape":
        cancel();
        return;
      default:
        return;
    }
    event.preventDefault();
    onValueChange(clamp(next, min, max));
  }

  return (
    <div className="time-picker" data-disabled={disabled || undefined}>
      <div
        className="time-picker-dial"
        data-recess=""
        data-frost-control=""
        data-disabled={disabled || undefined}
        ref={rootRef}
        {...feedback}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={(event) => {
          cancel();
          feedback.onPointerCancel(event);
        }}
        onLostPointerCapture={(event) => {
          cancel();
          feedback.onLostPointerCapture(event);
        }}
      >
        <span data-ripple="pressure" aria-hidden="true" />
        <span data-ripple="release" aria-hidden="true" />
        <svg className="time-picker-ticks" viewBox="0 0 300 300" aria-hidden="true">
          {dialMarks(min, max).map(({ angle: tickAngle, major }) => (
            <g key={tickAngle} transform={`rotate(${tickAngle} 150 150)`}>
              <path d={`M150.5 11.5v${major ? 16 : 8}`} className="tick-light" />
              <path
                d={`M150 11v${major ? 16 : 8}`}
                className={major ? "tick-major" : "tick-minor"}
              />
            </g>
          ))}
        </svg>
        <span className="time-picker-face" data-frost="" aria-hidden="true">
          <motion.span className="time-picker-rotor" style={{ rotate: angle }}>
            <span className="time-picker-index" />
          </motion.span>
        </span>
        <input
          ref={inputRef}
          id={id}
          className="time-picker-input"
          type="range"
          min={min}
          max={max}
          step={1}
          value={displayed}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={`${displayed} minutes`}
          onKeyDown={keyDown}
          onChange={(event) => onValueChange(Number(event.target.value))}
        />
      </div>
      <motion.output
        className="time-picker-value"
        data-ink="detail"
        htmlFor={id}
        aria-hidden="true"
        style={{ left: valueLeft, top: valueTop }}
      >
        {displayed}m
      </motion.output>
    </div>
  );
}
