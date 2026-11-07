// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
"use client";
import "../shared/recessed-frost.css";
import "./style.css";
import { mergeProps } from "@base-ui/react/merge-props";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { type AnimationPlaybackControls, motionValue } from "motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useComposedRef } from "@/hooks/use-composed-ref";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { settleMotionValue } from "../shared/settle-motion-value";
import { useFrostMotion } from "../shared/use-frost-motion";

interface Drag {
  direction: number;
  initial: number;
  moved: boolean;
  pointerId: number;
  x: number;
  y: number;
}

function thumbTravel(root: HTMLElement, thumb: HTMLElement) {
  const style = getComputedStyle(root);
  return Math.max(
    0,
    root.clientWidth -
      (Number.parseFloat(style.paddingLeft) || 0) -
      (Number.parseFloat(style.paddingRight) || 0) -
      thumb.offsetWidth
  );
}

/** Interactive Base UI switch; provide a visible associated label or an ARIA name.
 * The root ref accepts HTMLElement and targets a span by default; custom render can replace it.
 * inputRef targets the separate native HTMLInputElement.
 * Children are the internal thumb; native props and refs pass through. onCheckedChange fires
 * once per committed tap/key activation or drag release, never for drag previews; cancellation
 * and controlled updates retain Base UI semantics. Repeated activations toggle each time.
 *
 * Public CSS hook: --cmp-size-switch-block sets the root's block size (inline size is twice
 * that value); set it on the root or a caller-owned ancestor. Thumb geometry, material attributes
 * and drag state are internal. For a switch-controlled disclosure, see Collapsible's example:
 * the caller owns shared state, ARIA relationships and focus before externally hiding content. */
function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  inputRef,
  ref,
  ...props
}: SwitchPrimitive.Root.Props) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked ?? internalChecked;
  const reduced = useReducedMotion();
  const [rootRef, setRootRef] = useComposedRef(ref);
  const [nativeInputRef, setInputRef] = useComposedRef(inputRef);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [position] = useState(() => motionValue(0));
  const travel = useRef(0);
  const direction = useRef(1);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const committed = useRef(isChecked);
  const press = useFrostMotion({ disabled: props.disabled || props.readOnly });

  useLayoutEffect(() => {
    committed.current = isChecked;
  }, [isChecked]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const thumb = thumbRef.current;
    if (!(root && thumb)) {
      return;
    }
    const unsubscribe = position.on("change", (value) => {
      thumb.style.transform = `translateX(${value * direction.current}px)`;
    });
    function measure() {
      if (!(root && thumb)) {
        return;
      }
      const style = getComputedStyle(root);
      direction.current = style.direction === "rtl" ? -1 : 1;
      travel.current = thumbTravel(root, thumb);
      animation.current?.stop();
      drag.current = null;
      root.removeAttribute("data-dragging");
      position.jump(committed.current ? travel.current : 0);
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => {
      observer.disconnect();
      unsubscribe();
      animation.current?.stop();
    };
  }, [position, rootRef]);

  useEffect(() => {
    const target = isChecked ? travel.current : 0;
    animation.current = settleMotionValue(position, target, reduced, animation.current);
    return () => animation.current?.stop();
  }, [isChecked, position, reduced]);

  function settle() {
    const target = committed.current ? travel.current : 0;
    animation.current = settleMotionValue(position, target, reduced, animation.current);
  }
  function cancel() {
    if (!drag.current) {
      return;
    }
    suppressClick.current = drag.current.moved;
    drag.current = null;
    rootRef.current?.removeAttribute("data-dragging");
    settle();
  }

  const interaction = {
    onClick(event) {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
      if (!suppressClick.current) {
        return;
      }
      suppressClick.current = false;
      event.preventBaseUIHandler();
      event.preventDefault();
    },
    onKeyDown() {
      suppressClick.current = false;
    },
    onLostPointerCapture: cancel,
    onPointerCancel: cancel,
    onPointerDown(event) {
      suppressClick.current = false;
      if (
        event.button !== 0 ||
        event.isPrimary === false ||
        event.currentTarget.hasAttribute("data-disabled") ||
        props.readOnly
      ) {
        return;
      }
      animation.current?.stop();
      if (thumbRef.current) {
        travel.current = thumbTravel(event.currentTarget, thumbRef.current);
      }
      direction.current = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
      drag.current = {
        direction: direction.current,
        initial: position.get(),
        moved: false,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove(event) {
      const { current } = drag;
      if (!current || current.pointerId !== event.pointerId) {
        return;
      }
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.moved && Math.abs(dx) <= 6) {
        return;
      }
      if (!current.moved && Math.abs(dy) > Math.abs(dx)) {
        cancel();
        press.onPointerCancel(event);
        return;
      }
      current.moved = true;
      event.currentTarget.setAttribute("data-dragging", "");
      position.set(Math.max(0, Math.min(travel.current, current.initial + dx * current.direction)));
    },
    onPointerUp(event) {
      const { current } = drag;
      if (!current || current.pointerId !== event.pointerId) {
        return;
      }
      drag.current = null;
      event.currentTarget.removeAttribute("data-dragging");
      if (current.moved) {
        suppressClick.current = true;
        const next = position.get() >= travel.current / 2;
        if (next !== committed.current) {
          nativeInputRef.current?.click();
        }
        settle();
      }
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
  } satisfies Pick<
    SwitchPrimitive.Root.Props,
    | "onPointerDown"
    | "onPointerMove"
    | "onPointerUp"
    | "onPointerCancel"
    | "onLostPointerCapture"
    | "onKeyDown"
    | "onClick"
  >;

  return (
    <SwitchPrimitive.Root
      data-frost-control=""
      data-recess=""
      data-ui="switch"
      {...mergeProps(press, interaction, props)}
      checked={isChecked}
      inputRef={setInputRef}
      onCheckedChange={(next, details) => {
        onCheckedChange?.(next, details);
        if (!details.isCanceled && checked === undefined) {
          setInternalChecked(next);
        }
      }}
      ref={setRootRef}
    >
      <span aria-hidden="true" data-ripple="pressure" />
      <SwitchPrimitive.Thumb data-ui="thumb" ref={thumbRef}>
        <span aria-hidden="true" data-ripple="release" />
        <span data-frost="" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch };
