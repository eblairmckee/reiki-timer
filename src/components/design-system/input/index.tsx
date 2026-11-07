"use client";

import "../shared/input-base.css";
import { Input as InputPrimitive } from "@base-ui/react/input";

/** Interactive Base UI input; associate a label or supply an ARIA name. Native props,
 * className, refs, change timing and cancellation retain Base UI semantics. */
function Input({ className, type, ...props }: InputPrimitive.Props) {
  return <InputPrimitive className={className} data-ui="input" type={type} {...props} />;
}

export { Input };
