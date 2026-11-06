import { AnimatePresence } from "motion/react";
import { type ReactNode, useId } from "react";
import { Disclosure } from "../../atoms/disclosure";
import { useHoverDisclosure } from "./use-hover-disclosure";
import "./summary-panel.css";

export interface SummaryDetails {
  content: ReactNode;
  label: string;
}

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
      aria-details={open ? detailsId : undefined}
      aria-label={details?.label}
      className="button-group-summary"
      data-open={open || undefined}
      ref={region}
      tabIndex={details ? 0 : undefined}
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
        {details !== undefined && open === true && (
          <Disclosure className="button-group-summary-fold" id={detailsId} reveal="overlay">
            {details.content}
          </Disclosure>
        )}
      </AnimatePresence>
    </fieldset>
  );
}
