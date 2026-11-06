import { useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { useTimer } from "./timer-context";

export function SaveTimer() {
  const { onDone } = useTimer();
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="timer-session timer-save">
      <h1 data-ink="display" data-lettering="frosted" tabIndex={-1} ref={title}>
        Timer saved
      </h1>
      <Button mode="frost" size="lg" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
