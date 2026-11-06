import { type HTMLAttributes, type RefObject, useEffect, useRef, useState } from "react";

/** Keep a reveal open while the pointer or keyboard moves from its anchor into its content. */
export function useHoverDisclosure<T extends HTMLElement>(
  enabled: boolean,
  focusAnchor?: RefObject<HTMLElement | null>
) {
  const region = useRef<T>(null);
  const pointerFocus = useRef(false);
  const dismissedHover = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = enabled && (hovered || focused);

  useEffect(() => {
    if (!enabled) {
      setHovered(false);
      setFocused(false);
      pointerFocus.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function dismiss(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      dismissedHover.current = true;
      if (region.current?.contains(document.activeElement)) {
        (focusAnchor?.current ?? region.current).focus({ preventScroll: true });
      }
      setHovered(false);
      setFocused(false);
    }
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open, focusAnchor]);

  const events: HTMLAttributes<T> = {
    onBlur(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        pointerFocus.current = false;
        setFocused(false);
      }
    },
    onFocus(event) {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
      if (!pointerFocus.current && event.target.matches(":focus-visible")) {
        setFocused(true);
      }
      pointerFocus.current = false;
    },
    onPointerDown() {
      pointerFocus.current = true;
      setFocused(false);
    },
    onPointerEnter() {
      dismissedHover.current = false;
    },
    onPointerLeave: () => setHovered(false),
    // A route change can put a new trigger beneath a stationary mouse.
    onPointerMove(event) {
      if (
        !(hovered || dismissedHover.current) &&
        (event.pointerType === "mouse" || (event.pointerType === "pen" && !event.buttons))
      ) {
        setHovered(true);
      }
    },
  };
  return { events: enabled ? events : undefined, open, region };
}
