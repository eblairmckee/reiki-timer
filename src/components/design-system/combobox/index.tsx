import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { ComponentProps } from "react";
import { Icon } from "../icon";
import "../shared/choice-field.css";

// Olyx-style multiple-selection composition; value/input state remain caller-owned.
// https://www.olyxui.com/docs/components/combobox
const Combobox = ComboboxPrimitive.Root;
const ComboboxValue = ComboboxPrimitive.Value;

function ComboboxChips(props: ComponentProps<typeof ComboboxPrimitive.Chips>) {
  return <ComboboxPrimitive.Chips data-ui="combobox-chips" {...props} />;
}
/** Name the input with a label/ARIA name. Native input props and refs pass through. */
function ComboboxChipsInput(props: ComponentProps<typeof ComboboxPrimitive.Input>) {
  return <ComboboxPrimitive.Input data-ui="combobox-input" {...props} />;
}
function ComboboxChip({
  appearance,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Chip> & { appearance?: "liquid" }) {
  return <ComboboxPrimitive.Chip data-appearance={appearance} data-ui="combobox-chip" {...props} />;
}
/** A separate native button inside a non-button chip. Supply an item-specific ARIA name. */
function ComboboxChipRemove({
  children,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.ChipRemove>) {
  return (
    <ComboboxPrimitive.ChipRemove data-ui="combobox-chip-remove" {...props}>
      {children ?? <Icon color="currentColor" icon={Cancel01Icon} size={14} />}
    </ComboboxPrimitive.ChipRemove>
  );
}
/** Anchor to the chips container. Popup props/ref and caller-owned content pass through. */
function ComboboxContent({
  anchor,
  children,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Popup> &
  Pick<ComboboxPrimitive.Positioner.Props, "anchor">) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        align="start"
        anchor={anchor}
        data-ui="choice-positioner"
        sideOffset={8}
      >
        <ComboboxPrimitive.Popup data-ui="choice-popup" {...props}>
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}
function ComboboxList(props: ComponentProps<typeof ComboboxPrimitive.List>) {
  return <ComboboxPrimitive.List data-ui="choice-list" {...props} />;
}
function ComboboxItem({ children, ...props }: ComponentProps<typeof ComboboxPrimitive.Item>) {
  return (
    <ComboboxPrimitive.Item data-ui="choice-item" {...props}>
      <span>{children}</span>
      <ComboboxPrimitive.ItemIndicator>
        <Icon icon={Tick02Icon} />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
};
