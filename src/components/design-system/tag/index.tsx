import type { ComponentPropsWithRef } from "react";
import "./style.css";

/** Noninteractive text tag. Children, native span props, and the span ref pass through. */
export function Tag(props: ComponentPropsWithRef<"span">) {
  return <span {...props} data-ui="tag" />;
}
