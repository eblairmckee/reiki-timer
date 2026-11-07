import { AnimatePresence } from "motion/react";
import { type ReactElement, type ReactNode, useId } from "react";
import { Reveal } from "../shared/reveal";
import { useSummaryDetails } from "./use-summary-details";
import "./summary.css";

export interface ButtonGroupSummaryDetails {
  /** Informational content, including a named focusable scroll region. Do not put menus or commands here. */
  content: ReactNode;
  /** Accessible name for the details toggle and its informational group. */
  label: string;
}

export interface ButtonGroupSummaryProps {
  /** One Button or ButtonGroup; its controls retain native names and activation behavior. */
  children: ReactElement;
  /** Details open on touch/click, Enter/Space, or pointer hover. Escape returns focus to the toggle;
   * leaving the group or clicking outside dismisses it. Hover alone dismisses on pointer exit. */
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
  const { region, open, events, toggle, trigger } = useSummaryDetails(!!details);
  const detailsId = useId();
  return (
    <fieldset
      aria-label={details?.label}
      className="button-group-summary-panel"
      data-open={open || undefined}
      ref={region}
      {...events}
    >
      <div className="button-group-summary-panel-trigger">
        <div
          aria-hidden="true"
          className="button-group-summary-panel-surface"
          data-inset-shadow=""
        />
        {children}
        {details !== undefined && (
          <button
            aria-controls={open ? detailsId : undefined}
            aria-expanded={open}
            aria-label={details.label}
            className="button-group-summary-toggle"
            onClick={toggle}
            ref={trigger}
            type="button"
          />
        )}
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
