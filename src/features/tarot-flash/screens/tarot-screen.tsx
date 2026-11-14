import { AlertCircleIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Scene } from "@/components/atoms/scene";
import { Atmosphere } from "@/components/design-system/atmosphere";
import { Button } from "@/components/design-system/button";
import { ButtonGroup } from "@/components/design-system/button-group";
import { Icon } from "@/components/design-system/icon";
import { EditorFields, StudyFields } from "../components/card-fields";
import { CardHeader } from "../components/card-header";
import { CardSecondaryActions } from "../components/card-secondary-actions";
import { ConflictDialog, DiscardDialog } from "../components/editor-dialogs";
import { SearchFooter } from "../components/search-footer";
import { tarotPalette } from "../data/appearance";
import { cardAtIndex } from "../data/catalog";
import { useCardEditor } from "../hooks/use-card-editor";
import { type LibraryResource, useLibrary } from "../hooks/use-library";
import { useTarotViewport } from "../hooks/use-tarot-viewport";
import type { CatalogCard, LibraryCard, Orientation } from "../model/types";
import { cleanList } from "../model/validation";
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
        <Button appearance="primary" onClick={library.retry} type="button">
          Try again
        </Button>
      </div>
    );
  } else {
    content = (
      <LoadedCard
        catalogCard={catalogCard}
        onCardUpdate={library.updateCard}
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
  onCardUpdate,
}: {
  catalogCard: CatalogCard;
  resource: LibraryResource;
  onCardUpdate: (card: LibraryCard) => void;
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
        onCardUpdate(card);
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
  }, [loadRequest, onCardUpdate, service, session]);
  const error = failure?.cardId === catalogCard.id ? failure.message : "";
  let unavailable: ReactNode = null;
  if (error) {
    unavailable = (
      <div className="tarot-state" role="alert">
        <h1>Couldn’t open this card</h1>
        <p>{error}</p>
        <Button
          appearance="primary"
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
      onCardUpdate={onCardUpdate}
      resource={resource}
      unavailable={unavailable}
    />
  );
}

