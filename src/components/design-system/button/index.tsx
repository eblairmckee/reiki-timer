"use client";

import "./style.css";
import "../shared/recessed-frost.css";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useFrostMotion } from "../shared/use-frost-motion";

type TraditionalAppearance = "solid" | "tonal" | "ghost" | "outline" | "link";
type ButtonIntent = "primary" | "neutral" | "error";
type ButtonSize = "lg" | "md" | "sm";

/** Only traditional surfaces use semantic pigments. Frost, text and etched keep brand ink. */
type ButtonAppearanceProps =
  | {
      /** Translucent, fully rounded tag action with foreground ink. */
      appearance: "liquid";
      iconOnly?: false;
      intent?: "primary";
      size?: "md";
    }
  | {
      /** Quieter frosted icon surface for secondary actions. */
      appearance: "secondary";
      iconOnly: true;
      intent?: "primary";
      size?: "md";
    }
  | {
      /** Intent-colored surface. Omit appearance for the brand frost default. */
      appearance: TraditionalAppearance;
      /** Semantic pigment for this surface. Defaults to primary. */
      intent?: ButtonIntent;
      /** Legacy dimensions, spacing and icon sizing. Defaults to md. */
      size?: ButtonSize;
      iconOnly?: boolean;
    }
  | {
      /** Fixed-ink word treatments: plain text or a recessed letter track. */
      appearance: "text" | "etched";
      /** Fixed brand ink; primary is retained for compatibility. */
      intent?: "primary";
      /** Legacy dimensions, spacing and icon sizing. Defaults to md. */
      size?: ButtonSize;
      iconOnly?: boolean;
    }
  | ({
      /** Default frost; inset exposes a stationary well around the moving face.
       * Button owns face lighting and press/release feedback. See
       * docs/concepts/controls/button-frost-states.png for the material study. */
      appearance?: "frost" | "inset";
      /** Fixed brand ink; primary is retained for compatibility. */
      intent?: "primary";
    } & (
      | {
          /** Icon dimensions use root CSS properties, independently of size. */
          iconOnly: true;
          size?: "md";
        }
      | {
          iconOnly?: false;
          /** Word controls support standard and large dimensions. Defaults to md. */
          size?: "md" | "lg";
        }
    ));

/** Interactive Base UI button. Supply text children or an accessible name for icon-only content.
 * Native/Base UI handlers, refs, disabled behavior and cancellation pass through.
 * onClick runs for each supported activation, including repeated activation of the same value.
 * Root styling hooks for frost/inset (also inherited by grouped controls):
 * --cmp-size-button-icon sets icon width and default height;
 * --cmp-size-button-frost-height overrides standard word/icon height (large words stay 3.25rem);
 * --cmp-space-button-frost-inset sets the stationary well inset;
 * --cmp-radius-button-word / --cmp-radius-button-icon set the corresponding root radius;
 * --cmp-space-button-focus-offset sets the focus outline offset.
 */
export type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
  ButtonAppearanceProps & {
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
  const frosted =
    appearance === "frost" ||
    appearance === "inset" ||
    appearance === "secondary" ||
    appearance === "liquid";
  let actionInk = iconOnly ? "control" : "on-light-frost";
  if (appearance === "liquid") {
    actionInk = "on-atmosphere";
  }
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
          <span data-frost="" data-ink={actionInk} data-lettering="frosted">
            {children}
          </span>
        </>
      ) : (
        unfrostedContent
      )}
    </ButtonPrimitive>
  );
}
