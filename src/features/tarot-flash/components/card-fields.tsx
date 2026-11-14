import { useEffect, useRef } from "react";
import { correspondenceFields } from "../data/correspondences";
import { illustrations } from "../data/illustrations";
import type { CardContent, Orientation } from "../model/types";
import { CardIllustration } from "./card-illustration";
import { CardListField } from "./card-list-field";
import { CorrespondenceSelect } from "./correspondence-select";
import { CorrespondenceValue } from "./correspondence-value";
import { StudyItem } from "./study-item";
import { StudySection } from "./study-section";

export type Reveals = ReadonlySet<string>;
interface SharedProps {
  catalogCardId: string;
  content: CardContent;
  orientation: Orientation;
}
export function StudyFields({
  content,
  orientation,
  catalogCardId,
  revealed,
  onReveal,
}: SharedProps & { revealed: Reveals; onReveal: (id: string) => void }) {
  const meaning = content.meanings[orientation];
  const hasArtwork = !!illustrations[catalogCardId];
  return (
    <>
      {hasArtwork && <CardIllustration catalogCardId={catalogCardId} />}
      <div className="tarot-correspondences">
        {correspondenceFields.map(({ id: field, label }) => (
          <StudySection
            key={field}
            label={label}
            onReveal={() => onReveal(field)}
            populated={(content.correspondences[field]?.length ?? 0) > 0}
            revealed={revealed.has(field)}
          >
            <div className="tarot-selected-correspondences">
              {(content.correspondences[field] ?? []).map((value) => (
                <StudyItem className="tarot-correspondence-item" field={field} key={value}>
                  <CorrespondenceValue field={field} value={value} />
                </StudyItem>
              ))}
            </div>
          </StudySection>
        ))}
      </div>
      <StudySection
        label="Keywords"
        onReveal={() => onReveal("keywords")}
        populated={!!meaning?.keywords.length}
        revealed={revealed.has("keywords")}
      >
        <div className="tarot-keywords">
          {[...new Set(meaning?.keywords ?? [])].map((word) => (
            <StudyItem className="tarot-keyword" field="keywords" key={word}>
              {word}
            </StudyItem>
          ))}
        </div>
      </StudySection>
      <StudySection
        label="Notes"
        onReveal={() => onReveal("notes")}
        populated={!!meaning?.notes}
        revealed={revealed.has("notes")}
      >
        <StudyItem className="tarot-notes-item" field="notes">
          <span className="tarot-prose">{meaning?.notes}</span>
        </StudyItem>
      </StudySection>
    </>
  );
}

export function EditorFields({
  content,
  orientation,
  onChange,
  invalid,
  saving,
  keywordOptions,
  focusKeyword,
}: Omit<SharedProps, "catalogCardId"> & {
  onChange: (content: CardContent) => void;
  invalid: boolean;
  saving: boolean;
  keywordOptions: string[];
  focusKeyword: number;
}) {
  const fields = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const field = fields.current?.querySelector<HTMLInputElement>(
        focusKeyword ? "#tarot-upright-keywords" : "input:not(:disabled)"
      );
      field?.focus({ preventScroll: true });
      field?.scrollIntoView({ behavior: "instant", block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusKeyword]);
  const meaning = content.meanings[orientation] ?? { keywords: [], notes: "" };
  function updateMeaning(next: Partial<typeof meaning>) {
    onChange({
      ...content,
      meanings: {
        ...content.meanings,
        [orientation]: { ...meaning, ...next },
      },
    });
  }
  return (
    <div className="tarot-editor-fields" ref={fields}>
      <fieldset className="tarot-shared-fields" disabled={orientation === "reversed" || saving}>
        <legend className="tarot-sr-only">Shared card information</legend>
        <CardListField
          disabled={orientation === "reversed" || saving}
          id="tarot-other-names"
          invalid={false}
          label="Other names"
          onChange={(otherNames) => onChange({ ...content, otherNames })}
          options={[]}
          required={false}
          values={content.otherNames}
        />
        <div className="tarot-correspondences">
          {correspondenceFields.map(({ id: field }) => (
            <CorrespondenceSelect
              disabled={orientation === "reversed" || saving}
              field={field}
              key={field}
              onChange={(values) =>
                onChange({
                  ...content,
                  correspondences: {
                    ...content.correspondences,
                    [field]: values,
                  },
                })
              }
              values={content.correspondences[field] ?? []}
            />
          ))}
        </div>
      </fieldset>
      <CardListField
        disabled={saving}
        id={`tarot-${orientation}-keywords`}
        invalid={orientation === "upright" && invalid}
        key={orientation}
        label="Keywords"
        onChange={(keywords) => updateMeaning({ keywords })}
        options={keywordOptions}
        required={orientation === "upright"}
        values={meaning.keywords}
      />
      <label className="tarot-field" htmlFor={`tarot-${orientation}-notes`}>
        <span data-ink="label" data-lettering="etched">
          Notes
        </span>
        <textarea
          disabled={saving}
          id={`tarot-${orientation}-notes`}
          onChange={(event) => updateMeaning({ notes: event.target.value })}
          rows={6}
          value={meaning.notes}
        />
      </label>
    </div>
  );
}
