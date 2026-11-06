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
    "data-ui": "link-button",
    "data-variant": variant,
    "data-size": size,
    "data-underline": underline,
    "data-inline": inline || undefined,
  };
  if (props.as === "button") {
    const { as, ...button } = props;
    return <button type="button" {...appearance} {...button} />;
  }
  const { as, ...link } = props;
  return <a {...appearance} {...link} />;
}

export { LinkButton };
