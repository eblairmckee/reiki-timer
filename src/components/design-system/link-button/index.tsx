"use client";

import "./style.css";

export type LinkButtonProps = {
  /** Text emphasis. Defaults to default. */
  intent?: "muted" | "default" | "primary" | "error";
  /** Text size. Defaults to md. */
  size?: "sm" | "md";
  /** Show underline decoration. Defaults to true. */
  underline?: boolean;
  /** Flow inline with surrounding prose. Defaults to false. */
  inline?: boolean;
} & (
  | ({
      /** Render a native anchor for navigation (default). */
      as?: "a";
      /** Navigation destination. Use as="button" for commands. */
      href: string;
    } & React.ComponentProps<"a">)
  | ({
      /** Render a native button for an action. */
      as: "button";
    } & React.ComponentProps<"button">)
);

/** Interactive anchor by default, or native button with as="button". Supply named text children
 * or an ARIA name; native refs, handlers, navigation and cancellation pass through unchanged.
 * onClick runs for each supported activation, including repeated activation of the same value.
 */
function LinkButton({
  size = "md",
  underline = true,
  intent = "default",
  inline = false,
  ...props
}: LinkButtonProps) {
  const appearance = {
    "data-inline": inline || undefined,
    "data-intent": intent,
    "data-size": size,
    "data-ui": "link-button",
    "data-underline": underline,
  };
  if (props.as === "button") {
    const { as, ...button } = props;
    return <button type="button" {...appearance} {...button} />;
  }
  const { as, ...link } = props;
  return <a {...appearance} {...link} />;
}

export { LinkButton };
