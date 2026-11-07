"use client";

import "./style.css";
import "../shared/recessed-frost.css";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useFrostMotion } from "../shared/use-frost-motion";

/** Interactive Base UI button. Supply text children or an accessible name for icon-only content.
 * Native/Base UI handlers, refs, disabled behavior and cancellation pass through; onClick runs
 * once for every supported activation, including repeated previews of the same content.
 */
export type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> & {
  /** Semantic emphasis; independent of surface appearance. Defaults to primary. */
  intent?: "primary" | "neutral" | "error";
  /** Surface treatment, default frost. Inset exposes a stationary well around the same moving face.
   * Button owns the face lighting and press/release feedback; callers configure the public root.
   * See docs/concepts/controls/button-frost-states.png for the rest, hover and press study.
   * Set `--cmp-space-button-frost-inset` on the button root to expose more of its stationary well.
   */
  appearance?:
    | "solid"
    | "tonal"
    | "ghost"
    | "outline"
    | "frost"
    | "inset"
    | "etched"
    | "text"
    | "link";
  /** Control dimensions. Defaults to md. */
  size?: "lg" | "md" | "sm";
  /** Use square/circular icon sizing; caller supplies aria-label or aria-labelledby. */
  iconOnly?: boolean;
  /** Mark the icon as directional for consumer RTL styles. Defaults to false. */
  hasDirectionalIcon?: boolean;
  /** Play the one-shot frosted activation cue; respects reduced motion. */
  showActivationHint?: boolean;
};

/** A frosted action by default. Use text children to name it, or supply an accessible name
 * for an icon-only action. The inset appearance keeps the hit target and press feedback. */
export function Button({
  intent = "primary",
  appearance = "frost",
  size = "md",
  hasDirectionalIcon = false,
  iconOnly = false,
  showActivationHint = false,
  children,
  ...rest
}: ButtonProps) {
  const frosted = appearance === "frost" || appearance === "inset";
  const frostedAction = frosted && rest["aria-pressed"] === undefined;
  const actionInk = iconOnly ? "control" : "on-light-frost";
  const feedback = useFrostMotion({ disabled: !frosted || rest.disabled });
  const unfrostedContent =
    appearance === "etched" ? <span data-lettering="etched">{children}</span> : children;
  return (
    <ButtonPrimitive
      data-activation-hint={showActivationHint ? "" : undefined}
      data-appearance={appearance}
      data-flip-icon-in-rtl={hasDirectionalIcon}
      data-frost-control={frosted ? "" : undefined}
      data-icon-only={iconOnly}
      data-intent={intent}
      data-recess={frosted ? "" : undefined}
      data-size={size}
      data-ui="button"
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
