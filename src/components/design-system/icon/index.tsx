import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

export type IconProps = ComponentProps<typeof HugeiconsIcon> & {
  /** Ink role: inherit surrounding text or use frosted-control ink. Defaults to inherit. */
  ink?: "inherit" | "control";
};

/** Decorative glyph with standard stroke and size. The surrounding control or text supplies
 * its accessible name. Native SVG props and refs pass through; callers select the glyph. */
export function Icon({ ink = "inherit", size = 24, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      data-ink={ink === "control" ? "control" : undefined}
      data-ui="icon"
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
