import { createElement, useEffect, useId, useState } from "react";
import { catalog } from "../data/catalog";
import { illustrations } from "../data/illustrations";
import {
  type Illustration,
  parseIllustration,
  type VectorShape,
} from "../services/illustration-svg";

import "./card-illustration.css";

function VectorNode({ shape }: { shape: VectorShape }) {
  if (!shape.outline) {
    return null;
  }
  return createElement(
    shape.tag,
    shape.attributes,
    shape.children.map((child) => <VectorNode key={child.key} shape={child} />)
  );
}

function FillNode({
  shape,
  role,
  target,
}: {
  shape: VectorShape;
  role?: VectorShape["fillRole"];
  target: "primary" | "secondary";
}) {
  const fillRole = shape.fillRole ?? role;
  if (shape.tag === "g") {
    return (
      <g {...shape.attributes}>
        {shape.children.map((child) => (
          <FillNode key={child.key} role={fillRole} shape={child} target={target} />
        ))}
      </g>
    );
  }
  return fillRole === target ? createElement(shape.tag, shape.attributes) : null;
}

type ArtworkState =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; illustration: Illustration };

function CardArtwork({ cardName, source }: { cardName: string; source: () => Promise<string> }) {
  const titleId = useId();
  const drawingId = useId();
  const [artwork, setArtwork] = useState<ArtworkState>({ status: "loading" });
  useEffect(() => {
    let current = true;
    source()
      .then(parseIllustration)
      .then(
        (parsed) => {
          if (current) {
            setArtwork({ illustration: parsed, status: "ready" });
          }
        },
        () => {
          if (current) {
            setArtwork({ status: "failed" });
          }
        }
      );
    return () => {
      current = false;
    };
  }, [source]);
  if (artwork.status !== "ready") {
    return (
      <p className="tarot-artwork tarot-artwork-status" role="status">
        {artwork.status === "loading"
          ? `Loading illustration for ${cardName}…`
          : `Illustration unavailable for ${cardName}.`}
      </p>
    );
  }
  const { illustration } = artwork;
  return (
    <svg
      aria-labelledby={titleId}
      className="tarot-artwork"
      role="img"
      viewBox={illustration.viewBox}
    >
      <title id={titleId}>{illustration.description}</title>
      <defs>
        <g fill="none" id={drawingId} strokeLinecap="round" strokeLinejoin="round">
          {illustration.shapes.map((shape) => (
            <VectorNode key={shape.key} shape={shape} />
          ))}
        </g>
      </defs>
      {(["secondary", "primary"] as const).map((role) => (
        <g className="tarot-artwork-fills" data-fill={role} key={role} stroke="none">
          {illustration.shapes.map((shape) => (
            <FillNode key={shape.key} shape={shape} target={role} />
          ))}
        </g>
      ))}
      <use className="tarot-artwork-ink" href={`#${drawingId}`} />
    </svg>
  );
}

export function CardIllustration({ catalogCardId }: { catalogCardId: string }) {
  const card = catalog.find(({ id }) => id === catalogCardId);
  const source = card && illustrations[card.id];
  return card && source ? (
    <CardArtwork cardName={card.defaultName} key={card.id} source={source} />
  ) : null;
}
