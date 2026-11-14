import {
  Cancel01Icon,
  Cards01Icon,
  ChessKnightIcon,
  ChessPawnIcon,
  ChessQueenIcon,
  CrownIcon,
  DrinkIcon,
  MagicWand01Icon,
  Search01Icon,
  ShuffleIcon,
  StarIcon,
  Sword01Icon,
} from "@hugeicons/core-free-icons";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { type ReactNode, type Ref, useEffect, useEffectEvent, useRef, useState } from "react";
import { Button } from "@/components/design-system/button";
import { ButtonGroup } from "@/components/design-system/button-group";
import { Icon } from "@/components/design-system/icon";
import { Input } from "@/components/design-system/input";
import { motion as systemMotion } from "@/components/design-system/shared/motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/design-system/toggle-group";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { catalog, displayNumeral, inCategory, rankNames } from "../data/catalog";
import { normalizeQuery, searchCards } from "../model/search";
import type { CatalogCard, Category, LibraryCard } from "../model/types";

import "./search-footer.css";

const filters = [
  { icon: MagicWand01Icon, id: "wands", label: "Wands" },
  { icon: DrinkIcon, id: "cups", label: "Cups" },
  { icon: Sword01Icon, id: "swords", label: "Swords" },
  { icon: StarIcon, id: "pentacles", label: "Pentacles" },
  { icon: Cards01Icon, id: "major", label: "Major Arcana" },
] as const;
const courts = [ChessPawnIcon, ChessKnightIcon, ChessQueenIcon, CrownIcon];
// A little more give than a disclosure: the search control travels, then its rows unfold.
const footerSpring = systemMotion.disclosure.pop;

