"use client";

import { AnimatePresence } from "motion/react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Separator } from "../separator";
import { Reveal } from "../shared/reveal";
import "./style.css";

/** Native group props with an optional horizontal, joined-frost action reveal. */
export type ButtonGroupProps = Omit<ComponentProps<"div">, "children"> &
  (
    | {
        /** Ordinary joined controls; defaults to this variant. */
        variant?: "default";
        /** Layout direction. Defaults to horizontal. */
        orientation?: "horizontal" | "vertical";
        /** Optional frosted group surface. */
        material?: "frost";
        /** Caller-owned named controls. */
        children?: ReactNode;
        /** Adjacent action nodes are available only with the expandable variant. */
        actions?: never;
      }
    | {
        /** Reveal optional controls beside a stationary trailing Button. */
        variant: "expandable";
        /** Expandable groups lay out horizontally. */
        orientation?: "horizontal";
        /** Expandable groups supply their joined frost material automatically. */
        material?: never;
        /** Trailing Button; caller owns its accessible name and activation handler. */
        children: ReactElement;
        /** Optional named controls; native focus and repeated activation are preserved. */
        actions?: ReactNode;
      }
  );

/** Interactive group accepting caller-owned named controls. Supply native aria-label or
 * aria-labelledby; native div props and refs pass through without event handling. */
function ButtonGroup({
  orientation = "horizontal",
  material,
  variant = "default",
  actions,
  children,
  ...props
}: ButtonGroupProps) {
  const expandable = variant === "expandable";
  return (
    // biome-ignore lint/a11y/useSemanticElements: Keep the Olyx div ref and group contract for non-form actions.
    <div
      data-expanded={(expandable && !!actions) || undefined}
      data-material={expandable ? "frost" : material}
      data-orientation={orientation}
      data-ui="button-group"
      data-variant={variant}
      role="group"
      {...props}
    >
      {expandable && (
        <AnimatePresence initial={false}>
          {Boolean(actions) && (
            <Reveal data-slot="button-group-reveal" key="actions" reveal="beside">
              <div data-slot="button-group-items">
                {actions}
                <ButtonGroupSeparator aria-hidden="true" />
              </div>
            </Reveal>
          )}
        </AnimatePresence>
      )}
      {children}
    </div>
  );
}

/** Informational divider; inherits Separator appearance and Base UI semantics. */
function ButtonGroupSeparator({
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="button-group-separator" orientation={orientation} {...props} />;
}

// biome-ignore lint/performance/noBarrelFile: Expose the summary companion from its owning ButtonGroup family.
export {
  ButtonGroupSummary,
  type ButtonGroupSummaryDetails,
  type ButtonGroupSummaryProps,
} from "./summary";
export { ButtonGroup, ButtonGroupSeparator };
