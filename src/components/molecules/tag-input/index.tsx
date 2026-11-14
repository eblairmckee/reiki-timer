import { type ComponentProps, type ReactNode, useRef, useState } from "react";
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

type QueryInputProps = Omit<
  ComponentProps<typeof ComboboxChipsInput>,
  | "aria-activedescendant"
  | "aria-controls"
  | "aria-expanded"
  | "checked"
  | "children"
  | "render"
  | "role"
  | "type"
  | "value"
>;

export interface TagInputProps extends QueryInputProps {
  /** Label for a typed tag that is absent from the suggestions. Defaults to “Add ‘{value}’”. */
  getCreateLabel?: (value: string) => string;
  /** Accessible name for the removal button. Defaults to “Remove {value}”. */
  getRemoveLabel?: (value: string) => string;
  /** Submit one entry per committed tag under this name. The query is never submitted. */
  name?: string;
  /** Requests one committed change for an add, a batch paste, or a removal. */
  onValuesChange: (values: string[]) => void;
  /** Suggested tags. Free entry works with or without suggestions. */
  options?: readonly string[];
  /** Replace an option's visible content. Always provide readable content describing the choice. */
  renderOption?: (option: { creating: boolean; label: string; value: string }) => ReactNode;
  /** Replace a chip's text with noninteractive content. The remove button is independent. */
  renderTag?: (value: string) => ReactNode;
  /** Require at least one committed tag for native form validation. */
  required?: boolean;
  /** Controlled committed tags. Rendered in this order and serialized under `name` when set. */
  values: readonly string[];
}

const keyFor = (value: string) => value.trim().toLowerCase();
const defaultRemoveLabel = (value: string) => `Remove ${value}`;
const defaultCreateLabel = (value: string) => `Add “${value}”`;

/** A controlled list of tags with a local query and suggestion popup. Associate a label or
 * supply an ARIA name for the query input. Its native props and ref target the text input.
 * Caller key and paste handlers run first and can prevent the tag action. Comma commits the
 * current query. Comma-separated paste replaces the selected range before committing the list.
 * Both append case-insensitively unique tags.
 * Ordinary typing and single-value paste stay in the query. Escape never clears committed tags. */
export function TagInput({
  values,
  options = [],
  onValuesChange,
  getRemoveLabel = defaultRemoveLabel,
  getCreateLabel = defaultCreateLabel,
  renderOption,
  renderTag = String,
  disabled,
  form,
  name,
  readOnly,
  required,
  onKeyDown,
  onPaste,
  ...inputProps
}: TagInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const known = new Map<string, string>();
  for (const value of [...values, ...options.map((option) => option.trim())]) {
    const key = keyFor(value);
    if (key && !known.has(key)) {
      known.set(key, value);
    }
  }
  const proposed = query.trim();
  const creating = proposed !== "" && !known.has(keyFor(proposed));
  const items = [...known.values()];
  if (creating) {
    items.push(proposed);
  }

  function commit(entries: readonly string[]) {
    const next = [...values];
    const keys = new Set(values.map(keyFor));
    for (const entry of entries) {
      const value = entry.trim();
      const key = keyFor(value);
      if (key && !keys.has(key)) {
        keys.add(key);
        next.push(value);
      }
    }
    if (next.length !== values.length) {
      onValuesChange(next);
    }
    setQuery("");
    setOpen(false);
  }

  return (
    <Combobox
      autoHighlight
      disabled={disabled}
      form={form}
      inputValue={query}
      items={items}
      multiple
      name={name}
      onInputValueChange={setQuery}
      onOpenChange={setOpen}
      onValueChange={(next, details) => {
        if (details.reason === "escape-key") {
          details.cancel();
          return;
        }
        if (
          details.reason === "item-press" &&
          details.event.type === "keydown" &&
          next.length < values.length &&
          values.some((value) => keyFor(value) === keyFor(query))
        ) {
          // Enter on an exact typed duplicate behaves like comma entry.
          details.cancel();
          setQuery("");
          setOpen(false);
          return;
        }
        onValuesChange(next);
        setQuery("");
      }}
      open={open}
      readOnly={readOnly}
      required={required}
      value={values}
    >
      <ComboboxChips ref={anchor}>
        {values.map((value) => (
          <ComboboxChip appearance="liquid" aria-label={value} key={value}>
            {renderTag(value)}
            <ComboboxChipRemove aria-label={getRemoveLabel(value)} />
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          {...inputProps}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.nativeEvent.isComposing) {
              event.preventBaseUIHandler();
              return;
            }
            if (event.baseUIHandlerPrevented || disabled || readOnly) {
              return;
            }
            const input = event.currentTarget;
            if (event.key === "," && !(event.altKey || event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              event.preventBaseUIHandler();
              commit([input.value]);
            } else if (
              event.key === "Enter" &&
              !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) &&
              input.value.trim() &&
              !input.hasAttribute("aria-activedescendant")
            ) {
              // A pasted or autofilled query can have no highlighted option.
              event.preventDefault();
              event.preventBaseUIHandler();
              commit([known.get(keyFor(input.value)) ?? input.value]);
            }
          }}
          onPaste={(event) => {
            onPaste?.(event);
            if (event.defaultPrevented || event.baseUIHandlerPrevented || disabled || readOnly) {
              return;
            }
            const text = event.clipboardData.getData("text");
            if (text.includes(",")) {
              event.preventDefault();
              const { selectionEnd, selectionStart, value } = event.currentTarget;
              const combined =
                value.slice(0, selectionStart ?? value.length) +
                text +
                value.slice(selectionEnd ?? value.length);
              commit(combined.split(","));
            }
          }}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor} hidden={items.length === 0}>
        <ComboboxList>
          {(item: string) => {
            const isNew = creating && item === proposed;
            const label = isNew ? getCreateLabel(item) : item;
            const content = renderOption
              ? renderOption({ creating: isNew, label, value: item })
              : label;
            return (
              <ComboboxItem key={item} value={item}>
                {content}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
