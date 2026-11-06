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

interface ActionGroupProps {
  actions?: ReactNode;
  label: string;
  primary: ReactElement;
}

export function ActionGroup({ label, primary, actions }: ActionGroupProps) {
  return (
    <OlyxButtonGroup
      aria-label={label}
      className="hud-action-group"
      data-expanded={!!actions || undefined}
      material="frost"
    >
      <AnimatePresence initial={false}>
        {Boolean(actions) && (
          <Disclosure
            className="hud-action-reveal"
            data-slot="button-group-reveal"
            key="actions"
            reveal="beside"
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
            <Disclosure className="button-group-items" key="summary" reveal="fade">
              <SummaryPanel details={props.details}>{props.summary}</SummaryPanel>
            </Disclosure>
          )}
        </AnimatePresence>
        <div className="button-group-primary">
          {props.variant === "actions" ? (
            <ActionGroup actions={props.actions} label="Session actions" primary={props.primary} />
          ) : (
            props.primary
          )}
        </div>
      </div>
    </div>
  );
}
