import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import "./style.css";

/** Groups the trigger and portal and manages the dialog's open state. */
export const Dialog = BaseDialog.Root;
/** Places the backdrop and popup in the portal container, which defaults to the document body. */
export const DialogPortal = BaseDialog.Portal;
/** A button that opens the dialog. Give it a visible label or an accessible name. */
export const DialogTrigger = BaseDialog.Trigger;
/** A button inside the popup that dismisses the dialog. Give it an accessible name. */
export const DialogClose = BaseDialog.Close;

/** Blurred modal backdrop; compose within Dialog and DialogPortal. Native
 * Base UI props and refs retain their transition and event contracts. */
export function DialogBackdrop(props: ComponentProps<typeof BaseDialog.Backdrop>) {
  return <BaseDialog.Backdrop data-ui="dialog-backdrop" {...props} />;
}

/** Centered glass modal surface; compose a named title and descriptive content inside it.
 * Base UI retains focus containment, dismissal and caller-supplied focus targets. */
export function DialogPopup(props: ComponentProps<typeof BaseDialog.Popup>) {
  return <BaseDialog.Popup data-ui="dialog-popup" {...props} />;
}

/** Readable, etched modal heading; supplies the popup's accessible name through Base UI. */
export function DialogTitle(props: ComponentProps<typeof BaseDialog.Title>) {
  return <BaseDialog.Title data-lettering="etched" data-slot="dialog-title" {...props} />;
}

/** Readable modal description; native Base UI relationships, children and refs pass through. */
export function DialogDescription(props: ComponentProps<typeof BaseDialog.Description>) {
  return <BaseDialog.Description data-slot="dialog-description" {...props} />;
}