function SearchRow({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      animate={{ height: "auto", opacity: 1 }}
      aria-hidden={present ? undefined : true}
      className="tarot-search-reveal"
      exit={{ height: 0, opacity: 0 }}
      inert={!present}
      initial={{ height: 0, opacity: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              ...footerSpring,
              delay: present ? delay : 0,
              opacity: { ...systemMotion.disclosure.fade, delay: present ? delay : 0 },
            }
      }
    >
      <motion.div
        animate={{ y: 0 }}
        className="tarot-search-row"
        exit={{ y: 10 }}
        initial={{ y: 16 }}
        transition={
          reducedMotion ? { duration: 0 } : { ...footerSpring, delay: present ? delay : 0 }
        }
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function RankChoices({
  cards,
  category,
  onSelect,
  ref,
}: {
  cards: readonly CatalogCard[];
  category: Category;
  onSelect: (card: CatalogCard) => void;
  ref?: Ref<HTMLDivElement>;
}) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      aria-hidden={present ? undefined : true}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      inert={!present}
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      ref={ref}
      style={{ originY: 1 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              ...footerSpring,
              opacity: systemMotion.disclosure.fade,
            }
      }
    >
      <ToggleGroup<string>
        aria-label={`${filters.find((entry) => entry.id === category)?.label} quick selection`}
        attached
        className="tarot-quick-row"
        onValueChange={(values) => {
          const card = cards.find((entry) => entry.id === values[0]);
          if (card) {
            onSelect(card);
          }
        }}
        value={[]}
      >
        {cards.map((card) => (
          <ToggleGroupItem
            aria-label={card.defaultName}
            className="tarot-rank"
            key={card.id}
            title={card.arcana === "minor" ? rankNames[card.rank - 1] : card.defaultName}
            type="button"
            value={card.id}
          >
            {card.arcana === "minor" && card.rank > 10 ? (
              <Icon icon={courts[card.rank - 11]} />
            ) : (
              displayNumeral(card)
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </motion.div>
  );
}

function SearchInputReveal({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1 }}
      aria-hidden={present ? undefined : true}
      className="tarot-search-input-reveal"
      exit={{ clipPath: "inset(0% 0% 0% 100% round 24px)", opacity: 0 }}
      inert={!present}
      initial={{ clipPath: "inset(0% 0% 0% 100% round 24px)", opacity: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              ...footerSpring,
              delay: present ? systemMotion.disclosure.stagger.content : 0,
              opacity: {
                ...systemMotion.disclosure.fade,
                delay: present ? systemMotion.disclosure.stagger.content : 0,
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

function searchFeedback(result: ReturnType<typeof searchCards>) {
  if (result.status === "incomplete") {
    return "Choose a rank or type a specific card name.";
  }
  if (result.status === "none") {
    return "No matching cards. Try another name or clear the filter.";
  }
  if (result.status === "matches") {
    return `${result.suggestions.length} matching ${result.suggestions.length === 1 ? "name" : "names"}. Enter opens ${result.suggestions[0].label}.`;
  }
  return "";
}

function SearchInput({
  query,
  onQueryChange,
  suggestion,
  ref,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  suggestion: ReturnType<typeof searchCards>["suggestions"][number] | undefined;
  ref: React.RefObject<HTMLInputElement | null>;
}) {
  const typed = query.trimStart();
  const prefix = suggestion && normalizeQuery(suggestion.label).startsWith(normalizeQuery(typed));
  return (
    <div className="tarot-autocomplete">
      {suggestion !== undefined && (
        <div aria-hidden="true" className="tarot-completion">
          <span className="tarot-completion-typed">{query}</span>
          <span>
            {prefix
              ? suggestion.label.slice(normalizeQuery(typed).length)
              : ` → ${suggestion.label}`}
          </span>
        </div>
      )}
      <Input
        appearance="frost"
        aria-autocomplete="inline"
        aria-describedby="tarot-search-feedback"
        aria-label="Search cards"
        autoComplete="off"
        className="tarot-search-input"
        enterKeyHint="search"
        id="tarot-search"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Name, number, or suit…"
        ref={ref}
        type="search"
        value={query}
      />
      {query.length > 0 && (
        <Button
          appearance="ghost"
          aria-label="Clear search"
          className="tarot-search-clear"
          iconOnly
          onClick={() => {
            onQueryChange("");
            ref.current?.focus();
          }}
          title="Clear search"
          type="button"
        >
          <Icon color="currentColor" icon={Cancel01Icon} size={18} />
        </Button>
      )}
    </div>
  );
}

function SearchMatches({
  suggestions,
  onSelect,
}: {
  suggestions: ReturnType<typeof searchCards>["suggestions"];
  onSelect: (card: CatalogCard) => void;
}) {
  return (
    <fieldset aria-label="Matching names" className="tarot-match-row">
      {suggestions.map((match) => (
        <Button
          appearance="liquid"
          aria-label={match.label}
          className="tarot-match"
          key={match.id}
          onClick={() => {
            const card = catalog.find((entry) => entry.id === match.catalogCardId);
            if (card) {
              onSelect(card);
            }
          }}
          title={match.label}
          type="button"
        >
          <span className="tarot-match-label">{match.label}</span>
        </Button>
      ))}
    </fieldset>
  );
}

function SearchTrigger({
  open,
  canSubmit,
  onOpen,
  ref,
}: {
  open: boolean;
  canSubmit: boolean;
  onOpen: () => void;
  ref: Ref<HTMLButtonElement>;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="tarot-search-trigger"
      layout="position"
      transition={reducedMotion ? { duration: 0 } : footerSpring}
    >
      <Button
        appearance={open ? "primary" : "secondary"}
        aria-label={open ? "Open suggested card" : "Search cards"}
        disabled={open && !canSubmit}
        iconOnly
        onClick={(event) => {
          if (!open) {
            event.preventDefault();
            onOpen();
          }
        }}
        ref={ref}
        type={open ? "submit" : "button"}
      >
        <Icon icon={Search01Icon} />
      </Button>
    </motion.div>
  );
}

export function SearchFooter({
  actions,
  cards,
  onSelect,
  onShuffle,
  onOpenChange,
}: {
  /** Secondary card controls beside Shuffle, concealed while search occupies the footer. */
  actions?: ReactNode;
  cards: readonly LibraryCard[];
  onSelect: (card: CatalogCard) => void;
  onShuffle: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const present = useIsPresent();
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Category | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLFormElement>(null);
  const result = searchCards(query, filter, cards);
  const [suggestion] = result.suggestions;
  const quickCards =
    filter && filter !== "major" ? catalog.filter((card) => inCategory(card, filter)) : [];
  const dismissSearch = useEffectEvent((restoreFocus: boolean) => toggle(false, restoreFocus));
  useEffect(() => {
    if (!(open && present)) {
      return;
    }
    input.current?.focus();
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissSearch(true);
      }
    }
    function dismissOutside(event: PointerEvent | FocusEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        dismissSearch(false);
      }
    }
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [open, present]);
  function toggle(next: boolean, restoreFocus = false) {
    setOpen(next);
    onOpenChange?.(next);
    if (!next) {
      setQuery("");
      setFilter(null);
    }
    if (restoreFocus) {
      requestAnimationFrame(() => trigger.current?.focus());
    }
  }
  function select(card: CatalogCard) {
    toggle(false);
    onSelect(card);
  }
  function submit() {
    if (!suggestion) {
      return;
    }
    const card = catalog.find((entry) => entry.id === suggestion.catalogCardId);
    if (card) {
      select(card);
    }
  }
  const feedback = searchFeedback(result);
  return (
    <form
      aria-label={open ? "Find a tarot card" : undefined}
      className="tarot-search-form"
      data-searching={open}
      onSubmit={(event) => {
        event.preventDefault();
        if (open) {
          submit();
        }
      }}
      ref={root}
    >
      <AnimatePresence initial={false}>
        {open && filter !== null && quickCards.length > 0 && (
          <SearchRow key="ranks">
            <div className="tarot-rank-reveal">
              <AnimatePresence initial={false} mode="popLayout">
                <RankChoices cards={quickCards} category={filter} key={filter} onSelect={select} />
              </AnimatePresence>
            </div>
          </SearchRow>
        )}
        {open && Boolean(feedback) && result.status !== "matches" && (
          <SearchRow key="feedback">
            <p aria-hidden="true" className="tarot-search-feedback">
              {feedback}
            </p>
          </SearchRow>
        )}
        {open && result.suggestions.length > 1 && (
          <SearchRow key="matches">
            <SearchMatches onSelect={select} suggestions={result.suggestions} />
          </SearchRow>
        )}
        {Boolean(open) && (
          <SearchRow delay={systemMotion.disclosure.stagger.group} key="filters">
            <ToggleGroup<Category>
              aria-label="Filter cards"
              attached
              className="tarot-filter-row"
              onValueChange={(values) => setFilter(values[0] ?? null)}
              value={filter ? [filter] : []}
            >
              {filters.map((entry) => (
                <ToggleGroupItem
                  aria-label={entry.label}
                  key={entry.id}
                  title={entry.label}
                  type="button"
                  value={entry.id}
                >
                  <Icon icon={entry.icon} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </SearchRow>
        )}
      </AnimatePresence>
      <p className="visually-hidden" id="tarot-search-feedback" role="status">
        {open ? feedback : ""}
      </p>
      <div className="tarot-search-entry">
        <AnimatePresence initial={false}>
          {Boolean(open) && (
            <SearchInputReveal key="input">
              <SearchInput
                onQueryChange={setQuery}
                query={query}
                ref={input}
                suggestion={suggestion}
              />
            </SearchInputReveal>
          )}
        </AnimatePresence>
        <SearchTrigger
          canSubmit={Boolean(suggestion)}
          onOpen={() => toggle(true)}
          open={open}
          ref={trigger}
        />
        <motion.div
          animate={{ opacity: open ? 0 : 1, scale: open ? 0.7 : 1 }}
          aria-hidden={open ? true : undefined}
          className="tarot-card-actions"
          inert={open}
          initial={false}
          style={{ originX: 1 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  ...footerSpring,
                  delay: open ? 0 : systemMotion.disclosure.stagger.content,
                  opacity: {
                    ...systemMotion.disclosure.fade,
                    delay: open ? 0 : systemMotion.disclosure.stagger.content,
                  },
                }
          }
        >
          <ButtonGroup actions={actions} aria-label="Card actions" variant="expandable">
            <Button
              appearance="primary"
              aria-label="Shuffle"
              disabled={open}
              iconOnly
              onClick={onShuffle}
              title="Shuffle"
              type="button"
            >
              <Icon icon={ShuffleIcon} />
            </Button>
          </ButtonGroup>
        </motion.div>
      </div>
    </form>
  );
}
