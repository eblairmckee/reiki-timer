import { type ReactNode, useId } from "react";
import "./style.css";

export interface TimelineItem {
  content: ReactNode;
  detail?: ReactNode;
  /** Stable identity across content updates. */
  key: string | number;
  /** Caller-formatted time, date or other leading content. */
  leading: ReactNode;
  /** Caller supplies readable marker meaning; omitted markers use a decorative dot. */
  marker?: ReactNode;
}

export interface TimelineProps {
  heading: ReactNode;
  items: readonly TimelineItem[];
  /** Optional list name; defaults to the visible heading through aria-labelledby. */
  label?: string;
}

/** Ordered sequence with a bounded list that supports native arrow/page-key scrolling. */
export function Timeline({ heading, label, items }: TimelineProps) {
  const headingId = useId();
  return (
    <div className="timeline">
      <h2 id={headingId}>{heading}</h2>
      <ol
        aria-label={label}
        aria-labelledby={label === undefined ? headingId : undefined}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the bounded list scrolls with the arrow and page keys.
        tabIndex={0}
      >
        {items.map((item) => (
          <li key={item.key}>
            <b className="timeline-leading">{item.leading}</b>
            <span className="timeline-marker">
              {item.marker ?? <span aria-hidden="true" className="timeline-dot" />}
            </span>
            <span className="timeline-content">
              {item.content}
              {item.detail !== undefined && item.detail !== null && item.detail !== "" && (
                <small>{item.detail}</small>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
