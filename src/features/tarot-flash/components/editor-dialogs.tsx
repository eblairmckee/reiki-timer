import { Button } from "@/components/design-system/button";
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
} from "@/components/design-system/dialog";
import { correspondenceFields } from "../data/correspondences";
import type { CardContent, LibraryCard } from "../model/types";

export function DiscardDialog({
  open,
  saving,
  onStay,
  onDiscard,
}: {
  open: boolean;
  saving: boolean;
  onStay: () => void;
  onDiscard: () => void;
}) {
  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          onStay();
        }
      }}
      open={open}
    >
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogTitle>{saving ? "Saving your card" : "Discard your changes?"}</DialogTitle>
          <DialogDescription>
            {saving
              ? "Wait for this save to finish before leaving."
              : "Your unsaved edits will be lost. Your saved interpretations will stay as they are."}
          </DialogDescription>
          <div className="tarot-dialog-actions">
            <Button onClick={onStay} type="button">
              Keep editing
            </Button>
            <Button appearance="text" disabled={saving} onClick={onDiscard} type="button">
              Discard changes
            </Button>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}

function ContentSummary({ content }: { content: CardContent }) {
  const entries = [
    ["Other names", content.otherNames.join(", ")],
    ...correspondenceFields.map(({ id, label }) => [
      label,
      content.correspondences[id]?.join(", "),
    ]),
    ["Upright keywords", content.meanings.upright.keywords.join(", ")],
    ["Upright notes", content.meanings.upright.notes],
    ["Reversed keywords", content.meanings.reversed?.keywords.join(", ")],
    ["Reversed notes", content.meanings.reversed?.notes],
  ];
  return (
    <dl className="tarot-conflict-content">
      {entries.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || "Empty"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ConflictDialog({
  current,
  draft,
  open,
  onClose,
  onUseSaved,
  onReplace,
}: {
  current: LibraryCard | null;
  draft: CardContent | null;
  open: boolean;
  onClose: () => void;
  onUseSaved: () => void;
  onReplace: () => void;
}) {
  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      open={open}
    >
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="tarot-conflict-dialog">
          <DialogTitle>This card changed elsewhere</DialogTitle>
          <DialogDescription>
            Your draft is safe. Compare both versions before choosing what to keep. Replacing saves
            your entire draft over the saved version shown here.
          </DialogDescription>
          <div className="tarot-conflict-versions">
            <section>
              <h3>Saved version</h3>
              {current !== null && <ContentSummary content={current.content} />}
            </section>
            <section>
              <h3>Your draft</h3>
              {draft !== null && <ContentSummary content={draft} />}
            </section>
          </div>
          <div className="tarot-dialog-actions">
            <Button onClick={onClose} type="button">
              Keep editing
            </Button>
            <Button appearance="text" onClick={onUseSaved} type="button">
              Use saved version
            </Button>
            <Button appearance="text" onClick={onReplace} type="button">
              Replace with my draft
            </Button>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
