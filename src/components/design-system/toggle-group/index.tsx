import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { Ref } from "react";
import { Button } from "../button";
import "./style.css";

/** Olyx-style group with Base UI roving focus. Supply an accessible group name.
 * Values, changes, orientation, disabled state and the native ref remain caller-owned. */
function ToggleGroup<Value extends string>({
  attached = false,
  ...props
}: ToggleGroupPrimitive.Props<Value> & {
  attached?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <ToggleGroupPrimitive
      data-attached={attached ? "" : undefined}
      data-ui="toggle-group"
      {...props}
    />
  );
}
/** Secondary glass icon toggle; render can replace the Button without nesting buttons. */
function ToggleGroupItem<Value extends string>({
  render = <Button appearance="secondary" iconOnly />,
  ...props
}: TogglePrimitive.Props<Value> & { ref?: Ref<HTMLButtonElement> }) {
  return <TogglePrimitive render={render} {...props} />;
}

export { ToggleGroup, ToggleGroupItem };
