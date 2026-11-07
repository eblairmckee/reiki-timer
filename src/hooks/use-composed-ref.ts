import { type Ref, useCallback, useRef } from "react";

export function useComposedRef<T>(externalRef: Ref<T> | undefined) {
  const localRef = useRef<T | null>(null);
  const ref = useCallback(
    (node: T | null) => {
      localRef.current = node;
      const cleanup = typeof externalRef === "function" ? externalRef(node) : undefined;
      if (externalRef && typeof externalRef !== "function") {
        externalRef.current = node;
      }
      return () => {
        localRef.current = null;
        if (typeof cleanup === "function") {
          cleanup();
        } else if (typeof externalRef === "function") {
          externalRef(null);
        } else if (externalRef) {
          externalRef.current = null;
        }
      };
    },
    [externalRef]
  );
  return [localRef, ref] as const;
}
