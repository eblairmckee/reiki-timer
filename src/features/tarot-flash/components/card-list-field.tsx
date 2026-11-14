import { useRef, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
} from "@/components/design-system/combobox";

/** Card aliases and keywords share free entry, suggestions, and comma-delimited chips. */
export function CardListField({
  id,
  label,
  values,
  options,
  invalid,
  required,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  values: string[];
  options: string[];
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  onChange: (values: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  function commit(entries: string[]) {
    const next = [...values];
    for (const entry of entries) {
      const value = entry.trim();
      if (value && !next.some((item) => item.toLowerCase() === value.toLowerCase())) {
        next.push(value);
      }
    }
    onChange(next);
    setOpen(false);
  }
  const known = [...new Set([...options, ...values])].filter(Boolean);
  const proposed = query.trim();
  const creating =
    proposed.length > 0 && !known.some((value) => value.toLowerCase() === proposed.toLowerCase());
  const items = creating ? [...known, proposed] : known;
  return (
    <div className="tarot-field">
      <label data-ink="label" data-lettering="etched" htmlFor={id}>
        {label}
        {Boolean(required) && <small>Required</small>}
      </label>
      <Combobox
        autoHighlight
        disabled={disabled}
        inputValue={query}
        items={items}
        multiple
        onInputValueChange={setQuery}
        onOpenChange={setOpen}
        onValueChange={(next, details) => {
          // Escape dismisses suggestions/input without erasing committed card values.
          if (details.reason === "escape-key") {
            details.cancel();
            return;
          }
          onChange(next);
          setQuery("");
        }}
        open={open}
        value={values}
      >
        <ComboboxChips ref={anchor}>
          {values.map((value) => (
            <ComboboxChip appearance="liquid" aria-label={value} key={value}>
              {value}
              <ComboboxChipRemove aria-label={`Remove ${value}`} />
            </ComboboxChip>
          ))}
          <ComboboxChipsInput
            aria-describedby={invalid ? "tarot-validation" : undefined}
            aria-invalid={invalid}
            id={id}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) {
                return;
              }
              if (event.key === ",") {
                event.preventDefault();
                commit([query]);
                setQuery("");
                return;
              }
              // Autofill/paste can leave the list without a highlighted option.
              if (
                event.key === "Enter" &&
                creating &&
                !event.currentTarget.hasAttribute("aria-activedescendant")
              ) {
                event.preventDefault();
                onChange([...values, proposed]);
                setQuery("");
              }
            }}
            onPaste={(event) => {
              const text = event.clipboardData.getData("text");
              if (!text.includes(",")) {
                return;
              }
              event.preventDefault();
              const input = event.currentTarget;
              const combined =
                query.slice(0, input.selectionStart ?? query.length) +
                text +
                query.slice(input.selectionEnd ?? query.length);
              commit(combined.split(","));
              setQuery("");
            }}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor} hidden={items.length === 0}>
          <ComboboxList>
            {(item: string) => {
              const itemLabel = creating && item === proposed ? `Add “${item}”` : item;
              return (
                <ComboboxItem key={item} value={item}>
                  {itemLabel}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
