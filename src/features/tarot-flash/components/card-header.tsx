import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Edit03Icon,
} from "@hugeicons/core-free-icons";
import type { Ref } from "react";
import { Button } from "@/components/design-system/button";
import { Icon } from "@/components/design-system/icon";
import { displayNumeral } from "../data/catalog";
import type { CatalogCard, Orientation } from "../model/types";

export function CardHeader({
  catalogCard,
  otherNames,
  orientation,
  editing,
  saving,
  onEdit,
  onReverse,
  titleRef,
  editRef,
}: {
  catalogCard: CatalogCard;
  otherNames: string[];
  orientation: Orientation;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onReverse: () => void;
  titleRef: Ref<HTMLHeadingElement>;
  editRef: Ref<HTMLButtonElement>;
}) {
  return (
    <header className="tarot-header">
      <div className="tarot-heading-row">
        <Button
          appearance="secondary"
          aria-label={editing ? "Close editor" : "Edit"}
          disabled={saving}
          iconOnly
          onClick={onEdit}
          ref={editRef}
          title={editing ? "Close editor" : "Edit"}
          type="button"
        >
          <Icon icon={editing ? Cancel01Icon : Edit03Icon} />
        </Button>
        <div className="tarot-identity">
          <h1 data-ink="display" data-lettering="frosted" ref={titleRef} tabIndex={-1}>
            <span className="tarot-numeral">{displayNumeral(catalogCard)}</span>
            {catalogCard.defaultName}
          </h1>
          {!editing && otherNames.length > 0 && (
            <p className="tarot-other-names">
              <span className="tarot-sr-only">Other names: </span>
              {otherNames.join(", ")}
            </p>
          )}
        </div>
        <div className="tarot-header-actions">
          <Button
            aria-label="Reverse card"
            aria-pressed={orientation === "reversed"}
            className="tarot-reverse"
            iconOnly
            onClick={onReverse}
            title={orientation === "upright" ? "Show reversed meaning" : "Show upright meaning"}
            type="button"
          >
            <span className="tarot-reverse-icon" data-reversed={orientation === "reversed"}>
              <Icon icon={orientation === "upright" ? ArrowUp01Icon : ArrowDown01Icon} />
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
