import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { ComponentProps } from "react";
import { Icon } from "../icon";
import "../shared/choice-field.css";

// Olyx-style composition over the installed Base UI primitives.
// https://www.olyxui.com/docs/components/select
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

/** Glass trigger. Supply a visible label using aria-labelledby or an accessible name.
 * Native props, ref and render replacement retain Base UI behavior. */
function SelectTrigger({ children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger data-ui="select-trigger" {...props}>
      {children}
      <SelectPrimitive.Icon data-ui="select-icon">
        <Icon icon={ArrowDown01Icon} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/** Portaled options with collision-aware positioning and native focus restoration. */
function SelectContent({
  sideOffset = 8,
  align = "start",
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Popup> &
  Pick<SelectPrimitive.Positioner.Props, "sideOffset" | "align">) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={false}
        data-ui="choice-positioner"
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup data-ui="choice-popup" {...props}>
          <SelectPrimitive.List data-ui="choice-list">{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

/** Option content is caller-owned; selection and keyboard navigation belong to Select. */
function SelectItem({ children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item data-ui="choice-item" {...props}>
      <SelectPrimitive.ItemText data-ui="choice-item-text">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Icon icon={Tick02Icon} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
