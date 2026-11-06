"use client";

import "./style.css";
import "../shared/recessed-frost.css";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useFrostMotion } from "../shared/use-frost-motion";

type Props = React.ComponentProps<typeof ButtonPrimitive> &
  Partial<{
    variant: "primary" | "neutral" | "error" | "link";
    mode: "filled" | "lighter" | "ghost" | "stroke" | "frost" | "frost-ghost";
    size: "lg" | "md" | "sm";
    asIcon: boolean;
    asRtl: boolean;
    hint: boolean;
  }>;

export function Button({
  variant = "primary",
  mode = "filled",
  size = "md",
  asRtl = false,
  asIcon = false,
  hint = false,
  children,
  ...rest
}: Props) {
  const frosted = mode === "frost";
  const feedback = useFrostMotion({ disabled: !frosted || rest.disabled });
  return (
    <ButtonPrimitive
      data-ui="button"
      data-variant={variant}
      data-mode={mode}
      data-size={size}
      data-as-icon={asIcon}
      data-flip-icon-in-rtl={asRtl}
      data-recess={frosted ? "" : undefined}
      data-frost-control={frosted ? "" : undefined}
      data-hint={hint ? "" : undefined}
      {...mergeProps(feedback, rest)}
    >
      {frosted ? (
        <>
          <span data-ripple="pressure" aria-hidden="true" />
          <span data-ripple="release" aria-hidden="true" />
          <span data-frost="">{children}</span>
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
}
