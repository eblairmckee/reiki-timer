import { type AnimationPlaybackControls, animate } from "motion";
import { type HTMLAttributes, useEffect, useRef } from "react";
import { controlSpring } from "./motion";
import { useReducedMotion } from "./use-reduced-motion";

/** The well and hit target stay fixed; only the frosted surface responds. */
export function useFrostMotion({ disabled = false }: { disabled?: boolean } = {}) {
  const reduced = useReducedMotion();
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const ripple = useRef<AnimationPlaybackControls | null>(null);
  const pressure = useRef<AnimationPlaybackControls | null>(null);
  const current = useRef<HTMLElement | null>(null);
  const hovered = useRef(false);

  useEffect(
    () => () => {
      animation.current?.stop();
      ripple.current?.stop();
      pressure.current?.stop();
    },
    [],
  );

  useEffect(() => {
    if (!disabled && !reduced) return;
    animation.current?.stop();
    ripple.current?.stop();
    pressure.current?.stop();
    current.current?.querySelector<HTMLElement>("[data-frost]")?.style.removeProperty("transform");
    current.current?.querySelectorAll<HTMLElement>("[data-ripple]").forEach((ring) => {
      ring.style.opacity = "0";
    });
    current.current?.removeAttribute("data-pressed");
  }, [disabled, reduced]);

  function respond(root: HTMLElement, pressed: boolean, wave = false) {
    current.current = root;
    if (disabled) return;
    const wasPressed = root.hasAttribute("data-pressed");
    root.toggleAttribute("data-pressed", pressed);
    const face = root.querySelector<HTMLElement>("[data-frost]");
    if (face) {
      animation.current?.stop();
      animation.current = animate(
        face,
        {
          y: reduced ? 0 : pressed ? 1.5 : hovered.current ? -1 : 0,
          scaleX: reduced ? 1 : pressed ? 0.99 : 1,
          scaleY: reduced ? 1 : pressed ? 0.97 : 1,
        },
        reduced ? { duration: 0 } : controlSpring,
      );
    }
    const ring = root.querySelector<HTMLElement>('[data-ripple="release"]');
    const halo = root.querySelector<HTMLElement>('[data-ripple="pressure"]');
    if (halo && wasPressed !== pressed) {
      pressure.current?.stop();
      if (pressed && ring) {
        ripple.current?.stop();
        ring.style.opacity = "0";
      }
      pressure.current = animate(
        halo,
        { scale: reduced ? 1 : pressed ? 1.04 : 1, opacity: pressed && !reduced ? 0.7 : 0 },
        { duration: reduced ? 0 : pressed ? 0.38 : 0.12, ease: pressed ? "easeOut" : "easeIn" },
      );
    }
    if (!pressed && wasPressed && wave && ring && !reduced) {
      ripple.current?.stop();
      ripple.current = animate(
        ring,
        { scale: [0.96, 1.14], opacity: [0.35, 0] },
        { duration: 0.65, ease: "easeOut" },
      );
    }
  }

  return {
    onPointerEnter(event) {
      if (event.pointerType === "touch") return;
      hovered.current = true;
      respond(event.currentTarget, event.currentTarget.hasAttribute("data-pressed"));
    },
    onPointerLeave(event) {
      hovered.current = false;
      if (!event.currentTarget.hasAttribute("data-dragging")) respond(event.currentTarget, false);
    },
    onPointerDown(event) {
      if (event.button === 0 && event.isPrimary !== false) respond(event.currentTarget, true, true);
    },
    onPointerUp(event) {
      respond(event.currentTarget, false, true);
    },
    onPointerCancel(event) {
      respond(event.currentTarget, false);
    },
    onLostPointerCapture(event) {
      respond(event.currentTarget, false);
    },
    onKeyDown(event) {
      if (event.key === "Escape") respond(event.currentTarget, false);
      if (!event.repeat && (event.key === " " || event.key === "Enter"))
        respond(event.currentTarget, true, true);
    },
    onKeyUp(event) {
      if (event.key === " " || event.key === "Enter") respond(event.currentTarget, false, true);
    },
    onBlur(event) {
      respond(event.currentTarget, false);
    },
  } satisfies HTMLAttributes<HTMLElement>;
}
