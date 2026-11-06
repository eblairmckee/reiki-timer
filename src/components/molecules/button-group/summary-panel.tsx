import { AnimatePresence } from "motion/react";
import { type ReactNode, useId } from "react";
import { Disclosure } from "../../atoms/disclosure";
import { useHoverDisclosure } from "./use-hover-disclosure";
import "./summary-panel.css";

export type SummaryDetails = { label: string; content: ReactNode };

export function SummaryPanel({
  children,
  details,
}: {
  children: ReactNode;
  details?: SummaryDetails;
}) {
  const { region, open, events } = useHoverDisclosure<HTMLFieldSetElement>(!!details);
  const detailsId = useId();
  return (
    <fieldset
      ref={region}
      className="button-group-summary"
      aria-label={details?.label}
      tabIndex={details ? 0 : undefined}
      aria-details={open ? detailsId : undefined}
      data-open={open || undefined}
      {...events}
    >
      <div className="button-group-summary-trigger">
        <div
          aria-hidden="true"
          className="button-group-summary-surface"
          data-blurred-background=""
        />
        {children}
      </div>
      <AnimatePresence initial={false}>
        {details && open && (
          <Disclosure reveal="overlay" id={detailsId} className="button-group-summary-fold">
            {details.content}
          </Disclosure>
        )}
      </AnimatePresence>
    </fieldset>
  );
}
