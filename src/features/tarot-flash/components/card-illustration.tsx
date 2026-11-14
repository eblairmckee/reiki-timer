import { createElement, useEffect, useId, useState } from "react";
import { illustrations } from "../data/illustrations";
import {
  type Illustration,
  parseIllustration,
  type VectorShape,
} from "../services/illustration-svg";

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

export function CardIllustration({ catalogCardId }: { catalogCardId: string }) {
  const titleId = useId();
  const drawingId = useId();
  const source = illustrations[catalogCardId];
  const [artwork, setArtwork] = useState<{
    id: string;
    illustration?: Illustration;
    failed?: boolean;
  } | null>(null);
  useEffect(() => {
    if (!source) {
      return;
    }
    let current = true;
    source()
      .then((raw) => parseIllustration(raw))
      .then(
        (parsed) => {
          if (current) {
            setArtwork({ id: catalogCardId, illustration: parsed });
          }
        },
        () => {
          if (current) {
            setArtwork({ failed: true, id: catalogCardId });
          }
        }
      );
    return () => {
      current = false;
    };
  }, [catalogCardId, source]);
  const illustration = artwork?.id === catalogCardId ? artwork.illustration : undefined;
  if (!illustration) {
    return source ? <div aria-hidden="true" className="tarot-artwork" /> : null;
  }
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
