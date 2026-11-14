import { AlertCircleIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Scene } from "@/components/atoms/scene";
import { Atmosphere } from "@/components/design-system/atmosphere";
import { Button } from "@/components/design-system/button";
import { Icon } from "@/components/design-system/icon";
import { motion as systemMotion } from "@/components/design-system/shared/motion";
import { Reveal } from "@/components/design-system/shared/reveal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EditorFields, StudyFields } from "../components/card-fields";
import { CardHeader } from "../components/card-header";
import { ConflictDialog, DiscardDialog } from "../components/editor-dialogs";
import { SearchFooter } from "../components/search-footer";
import { tarotPalette } from "../data/appearance";
import { cardAtIndex } from "../data/catalog";
import { type LibraryResource, useLibrary } from "../hooks/use-library";
import { useViewport } from "../hooks/use-viewport";
import type { CardContent, CatalogCard, LibraryCard, Orientation } from "../model/types";
import { cleanList, hasDraftChanges, validateDraft } from "../model/validation";
import { storageMessage } from "../services/library-storage";
import "./style.css";

export function TarotScreen({ deckIndex }: { deckIndex: string }) {
  const catalogCard = cardAtIndex(deckIndex);
  const library = useLibrary();
  let content: ReactNode;
  if (!catalogCard) {
    content = (
      <div className="tarot-state">
        <h1>Card not found</h1>
        <p>Choose a card from the 78-card deck.</p>
        <Link to="/tarot-flash">Open a random card</Link>
      </div>
    );
  } else if (library.state.kind === "loading") {
    content = (
      <div className="tarot-state" role="status">
        Opening your library…
      </div>
    );
  } else if (library.state.kind === "error") {
    content = (
      <div className="tarot-state" role="alert">
        <h1>Couldn’t open your library</h1>
        <p>{library.state.message}</p>
        <Button onClick={library.retry} type="button">
          Try again
        </Button>
      </div>
    );
  } else {
    content = (
      <LoadedCard
        catalogCard={catalogCard}
        onSaved={library.updateCard}
        resource={library.state.resource}
      />
    );
  }
  return (
    <Atmosphere palette={tarotPalette}>
      <section aria-label="Tarot Flash" className="tarot-shell">
        {content}
      </section>
    </Atmosphere>
  );
}

function LoadedCard({
  catalogCard,
  resource,
  onSaved,
}: {
  catalogCard: CatalogCard;
  resource: LibraryResource;
  onSaved: (card: LibraryCard) => void;
}) {
  const [loaded, setLoaded] = useState<{ card: LibraryCard; request: { cardId: string } } | null>(
    null
  );
  const record = loaded?.card ?? null;
  const [failure, setFailure] = useState<{ cardId: string; message: string } | null>(null);
  const [loadRequest, setLoadRequest] = useState({ cardId: catalogCard.id });
  if (loadRequest.cardId !== catalogCard.id) {
    setLoadRequest({ cardId: catalogCard.id });
  }
  const { service, session } = resource;
  useEffect(() => {
    let current = true;
    setFailure(null);
    service.getCard(loadRequest.cardId).then(
      (card) => {
        if (!current) {
          return;
        }
        if (!card) {
          setFailure({
            cardId: loadRequest.cardId,
            message:
              "This saved card is missing. Your other interpretations have not been changed.",
          });
          return;
        }
        session.visit(loadRequest.cardId);
        setLoaded({ card, request: loadRequest });
      },
      (cause: unknown) => {
        if (current) {
          setFailure({ cardId: loadRequest.cardId, message: storageMessage(cause) });
        }
      }
    );
    return () => {
      current = false;
    };
  }, [loadRequest, service, session]);
  const error = failure?.cardId === catalogCard.id ? failure.message : "";
  let unavailable: ReactNode = null;
  if (error) {
    unavailable = (
      <div className="tarot-state" role="alert">
        <h1>Couldn’t open this card</h1>
        <p>{error}</p>
        <Button
          onClick={() => {
            setFailure(null);
            setLoadRequest({ cardId: catalogCard.id });
          }}
          type="button"
        >
          Try again
        </Button>
      </div>
    );
  } else if (loaded?.request !== loadRequest) {
    unavailable = (
      <div className="tarot-state" role="status">
        Opening your card…
      </div>
    );
  }
  if (!record) {
    return unavailable;
  }
  return (
    <CardStudy
      catalogCard={catalogCard}
      initial={record}
      onSaved={onSaved}
      resource={resource}
      unavailable={unavailable}
    />
  );
}

