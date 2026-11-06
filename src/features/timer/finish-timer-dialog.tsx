// biome-ignore-all lint/performance/noJsxPropsBind: Event handlers intentionally close over current state; no memoized consumer requires stable callback identity.
import { Dialog } from "@base-ui/react/dialog";
import { type RefObject, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import "./finish-timer-dialog.css";

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
    <Dialog.Root
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
      <Dialog.Portal>
        <Dialog.Backdrop className="reiki-off-backdrop" />
        <Dialog.Popup
          className="reiki-off-dialog"
          finalFocus={finishRef}
          inert={!open}
          initialFocus={title}
        >
          <Dialog.Title data-lettering="etched" ref={title} tabIndex={-1}>
            Reiki off
          </Dialog.Title>
          <Dialog.Description>
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
          </Dialog.Description>
          {Boolean(saveError) && <p role="alert">Couldn’t save in this browser. Try again</p>}
          <Dialog.Close render={<Button mode="frost" />}>Leave without saving</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
