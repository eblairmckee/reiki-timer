import { RefreshIcon } from "@hugeicons/core-free-icons";
import { type CSSProperties, useId, useState } from "react";
import { Atmosphere } from "@/components/design-system/atmosphere";
import { Button } from "@/components/design-system/button";
import { Icon } from "@/components/design-system/icon";
import { chakraPalettes } from "@/features/timer/data/chakra-palettes";
import { chakras } from "@/features/timer/data/chakras";
import manifest from "../../../../docs/tarot-flash/artwork/manifest.json";
import { CardIllustration } from "../components/card-illustration";
import { tarotPalette } from "../data/appearance";
import { catalog } from "../data/catalog";
import "./style.css";
import "./artwork-review.css";

const backgrounds = [tarotPalette, ...chakraPalettes];
const shortHex = /^#(?<red>[\da-f])(?<green>[\da-f])(?<blue>[\da-f])$/iu;
const fillStudies = new Set(["major-02", "major-09", "major-16", "wands-08"]);
const defaults = {
  glow: 0,
  opacity: 0.7,
  primary: 0.65,
  secondary: 0.2,
  size: 210,
  width: 2.25,
};
type CustomStyle = CSSProperties & Record<`--${string}`, string | number>;

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <label className="artwork-review-control" htmlFor={id}>
      <span>
        {label}
        <output htmlFor={id}>{Number(value.toFixed(2))}</output>
      </span>
      <input
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}

function SourceReference({ id }: { id: string }) {
  const source = Object.entries(manifest.cards).find(([key]) => key === id)?.[1];
  const sheet = Object.entries(manifest.sheets).find(([key]) => key === source?.sheetId)?.[1];
  if (!(source && sheet)) {
    return null;
  }
  return (
    <div className="artwork-review-reference">
      <img
        alt={`${source.name} source reference`}
        height={sheet.height}
        loading="lazy"
        src={`/docs/tarot-flash/artwork/${sheet.file}`}
        style={{
          height: `${sheet.rows * 100}%`,
          left: `${source.cell.column * -100}%`,
          top: `${source.cell.row * -100}%`,
          width: `${sheet.columns * 100}%`,
        }}
        width={sheet.width}
      />
    </div>
  );
}

/** Development gallery: live application rendering with local preview controls only. */
export function ArtworkReview() {
  const [family, setFamily] = useState("");
  const [display, setDisplay] = useState("svg");
  const [background, setBackground] = useState(0);
  const [ink, setInk] = useState<string | null>(null);
  const [settings, setSettings] = useState(defaults);
  const cards = catalog.filter(
    (card) =>
      !family ||
      (family === "studies" && fillStudies.has(card.id)) ||
      card.id === family ||
      card.arcana === family ||
      (card.arcana === "minor" && card.suit === family)
  );
  function adjust(key: keyof typeof defaults, value: number) {
    setSettings((current) => ({ ...current, [key]: value }));
  }
  function reset() {
    setSettings(defaults);
    setBackground(0);
    setInk(null);
  }
  const style: CustomStyle = {
    "--review-card-size": `${settings.size}px`,
    "--tarot-edge-glow": `${settings.glow}px`,
    "--tarot-primary-fill-opacity": settings.primary,
    "--tarot-secondary-fill-opacity": settings.secondary,
    "--tarot-stroke-opacity": settings.opacity,
    "--tarot-stroke-width": settings.width,
    ...(ink
      ? {
          "--cmp-color-tarot-illustration-fill": ink,
          "--tarot-ink": ink,
        }
      : {}),
  };
  return (
    <Atmosphere palette={backgrounds[background]} transitionSeconds={0}>
      <div className="tarot-shell artwork-review" style={style}>
        <header className="artwork-review-toolbar">
          <div className="artwork-review-heading">
            <h1>
              Illustration playground{" "}
              <span>
                {cards.length} {cards.length === 1 ? "card" : "cards"}
              </span>
            </h1>
            <Button
              appearance="secondary"
              aria-label="Reset preview"
              iconOnly
              onClick={reset}
              title="Reset preview"
            >
              <Icon icon={RefreshIcon} />
            </Button>
          </div>
          <div className="artwork-review-controls">
            <label className="artwork-review-control">
              View cards
              <select onChange={(event) => setFamily(event.currentTarget.value)} value={family}>
                <option value="">All 78 cards</option>
                <option value="studies">Fill studies</option>
                <optgroup label="By suit">
                  <option value="major">Major Arcana</option>
                  {["wands", "cups", "swords", "pentacles"].map((suit) => (
                    <option key={suit} value={suit}>
                      {suit[0].toUpperCase()}
                      {suit.slice(1)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Individual cards">
                  {catalog.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.deckIndex}. {card.defaultName}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label className="artwork-review-control">
              Display
              <select onChange={(event) => setDisplay(event.currentTarget.value)} value={display}>
                <option value="svg">SVG gallery</option>
                <option value="compare">Compare with source</option>
              </select>
            </label>
            <label className="artwork-review-control">
              Background
              <select
                onChange={(event) => setBackground(Number(event.currentTarget.value))}
                value={background}
              >
                <option value={0}>Tarot atmosphere</option>
                {chakras.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="artwork-review-control">
              Stroke color
              <input
                aria-label="Stroke color"
                onChange={(event) => setInk(event.currentTarget.value)}
                onInput={(event) => setInk(event.currentTarget.value)}
                type="color"
                value={
                  ink ??
                  getComputedStyle(document.documentElement)
                    .getPropertyValue("--ref-color-paper")
                    .trim()
                    .replace(shortHex, "#$<red>$<red>$<green>$<green>$<blue>$<blue>")
                }
              />
            </label>
            <RangeControl
              label="Stroke width"
              max={3.5}
              min={0.5}
              onChange={(value) => adjust("width", value)}
              step={0.25}
              value={settings.width}
            />
            <RangeControl
              label="Stroke opacity"
              max={1}
              min={0.1}
              onChange={(value) => adjust("opacity", value)}
              step={0.05}
              value={settings.opacity}
            />
            <RangeControl
              label="Edge glow"
              max={3}
              min={0}
              onChange={(value) => adjust("glow", value)}
              step={0.1}
              value={settings.glow}
            />
            <RangeControl
              label="Primary fill"
              max={1}
              min={0}
              onChange={(value) => adjust("primary", value)}
              step={0.05}
              value={settings.primary}
            />
            <RangeControl
              label="Secondary fill"
              max={1}
              min={0}
              onChange={(value) => adjust("secondary", value)}
              step={0.02}
              value={settings.secondary}
            />
            <RangeControl
              label="Card size"
              max={420}
              min={140}
              onChange={(value) => adjust("size", value)}
              step={10}
              value={settings.size}
            />
          </div>
        </header>
        <main
          aria-label="Editable SVG gallery"
          className="artwork-review-grid"
          data-compare={display === "compare"}
          data-single={cards.length === 1}
        >
          {cards.map((card) => (
            <figure key={card.id}>
              <div className="artwork-review-pair">
                <CardIllustration catalogCardId={card.id} />
                {display === "compare" && <SourceReference id={card.id} />}
              </div>
              <figcaption>
                <a href={`/tarot-flash/${card.deckIndex}`}>
                  {card.deckIndex}. {card.defaultName}
                </a>
                <a
                  aria-label={`Open ${card.defaultName} SVG file`}
                  href={`/src/features/tarot-flash/assets/illustrations/${card.id}.svg`}
                >
                  SVG
                </a>
              </figcaption>
            </figure>
          ))}
        </main>
      </div>
    </Atmosphere>
  );
}
