"use client";

import "../shared/input-base.css";
import "./style.css";
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { Resize02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/** Interactive Base UI number field root; accepts composed parts. Supply a label via the input.
 * State, validation, onValueChange timing/cancellation and refs retain Base UI semantics. */
function NumberField(props: NumberFieldPrimitive.Root.Props) {
  return <NumberFieldPrimitive.Root data-ui="number-field" {...props} />;
}

/** Interactive scrubbing label accepting caller-owned label content; Base UI controls drag value
 * change timing and repetition. Native props and refs pass through. */
function NumberFieldScrubArea({ children, ...props }: NumberFieldPrimitive.ScrubArea.Props) {
  return (
    <NumberFieldPrimitive.ScrubArea data-ui="number-field-scrub-area" {...props}>
      {children}
      <NumberFieldPrimitive.ScrubAreaCursor>
        <HugeiconsIcon icon={Resize02Icon} />
      </NumberFieldPrimitive.ScrubAreaCursor>
    </NumberFieldPrimitive.ScrubArea>
  );
}

/** Non-interactive layout slot for the numeric input and increment/decrement controls.
 * Accepts composed children; native props and refs pass through. */
function NumberFieldGroup(props: NumberFieldPrimitive.Group.Props) {
  return <NumberFieldPrimitive.Group data-ui="number-field-control-group" {...props} />;
}

/** Interactive numeric input; provide a label or an ARIA name. Base UI input semantics,
 * change handlers and refs pass through unchanged. */
function NumberFieldInput(props: NumberFieldPrimitive.Input.Props) {
  return <NumberFieldPrimitive.Input data-slot="number-field-input" {...props} />;
}

/** Interactive increment control accepting text/icons; provide a visible or ARIA name.
 * Base UI owns press-and-hold repetition, disabled behavior, handlers and refs. */
function NumberFieldIncrement(props: NumberFieldPrimitive.Increment.Props) {
  return <NumberFieldPrimitive.Increment data-slot="number-field-increment" {...props} />;
}

/** Interactive decrement control accepting text/icons; provide a visible or ARIA name.
 * Base UI owns press-and-hold repetition, disabled behavior, handlers and refs. */
function NumberFieldDecrement(props: NumberFieldPrimitive.Decrement.Props) {
  return <NumberFieldPrimitive.Decrement data-slot="number-field-decrement" {...props} />;
}

export {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
};
