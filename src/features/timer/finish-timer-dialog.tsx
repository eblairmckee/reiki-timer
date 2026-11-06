import { Dialog } from "@base-ui/react/dialog";
import { type RefObject, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import "./finish-timer-dialog.css";

type Props = {
  open: boolean;
  expired: boolean;
  saveError: boolean;
  finishRef: RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
  onLeave: () => void;
  onSave: () => void;
  onEdit: () => void;
};

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
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (nextOpen || !open) return;
        if (details.reason === "close-press") onLeave();
        else onDismiss();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="reiki-off-backdrop" />
        <Dialog.Popup
          className="reiki-off-dialog"
          initialFocus={title}
          finalFocus={finishRef}
          inert={!open}
        >
          <Dialog.Title ref={title} tabIndex={-1} data-lettering="etched">
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
              inline
              href="/reiki-on/edit"
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                onEdit();
              }}
            >
              make changes
            </LinkButton>{" "}
            to it first
          </Dialog.Description>
          {saveError && <p role="alert">Couldn’t save in this browser. Try again</p>}
          <Dialog.Close render={<Button mode="frost" />}>Leave without saving</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
