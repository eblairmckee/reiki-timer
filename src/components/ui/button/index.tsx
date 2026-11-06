"use client";

import "./style.css";
import "../shared/recessed-frost.css";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useFrostMotion } from "../shared/use-frost-motion";

type Props = React.ComponentProps<typeof ButtonPrimitive> &
  Partial<{
    variant: "primary" | "neutral" | "error" | "link";
    mode: "filled" | "lighter" | "ghost" | "stroke" | "frost" | "etched" | "text";
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
  const frostedAction = frosted && rest["aria-pressed"] === undefined;
  const actionInk = asIcon ? "control" : "on-light-frost";
  const feedback = useFrostMotion({ disabled: !frosted || rest.disabled });
  const unfrostedContent =
    mode === "etched" ? <span data-lettering="etched">{children}</span> : children;
  return (
    <ButtonPrimitive
      data-as-icon={asIcon}
      data-flip-icon-in-rtl={asRtl}
      data-frost-control={frosted ? "" : undefined}
      data-hint={hint ? "" : undefined}
      data-mode={mode}
      data-recess={frosted ? "" : undefined}
      data-size={size}
      data-ui="button"
      data-variant={variant}
      {...mergeProps(feedback, rest)}
    >
      {frosted ? (
        <>
          <span aria-hidden="true" data-ripple="pressure" />
          <span aria-hidden="true" data-ripple="release" />
          <span
            data-frost=""
            data-ink={frostedAction ? actionInk : undefined}
            data-lettering={frostedAction ? "frosted" : undefined}
          >
            {children}
          </span>
        </>
      ) : (
        unfrostedContent
      )}
    </ButtonPrimitive>
  );
}
