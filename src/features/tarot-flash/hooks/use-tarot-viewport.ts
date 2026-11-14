import { type RefObject, useEffect } from "react";

/** Follow the visual viewport when a mobile keyboard reduces/pans the visible area.
 * Only geometry is synchronized; input state and scrolling remain native. */
export function useTarotViewport(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const viewport = window.visualViewport;
    const root = ref.current;
    if (!(viewport && root)) {
      return;
    }
    const update = () => {
      root.style.setProperty("--tarot-viewport-height", `${viewport.height}px`);
      root.style.setProperty("--tarot-viewport-top", `${viewport.offsetTop}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [ref]);
}
