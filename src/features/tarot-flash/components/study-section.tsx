import { type ReactNode, useRef } from "react";

/** The answer remains in layout while concealed, so wrapping and responsive media
 * reserve their real height. visibility + aria-hidden + inert also conceal its alternatives. */
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
