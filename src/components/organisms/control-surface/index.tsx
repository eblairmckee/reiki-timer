import { motion } from "motion/react";
import type { ReactElement, ReactNode, Ref } from "react";
import type { ButtonGroupSummaryDetails } from "@/components/design-system/button-group";
import { ButtonGroup, ButtonGroupSummary } from "@/components/design-system/button-group";
import { motion as systemMotion } from "@/components/design-system/shared/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import "./style.css";

export interface ControlSurfaceProps {
  /** Optional adjacent native controls; each control supplies its own accessible name and action. */
  actions?: ReactNode;
  /** Stationary primary control; caller provides its accessible name, native semantics and action. */
  children: ReactElement;
  /** Optional class appended to the neutral control-surface layout class. */
  className?: string;
  /** Caller-authored informational details; rendered only when summary content is present. */
  details?: ButtonGroupSummaryDetails;
  /** Accessible group name for the primary and adjacent actions. */
  groupLabel: string;
  /** Caller-controlled visibility. Hidden surfaces are inert and do not accept focus or activation. */
  hidden?: boolean;
  /** Accessible name for the fieldset that contains this control surface. */
  label: string;
  /** Optional native fieldset ref. */
  ref?: Ref<HTMLFieldSetElement>;
  /** Optional noninteractive informational content; do not put menus or controls here. Omission removes the summary panel. */
  summary?: ReactNode;
}

/** Reusable control surface coordinating a summary disclosure and adjacent action reveal under
 * one caller-controlled hidden/inert and motion lifecycle. Content stays native and replaceable;
 * the caller owns action names, commands, state and focus choreography. The supported root API is
 * intentionally limited to its label, visibility, className and fieldset ref rather than spreading
 * arbitrary fieldset props into the motion element. */
export function ControlSurface({
  actions,
  children,
  className,
  details,
  groupLabel,
  hidden = false,
  label,
  ref,
  summary,
}: ControlSurfaceProps) {
  const reducedMotion = useReducedMotion();
  const transition = hidden ? systemMotion.scene.exit : systemMotion.scene.enter;
  return (
    <motion.fieldset
      animate={{ opacity: hidden ? 0 : 1 }}
      aria-hidden={hidden}
      aria-label={label}
      className={className ? `control-surface ${className}` : "control-surface"}
      inert={hidden}
      initial={false}
      ref={ref}
      transition={reducedMotion ? { duration: 0 } : transition}
    >
      <ButtonGroupSummary details={details} summary={summary}>
        <ButtonGroup actions={actions} aria-label={groupLabel} variant="expandable">
          {children}
        </ButtonGroup>
      </ButtonGroupSummary>
    </motion.fieldset>
  );
}
