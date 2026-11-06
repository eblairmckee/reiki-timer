"use client";

import "../shared/input-base.css";
import "./style.css";

function InputWrapper({ children, ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Consumers provide the nested input through children.
    <label data-ui="input-wrapper" {...props}>
      {children}
    </label>
  );
}

function InputIcon({ children, ...props }: React.ComponentProps<"span">) {
  return (
    <span {...props} data-ui="input-icon">
      {children}
    </span>
  );
}

function InputAffix({
  children,
  inline = false,
  ...props
}: React.ComponentProps<"span"> & {
  inline?: boolean;
}) {
  return (
    <span {...props} data-ui="input-affix" data-inline={inline}>
      {children}
    </span>
  );
}

export { InputAffix, InputIcon, InputWrapper };
