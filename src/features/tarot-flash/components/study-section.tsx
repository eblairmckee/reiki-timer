import { type ReactNode, useRef } from "react";

/** Items keep their actual layout while concealed. Their masks reveal the field category;
 * aria-hidden + inert conceal the answer's alternatives and prevent hidden interactions. */
export function StudySection({
  label,
  populated,
  revealed,
  onReveal,
  children,
}: {
  label: string;
  populated: boolean;
  revealed: boolean;
  onReveal: () => void;
  children: ReactNode;
}) {
  const content = useRef<HTMLDivElement>(null);
  if (!populated) {
    return null;
  }
  return (
    <section aria-label={label} className="tarot-section">
      <div className="tarot-reveal" data-revealed={revealed}>
        <div
          aria-hidden={!revealed}
          className="tarot-answer"
          inert={!revealed}
          ref={content}
          tabIndex={-1}
        >
          {children}
        </div>
        {!revealed && (
          <button
            aria-label={`Reveal ${label.toLowerCase()}`}
            className="tarot-reveal-control"
            onClick={() => {
              onReveal();
              requestAnimationFrame(() => content.current?.focus({ preventScroll: true }));
            }}
            type="button"
          />
        )}
      </div>
    </section>
  );
}