export function CardStudy({
  catalogCard,
  initial,
  resource,
  onSaved,
  unavailable,
}: {
  catalogCard: CatalogCard;
  initial: LibraryCard;
  unavailable: ReactNode;
  resource: LibraryResource;
  onSaved: (card: LibraryCard) => void;
}) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [loadedRecord, setLoadedRecord] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState<CardContent | null>(null);
  const [orientation, setOrientation] = useState<Orientation>("upright");
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const [conflict, setConflict] = useState<LibraryCard | null>(null);
  const [showConflict, setShowConflict] = useState(false);
  const [focusKeyword, setFocusKeyword] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLElement>(null);
  const edit = useRef<HTMLButtonElement>(null);
  const operation = useRef(0);
  const pending = useRef(false);
  useViewport(root);
  // Card-local study state resets on a new storage result; the footer keeps its DOM and motion.
  if (loadedRecord !== initial) {
    setLoadedRecord(initial);
    setSaved(initial);
    setDraft(null);
    setOrientation("upright");
    setRevealed(new Set());
    setSaving(false);
    setError("");
    setNotice("");
    setDiscarding(false);
    setConflict(null);
    setShowConflict(false);
    setFocusKeyword(0);
  }
  const dirty = hasDraftChanges(draft, saved.content);
  const blocker = useBlocker({
    enableBeforeUnload: dirty || saving,
    shouldBlockFn: () => dirty || saving,
    withResolver: true,
  });
  const content = draft ?? saved.content;
  const otherNames = cleanList(content.otherNames);
  const errors = draft ? validateDraft(draft) : [];
  const invalid = errors.length > 0;
  const editing = draft !== null && !unavailable;

  useEffect(() => {
    if (initial.catalogCardId === catalogCard.id) {
      const focused = document.activeElement;
      const footerHasFocus = footer.current?.contains(focused) && !focused?.closest("[inert]");
      if (!footerHasFocus) {
        title.current?.focus({ preventScroll: true });
      }
      body.current?.scrollTo({ top: 0 });
    }
    pending.current = false;
    return () => {
      operation.current += 1;
    };
  }, [initial, catalogCard.id]);

  function toggleEdit() {
    if (!editing) {
      beginEdit();
      return;
    }
    if (dirty) {
      setDiscarding(true);
    } else {
      cancel();
    }
  }
  function resetReveals() {
    setRevealed(new Set());
  }
  function reverse() {
    setOrientation((value) => (value === "upright" ? "reversed" : "upright"));
    setRevealed(
      (previous) =>
        new Set([...previous].filter((field) => field !== "keywords" && field !== "notes"))
    );
  }
  function beginEdit() {
    setFocusKeyword(0);
    setDraft(structuredClone(saved.content));
    setError("");
    setNotice("");
  }
  function cancel() {
    setDraft(null);
    setError("");
    setDiscarding(false);
    setConflict(null);
    setShowConflict(false);
    resetReveals();
    requestAnimationFrame(() => edit.current?.focus());
  }
  function showValidation() {
    setOrientation("upright");
    setFocusKeyword((value) => value + 1);
  }
  async function save(expectedRevision = saved.revision) {
    if (!draft || invalid || pending.current) {
      return;
    }
    pending.current = true;
    operation.current += 1;
    const token = operation.current;
    setSaving(true);
    setError("");
    setShowConflict(false);
    try {
      const result = await resource.service.saveCard(saved.id, draft, expectedRevision);
      if (operation.current !== token) {
        return;
      }
      switch (result.kind) {
        case "saved":
          setSaved(result.card);
          onSaved(result.card);
          setDraft(null);
          setConflict(null);
          resetReveals();
          setNotice("Saved in this browser.");
          requestAnimationFrame(() => edit.current?.focus());
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
          showValidation();
          break;
        default: {
          const unreachable: never = result;
          throw new Error(`Unexpected save result: ${unreachable}`);
        }
      }
    } catch (cause) {
      if (operation.current === token) {
        setError(storageMessage(cause));
      }
    } finally {
      if (operation.current === token) {
        pending.current = false;
        setSaving(false);
      }
    }
  }
  function openCard(card: CatalogCard, fromSearch: boolean) {
    if (fromSearch) {
      resource.session.reset(card.id);
    }
    if (card.id === catalogCard.id) {
      setOrientation("upright");
      resetReveals();
      setNotice("");
      title.current?.focus();
      return;
    }
    navigate({
      params: { deckIndex: String(card.deckIndex) },
      to: "/tarot-flash/$deckIndex",
    }).catch(() => setError("Couldn’t open that card. Try again."));
  }
  function stay() {
    setDiscarding(false);
    blocker.reset?.();
  }
  function discard() {
    if (saving) {
      return;
    }
    if (blocker.status === "blocked") {
      setDraft(null);
      setError("");
      setDiscarding(false);
      setConflict(null);
      setShowConflict(false);
      blocker.proceed();
    } else {
      cancel();
    }
  }

  function replaceDraft() {
    if (conflict) {
      save(conflict.revision);
    }
  }
  function acceptSavedVersion() {
    if (!conflict) {
      return;
    }
    setSaved(conflict);
    onSaved(conflict);
    cancel();
    setNotice("Opened the saved version.");
  }

  return (
    <div className="tarot-screen" data-editing={editing} ref={root}>
      <div className="tarot-foreground">
        {unavailable ?? (
          <>
            <CardHeader
              catalogCard={catalogCard}
              editing={editing}
              editRef={edit}
              onEdit={toggleEdit}
              onReverse={reverse}
              orientation={orientation}
              otherNames={otherNames}
              saving={saving}
              titleRef={title}
            />
            <div className="tarot-body" ref={body}>
              <AnimatePresence initial={false} mode="wait">
                <Scene className="tarot-fields" key={editing ? "edit" : "view"}>
                  {editing ? (
                    <EditorFields
                      content={draft}
                      focusKeyword={focusKeyword}
                      invalid={invalid}
                      keywordOptions={[
                        ...new Set(
                          resource.cards.flatMap((card) => [
                            ...card.content.meanings.upright.keywords,
                            ...(card.content.meanings.reversed?.keywords ?? []),
                          ])
                        ),
                      ]}
                      onChange={setDraft}
                      orientation={orientation}
                      saving={saving}
                    />
                  ) : (
                    <StudyFields
                      catalogCardId={catalogCard.id}
                      content={saved.content}
                      onReveal={(id) => setRevealed((previous) => new Set([...previous, id]))}
                      orientation={orientation}
                      revealed={revealed}
                    />
                  )}
                </Scene>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
      <motion.footer
        className="tarot-footer"
        layout="position"
        ref={footer}
        transition={reducedMotion ? { duration: 0 } : systemMotion.disclosure.slide}
      >
        <AnimatePresence initial={false} mode="wait">
          <Reveal key={editing ? "edit" : "study"} reveal="overlay">
            {editing ? (
              <div className="tarot-edit-actions">
                <div className="tarot-save-feedback">
                  {invalid && (
                    <button
                      className="tarot-validation"
                      id="tarot-validation"
                      onClick={showValidation}
                      type="button"
                    >
                      {errors[0].message}
                    </button>
                  )}
                  {Boolean(error) && <p role="alert">{error}</p>}
                  {Boolean(conflict) && (
                    <Button
                      appearance="text"
                      aria-label="Review versions"
                      iconOnly
                      onClick={() => setShowConflict(true)}
                      title="Review versions"
                      type="button"
                    >
                      <Icon icon={AlertCircleIcon} />
                    </Button>
                  )}
                  {Boolean(saving) && (
                    <p className="tarot-sr-only" role="status">
                      Saving…
                    </p>
                  )}
                </div>
                <Button
                  aria-busy={saving}
                  aria-label={saving ? "Saving…" : "Save"}
                  disabled={invalid || saving}
                  iconOnly
                  onClick={() => save()}
                  title="Save"
                  type="button"
                >
                  <Icon icon={Tick02Icon} />
                </Button>
              </div>
            ) : (
              <>
                <p className="tarot-sr-only" role="status">
                  {notice}
                </p>
                {Boolean(error) && <p role="alert">{error}</p>}
                <SearchFooter
                  cards={resource.cards}
                  onSelect={(card) => openCard(card, true)}
                  onShuffle={() => openCard(resource.session.shuffle(catalogCard.id), false)}
                />
              </>
            )}
          </Reveal>
        </AnimatePresence>
      </motion.footer>
      <DiscardDialog
        onDiscard={discard}
        onStay={stay}
        open={discarding || blocker.status === "blocked"}
        saving={saving}
      />
      <ConflictDialog
        current={conflict}
        draft={draft}
        onClose={() => setShowConflict(false)}
        onReplace={replaceDraft}
        onUseSaved={acceptSavedVersion}
        open={showConflict}
      />
    </div>
  );
}