function CardStudy({
  catalogCard,
  initial,
  resource,
  onCardUpdate,
  unavailable,
}: {
  catalogCard: CatalogCard;
  initial: LibraryCard;
  unavailable: ReactNode;
  resource: LibraryResource;
  onCardUpdate: (card: LibraryCard) => void;
}) {
  const navigate = useNavigate();
  const [loadedRecord, setLoadedRecord] = useState(initial);
  const [orientation, setOrientation] = useState<Orientation>("upright");
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const [navigationError, setNavigationError] = useState("");
  const [focusKeyword, setFocusKeyword] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLElement>(null);
  const restoreEditFocus = useRef(false);
  const attachEdit = useCallback((node: HTMLButtonElement | null) => {
    if (node && restoreEditFocus.current) {
      restoreEditFocus.current = false;
      node.focus({ preventScroll: true });
    }
  }, []);
  useTarotViewport(root);
  // Card-local study state resets on a new storage result; the footer keeps its DOM and motion.
  if (loadedRecord !== initial) {
    setLoadedRecord(initial);
    setOrientation("upright");
    setRevealed(new Set());
    setNavigationError("");
    setFocusKeyword(0);
  }
  const editor = useCardEditor({
    catalogCardId: catalogCard.id,
    initial,
    onCardUpdate,
    onFinish: finishEditing,
    onInvalid: showValidation,
    service: resource.service,
  });
  const { dirty, draft, saved, saving, validationError } = editor;
  const blocker = useBlocker({
    enableBeforeUnload: dirty || saving,
    shouldBlockFn: () => dirty || saving,
    withResolver: true,
  });
  const otherNames = cleanList((draft ?? saved.content).otherNames);
  const invalid = Boolean(validationError);
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
  }, [initial, catalogCard.id]);

  function toggleEdit() {
    if (!editing) {
      setFocusKeyword(0);
      setNavigationError("");
    }
    editor.toggle();
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
  function finishEditing() {
    resetReveals();
    restoreEditFocus.current = true;
  }
  function showValidation() {
    setOrientation("upright");
    setFocusKeyword((value) => value + 1);
  }
  function openCard(card: CatalogCard, fromSearch: boolean) {
    if (fromSearch) {
      resource.session.reset(card.id);
    }
    if (card.id === catalogCard.id) {
      setOrientation("upright");
      resetReveals();
      editor.clearNotice();
      title.current?.focus();
      return;
    }
    navigate({
      params: { deckIndex: String(card.deckIndex) },
      to: "/tarot-flash/$deckIndex",
    }).catch(() => setNavigationError("Couldn’t open that card. Try again."));
  }
  function stay() {
    editor.closeDiscard();
    blocker.reset?.();
  }
  function discard() {
    if (!editor.discardDraft()) {
      return;
    }
    if (blocker.status === "blocked") {
      blocker.proceed();
    } else {
      finishEditing();
    }
  }

  const secondaryActions = (
    <CardSecondaryActions
      disabled={saving || Boolean(unavailable)}
      editing={editing}
      editRef={attachEdit}
      onEdit={toggleEdit}
      onReverse={reverse}
      orientation={orientation}
    />
  );
  return (
    <div ref={root}>
      {/* A mode owns all of its geometry. Keep the complete outgoing tree until it is hidden.
          Card navigation keeps the study key, so shuffling never remounts the footer. */}
      <AnimatePresence initial={false} mode="wait">
        <Scene className="tarot-mode" key={editing ? "edit" : "view"}>
          <div className="tarot-screen" data-editing={editing}>
            <div className="tarot-foreground">
              {unavailable ?? (
                <>
                  <CardHeader
                    catalogCard={catalogCard}
                    editing={editing}
                    otherNames={otherNames}
                    titleRef={title}
                  />
                  <div className="tarot-body" ref={body}>
                    <div className="tarot-fields">
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
                          onChange={editor.changeDraft}
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
                    </div>
                  </div>
                </>
              )}
            </div>
            <footer className="tarot-footer" ref={footer}>
              {editing ? (
                <div className="tarot-edit-actions">
                  <div className="tarot-save-feedback">
                    {validationError !== undefined && (
                      <Button
                        appearance="text"
                        className="tarot-validation"
                        id="tarot-validation"
                        onClick={showValidation}
                        type="button"
                      >
                        {validationError.message}
                      </Button>
                    )}
                    {Boolean(editor.error) && <p role="alert">{editor.error}</p>}
                    {editor.conflict !== null && (
                      <Button
                        appearance="text"
                        aria-label="Review versions"
                        disabled={saving}
                        iconOnly
                        onClick={editor.reviewConflict}
                        title="Review versions"
                        type="button"
                      >
                        <Icon icon={AlertCircleIcon} />
                      </Button>
                    )}
                    {Boolean(saving) && (
                      <p className="visually-hidden" role="status">
                        Saving…
                      </p>
                    )}
                  </div>
                  <ButtonGroup
                    actions={secondaryActions}
                    aria-label="Edit card actions"
                    variant="expandable"
                  >
                    <Button
                      appearance="primary"
                      aria-busy={saving}
                      aria-label={saving ? "Saving…" : "Save"}
                      disabled={invalid || saving}
                      iconOnly
                      onClick={editor.save}
                      title="Save"
                      type="button"
                    >
                      <Icon icon={Tick02Icon} />
                    </Button>
                  </ButtonGroup>
                </div>
              ) : (
                <>
                  <p className="visually-hidden" role="status">
                    {editor.notice}
                  </p>
                  {Boolean(navigationError) && <p role="alert">{navigationError}</p>}
                  <SearchFooter
                    actions={secondaryActions}
                    cards={resource.cards}
                    onSelect={(card) => openCard(card, true)}
                    onShuffle={() => openCard(resource.session.shuffle(catalogCard.id), false)}
                  />
                </>
              )}
            </footer>
          </div>
        </Scene>
      </AnimatePresence>
      <DiscardDialog
        onDiscard={discard}
        onStay={stay}
        open={editor.discarding || blocker.status === "blocked"}
        saving={saving}
      />
      <ConflictDialog
        current={editor.conflict}
        draft={draft}
        onClose={editor.closeConflict}
        onReplace={editor.replaceDraft}
        onUseSaved={editor.acceptSavedVersion}
        open={editor.showConflict}
      />
    </div>
  );
}
