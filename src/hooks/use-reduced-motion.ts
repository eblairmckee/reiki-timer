import { useMediaQuery } from "@/hooks/use-media-query";

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true);
}
