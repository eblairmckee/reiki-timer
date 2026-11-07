"use client";

import "./style.css";

import { Separator as SeparatorPrimititve } from "@base-ui/react/separator";

/** Informational separator; content appearance accepts caller-owned text or decorative children.
 * Base UI orientation, decorative semantics, refs and native/ARIA props pass through.
 */
export function Separator({
  appearance = "line",
  orientation = "horizontal",
  ...props
}: SeparatorPrimititve.Props & {
  /** Visual separator treatment. Defaults to line. */
  appearance?: "line" | "solid-text" | "content" | "underline";
}) {
  return (
    <SeparatorPrimititve
      data-appearance={appearance}
      data-orientation={orientation}
      data-ui="separator"
      orientation={orientation}
      {...props}
    />
  );
}
