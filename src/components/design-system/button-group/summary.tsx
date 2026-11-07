import { AnimatePresence } from "motion/react";
import { type ReactElement, type ReactNode, useId } from "react";
import { Reveal } from "../shared/reveal";
import { useHoverDetails } from "./use-hover-details";
import "./summary.css";

export interface ButtonGroupSummaryDetails {
  /** Noninteractive detail nodes; caller supplies meaningful readable text for accessibility. */
  content: ReactNode;
  /** Accessible name for the focusable summary fieldset. */
  label: string;
}

export interface ButtonGroupSummaryProps {
  /** One Button or ButtonGroup; its controls retain native names and activation behavior. */
  children: ReactElement;
  /** Optional named details shown on summary hover/focus and dismissed on exit/Escape. */
  details?: ButtonGroupSummaryDetails;
  /** Optional noninteractive summary nodes; caller supplies meaningful readable text for accessibility. Omission removes the panel while preserving the action. */
  summary?: ReactNode;
}

/** Neutral layout wrapper for a glass informational summary beside a stationary Button or ButtonGroup. */
export function ButtonGroupSummary({ children, summary, details }: ButtonGroupSummaryProps) {
  const hasSummary = summary !== undefined && summary !== null && summary !== false;
  return (
    <div className="button-group-summary">
      <div className="button-group-track">
        <AnimatePresence initial={false}>
          {hasSummary === true && (
            <Reveal className="button-group-summary-items" key="summary" reveal="fade">
              <SummaryPanel details={details}>{summary}</SummaryPanel>
            </Reveal>
          )}
        </AnimatePresence>
        <div className="button-group-primary">{children}</div>
      </div>
    </div>
  );
}

function SummaryPanel({
  children,
  details,
}: {
  children: ReactNode;
  details?: ButtonGroupSummaryDetails;
}) {
  const { region, open, events } = useHoverDetails<HTMLFieldSetElement>(!!details);
  const detailsId = useId();
  return (
    <fieldset
      aria-details={open ? detailsId : undefined}
      aria-label={details?.label}
      className="button-group-summary-panel"
      data-open={open || undefined}
      ref={region}
      tabIndex={details ? 0 : undefined}
      {...events}
    >
      <div className="button-group-summary-panel-trigger">
        <div
          aria-hidden="true"
          className="button-group-summary-panel-surface"
          data-inset-shadow=""
        />
        {children}
      </div>
      <div>
        <AnimatePresence initial={false}>
          {details !== undefined && open === true && (
            <Reveal className="button-group-summary-panel-fold" id={detailsId} reveal="overlay">
              {details.content}
            </Reveal>
          )}
        </AnimatePresence>
      </div>
    </fieldset>
  );
}
