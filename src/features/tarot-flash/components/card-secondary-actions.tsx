import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Edit03Icon,
} from "@hugeicons/core-free-icons";
import type { Ref } from "react";
import { Button } from "@/components/design-system/button";
import { ButtonGroupSeparator } from "@/components/design-system/button-group";
import { Icon } from "@/components/design-system/icon";
import type { Orientation } from "../model/types";

import "./card-secondary-actions.css";

/** Secondary controls shared by the study and editor footer groups. */
export function CardSecondaryActions({
  editing,
  disabled,
  orientation,
  onEdit,
  onReverse,
  editRef,
}: {
  editing: boolean;
  disabled: boolean;
  orientation: Orientation;
  onEdit: () => void;
  onReverse: () => void;
  editRef: Ref<HTMLButtonElement>;
}) {
  return (
    <>
      <Button
        appearance="secondary"
        aria-label={editing ? "Close editor" : "Edit"}
        disabled={disabled}
        iconOnly
        onClick={onEdit}
        ref={editRef}
        title={editing ? "Close editor" : "Edit"}
        type="button"
      >
        <Icon icon={editing ? Cancel01Icon : Edit03Icon} />
      </Button>
      <ButtonGroupSeparator aria-hidden="true" />
      <Button
        appearance="secondary"
        aria-label="Reverse card"
        aria-pressed={orientation === "reversed"}
        disabled={disabled}
        iconOnly
        onClick={onReverse}
        title={orientation === "upright" ? "Show reversed meaning" : "Show upright meaning"}
        type="button"
      >
        <span className="tarot-reverse-icon" data-reversed={orientation === "reversed"}>
          <Icon icon={orientation === "upright" ? ArrowUp01Icon : ArrowDown01Icon} />
        </span>
      </Button>
    </>
  );
}
