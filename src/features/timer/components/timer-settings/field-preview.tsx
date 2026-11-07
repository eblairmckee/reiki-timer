import type { ReactNode } from "react";

export function FieldPreview({ context, children }: { context: string; children: ReactNode }) {
  return (
    <div className="timer-field-preview">
      <span className="visually-hidden">{context}</span>
      <span>Like: </span>
      {children}
    </div>
  );
}
