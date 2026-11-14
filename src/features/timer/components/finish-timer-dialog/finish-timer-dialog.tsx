// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
import { type RefObject, useRef } from "react";
import { Button } from "@/components/design-system/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
} from "@/components/design-system/dialog";
import { LinkButton } from "@/components/design-system/link-button";
import "@/features/timer/components/finish-timer-dialog/style.css";

interface Props {
  expired: boolean;
  finishRef: RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
  onEdit: () => void;
  onLeave: () => void;
  onSave: () => void;
  open: boolean;
  saveError: boolean;
}

export function FinishTimerDialog({
  open,
  expired,
  saveError,
  finishRef,
  onDismiss,
  onLeave,
  onSave,
  onEdit,
}: Props) {
  const title = useRef<HTMLHeadingElement>(null);
  return (
    <Dialog
      onOpenChange={(nextOpen, details) => {
        if (nextOpen || !open) {
          return;
        }
        if (details.reason === "close-press") {
          onLeave();
        } else {
          onDismiss();
        }
      }}
      open={open}
    >
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup
          className="reiki-off-dialog"
          finalFocus={finishRef}
          inert={!open}
          initialFocus={title}
        >
          <DialogTitle ref={title} tabIndex={-1}>
            Reiki off
          </DialogTitle>
          <DialogDescription>
            {expired ? "Your session is complete." : "Want to close out this session?"} Before you
            go, you can{" "}
            <LinkButton as="button" inline onClick={onSave}>
              save this timer
            </LinkButton>{" "}
            for next time or{" "}
            <LinkButton
              href="/reiki-on/edit"
              inline
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                  return;
                }
                event.preventDefault();
                onEdit();
              }}
            >
              make changes
            </LinkButton>{" "}
            to it first
          </DialogDescription>
          {Boolean(saveError) && <p role="alert">Couldn’t save in this browser. Try again</p>}
          <DialogClose render={<Button appearance="primary" className="reiki-off-dialog-leave" />}>
            Leave without saving
          </DialogClose>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
