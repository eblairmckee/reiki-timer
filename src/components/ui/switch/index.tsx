"use client";
import "../shared/recessed-frost.css";
import "./style.css";
import { mergeProps } from "@base-ui/react/merge-props";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { type AnimationPlaybackControls, animate, motionValue } from "motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { controlSpring } from "../shared/motion";
import { useComposedRef } from "../shared/use-composed-ref";
import { useFrostMotion } from "../shared/use-frost-motion";
import { useReducedMotion } from "../shared/use-reduced-motion";

type Drag = {
  pointerId: number;
  x: number;
  y: number;
  initial: number;
  moved: boolean;
  direction: number;
};

function thumbTravel(root: HTMLElement, thumb: HTMLElement) {
  const style = getComputedStyle(root);
  return Math.max(
    0,
    root.clientWidth -
      (Number.parseFloat(style.paddingLeft) || 0) -
      (Number.parseFloat(style.paddingRight) || 0) -
      thumb.offsetWidth,
  );
}

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
    if (!root || !thumb) return;
    const unsubscribe = position.on("change", (value) => {
      thumb.style.transform = `translateX(${value * direction.current}px)`;
    });
    function measure() {
      if (!root || !thumb) return;
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
    animation.current?.stop();
    const target = isChecked ? travel.current : 0;
    if (reduced) position.jump(target);
    else animation.current = animate(position, target, controlSpring);
    return () => animation.current?.stop();
  }, [isChecked, position, reduced]);

  function settle() {
    animation.current?.stop();
    const target = committed.current ? travel.current : 0;
    if (reduced) position.jump(target);
    else animation.current = animate(position, target, controlSpring);
  }
  function cancel() {
    if (!drag.current) return;
    suppressClick.current = drag.current.moved;
    drag.current = null;
    rootRef.current?.removeAttribute("data-dragging");
    settle();
  }

  const interaction = {
    onPointerDown(event) {
      suppressClick.current = false;
      if (
        event.button !== 0 ||
        event.isPrimary === false ||
        event.currentTarget.hasAttribute("data-disabled") ||
        props.readOnly
      )
        return;
      animation.current?.stop();
      if (thumbRef.current) travel.current = thumbTravel(event.currentTarget, thumbRef.current);
      direction.current = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
      drag.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        initial: position.get(),
        moved: false,
        direction: direction.current,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove(event) {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (!current.moved && Math.abs(dx) <= 6) return;
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
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      drag.current = null;
      event.currentTarget.removeAttribute("data-dragging");
      if (current.moved) {
        suppressClick.current = true;
        const next = position.get() >= travel.current / 2;
        if (next !== committed.current) nativeInputRef.current?.click();
        settle();
      }
      if (event.currentTarget.hasPointerCapture?.(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
    onKeyDown() {
      suppressClick.current = false;
    },
    onClick(event) {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.preventBaseUIHandler();
      event.preventDefault();
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
      data-ui="switch"
      data-recess=""
      data-frost-control=""
      {...mergeProps(press, interaction, props)}
      ref={setRootRef}
      inputRef={setInputRef}
      checked={isChecked}
      onCheckedChange={(next, details) => {
        onCheckedChange?.(next, details);
        if (!details.isCanceled && checked === undefined) setInternalChecked(next);
      }}
    >
      <span data-ripple="pressure" aria-hidden="true" />
      <SwitchPrimitive.Thumb data-ui="thumb" ref={thumbRef}>
        <span data-ripple="release" aria-hidden="true" />
        <span data-frost="" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch };
