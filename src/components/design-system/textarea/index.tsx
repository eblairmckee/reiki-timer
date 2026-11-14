import type { ComponentPropsWithRef } from "react";
import "../shared/choice-field.css";
import "./style.css";

/** Native multiline input with content-based sizing where available. Associate a label
 * or supply an ARIA name. Native props, events, and the textarea ref pass through. */
export function Textarea(props: ComponentPropsWithRef<"textarea">) {
  return <textarea {...props} data-ui="textarea" />;
}
