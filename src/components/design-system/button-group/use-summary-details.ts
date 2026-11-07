import { type HTMLAttributes, useCallback, useEffect, useRef, useState } from "react";

/** Explicit disclosure activation, with hover as an enhancement. Focus alone does not open it. */
export function useSummaryDetails(enabled: boolean) {
  const region = useRef<HTMLFieldSetElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dismissedHover = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [activated, setActivated] = useState(false);
  const open = enabled && (hovered || activated);

  const dismiss = useCallback((restoreFocus = false) => {
    dismissedHover.current = true;
    setHovered(false);
    setActivated(false);
    if (restoreFocus && region.current?.contains(document.activeElement)) {
      trigger.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      dismiss();
    }
  }, [enabled, dismiss]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (region.current?.contains(document.activeElement)) {
          event.preventDefault();
        }
        dismiss(true);
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !region.current?.contains(event.target)) {
        dismiss();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, dismiss]);

  const events: HTMLAttributes<HTMLFieldSetElement> = {
    onBlur(event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        dismiss();
      }
    },
    onFocus(event) {
      // A keyboard user entering the hovered scroll region keeps it open without the pointer.
      if (open && !trigger.current?.contains(event.target)) {
        setActivated(true);
      }
    },
    onPointerEnter() {
      dismissedHover.current = false;
    },
    onPointerLeave() {
      if (!region.current?.contains(document.activeElement)) {
        setHovered(false);
      }
    },
    onPointerMove(event) {
      // Do not open a new route's summary beneath a stationary pointer, or on touch scrolling.
      if (
        // biome-ignore lint/suspicious/noUnnecessaryConditions: Escape and pointer entry update this ref between events.
        !dismissedHover.current &&
        (event.pointerType === "mouse" || (event.pointerType === "pen" && !event.buttons))
      ) {
        setHovered(true);
      }
    },
  };

  function toggle() {
    if (activated) {
      dismiss();
    } else {
      setActivated(true);
    }
  }

  return { events: enabled ? events : undefined, open, region, toggle, trigger };
}
