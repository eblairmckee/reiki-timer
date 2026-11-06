"use client";

import { Separator } from "../separator";
import "./style.css";

function ButtonGroup({
  orientation = "horizontal",
  material,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  material?: "frost";
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Keep the Olyx div ref and group contract for non-form actions.
    <div
      role="group"
      data-ui="button-group"
      data-orientation={orientation}
      data-material={material}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="button-group-separator" orientation={orientation} {...props} />;
}

export { ButtonGroup, ButtonGroupSeparator };
