import { useLayoutEffect, useRef, useState } from "react";
import type { CardContent, LibraryCard, TarotService } from "../model/types";
import { hasDraftChanges, validateDraft } from "../model/validation";
import { storageMessage } from "../services/library-storage";

export function useCardEditor({
  catalogCardId,
  initial,
  service,
  onCardUpdate,
  onFinish,
  onInvalid,
}: {
  catalogCardId: string;
  initial: LibraryCard;
  service: TarotService;
  onCardUpdate: (card: LibraryCard) => void;
  onFinish: () => void;
  onInvalid: () => void;
}) {
  const [source, setSource] = useState({ catalogCardId, initial, service });
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState<CardContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const [conflict, setConflict] = useState<LibraryCard | null>(null);
  const [showConflict, setShowConflict] = useState(false);
  const pendingSave = useRef<{ source: typeof source } | null>(null);

  // Reset the editor for a new card without remounting the study or search controls.
  if (
    source.initial !== initial ||
    source.catalogCardId !== catalogCardId ||
    source.service !== service
  ) {
    setSource({ catalogCardId, initial, service });
    setSaved(initial);
    clearDraft();
    setSaving(false);
    setNotice("");
  }

  // Once the source changes or unmounts, its save can no longer publish a result.
  useLayoutEffect(
    () => () => {
      if (pendingSave.current?.source === source) {
        pendingSave.current = null;
      }
    },
    [source]
  );

  const dirty = hasDraftChanges(draft, saved.content);
  const validationError = draft ? validateDraft(draft).at(0) : undefined;

  function clearDraft() {
    setDraft(null);
    setError("");
    setDiscarding(false);
    setConflict(null);
    setShowConflict(false);
  }

  function discardDraft() {
    if (pendingSave.current) {
      return false;
    }
    clearDraft();
    return true;
  }

  function changeDraft(content: CardContent) {
    if (!pendingSave.current) {
      setDraft(content);
    }
  }

  function toggle() {
    if (pendingSave.current) {
      return;
    }
    if (!draft) {
      setDraft(structuredClone(saved.content));
      setError("");
      setNotice("");
    } else if (dirty) {
      setDiscarding(true);
    } else {
      clearDraft();
      onFinish();
    }
  }

  async function save(expectedRevision = saved.revision) {
    if (!draft || validationError || pendingSave.current) {
      return;
    }
    const operation = { source };
    pendingSave.current = operation;
    setSaving(true);
    setError("");
    setShowConflict(false);
    try {
      const result = await service.saveCard(saved.id, draft, expectedRevision);
      if (pendingSave.current !== operation) {
        return;
      }
      switch (result.kind) {
        case "saved":
          setSaved(result.card);
          onCardUpdate(result.card);
          clearDraft();
          setNotice("Saved in this browser.");
          onFinish();
          break;
        case "conflict":
          setConflict(result.current);
          setShowConflict(true);
          setError("This card changed elsewhere. Review both versions before saving.");
          break;
        case "missing":
          setError(
            "This saved card is missing. Your draft is still here; try again after restoring access to your library."
          );
          break;
        case "storage":
          setError(result.message);
          break;
        case "validation":
          setError(result.errors[0]?.message ?? "Check your draft.");
          onInvalid();
          break;
        default: {
          const unreachable: never = result;
          throw new Error(`Unexpected save result: ${unreachable}`);
        }
      }
    } catch (cause) {
      if (pendingSave.current === operation) {
        setError(storageMessage(cause));
      }
    } finally {
      if (pendingSave.current === operation) {
        pendingSave.current = null;
        setSaving(false);
      }
    }
  }

  function replaceDraft() {
    if (conflict) {
      return save(conflict.revision);
    }
  }

  function acceptSavedVersion() {
    if (!(conflict && discardDraft())) {
      return;
    }
    setSaved(conflict);
    onCardUpdate(conflict);
    setNotice("Opened the saved version.");
    onFinish();
  }

  return {
    acceptSavedVersion,
    changeDraft,
    clearNotice: () => setNotice(""),
    closeConflict: () => setShowConflict(false),
    closeDiscard: () => setDiscarding(false),
    conflict,
    dirty,
    discardDraft,
    discarding,
    draft,
    error,
    notice,
    replaceDraft,
    reviewConflict: () => setShowConflict(true),
    save: () => save(),
    saved,
    saving,
    showConflict,
    toggle,
    validationError,
  };
}
