"use client";

import "../shared/input-base.css";
import "./style.css";

/** Label composition accepting a nested input and caller-owned label content. Native label
 * props and refs pass through; provide visible label text or name the nested input explicitly. */
function InputGroupWrapper({ children, ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Consumers provide the nested input through children.
    <label data-ui="input-group-wrapper" {...props}>
      {children}
    </label>
  );
}

/** Non-interactive icon slot accepting an icon node. Use aria-hidden for decorative content;
 * meaningful icons need caller-owned accessible text. Native span props and refs pass through. */
function InputGroupIcon({ children, ...props }: React.ComponentProps<"span">) {
  return (
    <span {...props} data-ui="input-group-icon">
      {children}
    </span>
  );
}

/** Non-interactive prefix/suffix slot accepting text or icons. Associate meaningful units with
 * the input description; native span props and refs pass through. */
function InputGroupAffix({
  children,
  inline = false,
  ...props
}: React.ComponentProps<"span"> & {
  /** Keep the affix inline with the input content. Defaults to false. */
  inline?: boolean;
}) {
  return (
    <span {...props} data-inline={inline} data-ui="input-group-affix">
      {children}
    </span>
  );
}

export { InputGroupAffix, InputGroupIcon, InputGroupWrapper };
