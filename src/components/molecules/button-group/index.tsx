import { AnimatePresence } from "motion/react";
import type { ReactElement, ReactNode } from "react";
import { Disclosure } from "../../atoms/disclosure";
import { ButtonGroupSeparator, ButtonGroup as OlyxButtonGroup } from "../../ui/button-group";
import { type SummaryDetails, SummaryPanel } from "./summary-panel";
import "./style.css";

type ButtonGroupProps = {
  primary: ReactElement;
} & (
  | { variant: "actions"; actions?: ReactNode }
  | { variant: "summary"; summary: ReactNode; details?: SummaryDetails }
);

type ActionGroupProps = {
  label: string;
  primary: ReactElement;
  actions?: ReactNode;
};

export function ActionGroup({ label, primary, actions }: ActionGroupProps) {
  return (
    <OlyxButtonGroup
      aria-label={label}
      className="hud-action-group"
      material="frost"
      data-expanded={!!actions || undefined}
    >
      <AnimatePresence initial={false}>
        {actions && (
          <Disclosure
            key="actions"
            reveal="beside"
            className="hud-action-reveal"
            data-slot="button-group-reveal"
          >
            <div className="hud-action-items" data-slot="button-group-items">
              {actions}
              <ButtonGroupSeparator aria-hidden="true" />
            </div>
          </Disclosure>
        )}
      </AnimatePresence>
      {primary}
    </OlyxButtonGroup>
  );
}

export function ButtonGroup(props: ButtonGroupProps) {
  return (
    <div className="button-group" data-variant={props.variant}>
      <div className="button-group-strip">
        <AnimatePresence initial={false}>
          {props.variant === "summary" && (
            <Disclosure key="summary" reveal="fade" className="button-group-items">
              <SummaryPanel details={props.details}>{props.summary}</SummaryPanel>
            </Disclosure>
          )}
        </AnimatePresence>
        <div className="button-group-primary">
          {props.variant === "actions" ? (
            <ActionGroup label="Session actions" primary={props.primary} actions={props.actions} />
          ) : (
            props.primary
          )}
        </div>
      </div>
    </div>
  );
}
