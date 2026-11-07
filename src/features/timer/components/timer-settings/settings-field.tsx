import type { ReactNode } from "react";

interface FieldProps {
  children: ReactNode;
  description?: ReactNode;
  /** Reserve clearance for an orbiting dial value in this feature's layout. */
  dialLayout?: boolean;
  id: string;
  label?: string;
  related?: boolean;
}

export function Field({ id, label, description, children, related, dialLayout }: FieldProps) {
  return (
    <section
      className="timer-field"
      data-dial-layout={dialLayout || undefined}
      data-related={related || undefined}
    >
      {Boolean(label) && (
        <div className="timer-field-copy">
          <label className="timer-label" data-ink="label" data-lettering="etched" htmlFor={id}>
            {label}
          </label>
          {Boolean(description) && (
            <div className="timer-description" data-ink="detail" id={`${id}-description`}>
              {description}
            </div>
          )}
        </div>
      )}
      <div className="timer-field-control">{children}</div>
    </section>
  );
}
