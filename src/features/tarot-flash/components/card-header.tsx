import type { Ref } from "react";
import { displayNumeral } from "../data/catalog";
import type { CatalogCard } from "../model/types";

import "./card-header.css";

export function CardHeader({
  catalogCard,
  otherNames,
  editing,
  titleRef,
}: {
  catalogCard: CatalogCard;
  otherNames: string[];
  editing: boolean;
  titleRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <header className="tarot-header">
      <div className="tarot-identity">
        <h1 data-ink="display" data-lettering="frosted" ref={titleRef} tabIndex={-1}>
          <span className="tarot-numeral">{displayNumeral(catalogCard)}</span>
          {catalogCard.defaultName}
        </h1>
        {!editing && otherNames.length > 0 && (
          <p className="tarot-other-names">
            <span className="visually-hidden">Other names: </span>
            {otherNames.join(", ")}
          </p>
        )}
      </div>
    </header>
  );
}
