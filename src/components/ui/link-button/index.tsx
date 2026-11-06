"use client";

import "./style.css";

type LinkButtonProps = {
  variant?: "gray" | "black" | "primary" | "error";
  size?: "sm" | "md";
  underline?: boolean;
  inline?: boolean;
} & (
  | ({ as?: "a" } & React.ComponentProps<"a">)
  | ({ as: "button" } & React.ComponentProps<"button">)
);

function LinkButton({
  size = "md",
  underline = true,
  variant = "black",
  inline = false,
  ...props
}: LinkButtonProps) {
  const appearance = {
    "data-inline": inline || undefined,
    "data-size": size,
    "data-ui": "link-button",
    "data-underline": underline,
    "data-variant": variant,
  };
  if (props.as === "button") {
    const { as, ...button } = props;
    return <button type="button" {...appearance} {...button} />;
  }
  const { as, ...link } = props;
  return <a {...appearance} {...link} />;
}

export { LinkButton };
