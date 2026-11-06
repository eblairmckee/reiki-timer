"use client";

import "../shared/input-base.css";
import { Input as InputPrimitive } from "@base-ui/react/input";

function Input({ className, type, ...props }: InputPrimitive.Props) {
  return <InputPrimitive data-ui="input" type={type} {...props} />;
}

export { Input };
