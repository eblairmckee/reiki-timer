"use client";

import "../shared/input-base.css";
import "../shared/choice-field.css";
import "./style.css";
import { Input as InputPrimitive } from "@base-ui/react/input";

type InputProps = InputPrimitive.Props & {
  /** Use the system's translucent field material. Omit for the traditional input. */
  appearance?: "frost";
};

/** Interactive Base UI input; associate a label or supply an ARIA name. Native props,
 * className, refs, change timing and cancellation retain Base UI semantics.
 * Set --cmp-space-input-inline-end to reserve space for an overlapping accessory on a frost input. */
function Input({ appearance, ...props }: InputProps) {
  return <InputPrimitive {...props} data-appearance={appearance} data-ui="input" />;
}

export { Input };
