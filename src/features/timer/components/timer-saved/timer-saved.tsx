import { useEffect, useRef } from "react";
import { Button } from "@/components/design-system/button";

import "./style.css";
import "../../styles/session.css";

export function TimerSaved({ onDone }: { onDone: () => void }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="timer-session timer-save">
      <h1 data-ink="display" data-lettering="frosted" ref={title} tabIndex={-1}>
        Timer saved
      </h1>
      <Button appearance="primary" onClick={onDone} size="lg">
        Done
      </Button>
    </div>
  );
}
