import { useEffect, useLayoutEffect, useRef } from "react";
import { Tag } from "@/components/design-system/tag";
import { Textarea } from "@/components/design-system/textarea";
import { FormField } from "@/components/molecules/form-field";
import { TagInput } from "@/components/molecules/tag-input";
import { correspondenceFields } from "../data/correspondences";
import { illustrations } from "../data/illustrations";
import type { CardContent, Orientation } from "../model/types";
import { CardIllustration } from "./card-illustration";
import { CorrespondenceSelect } from "./correspondence-select";
import { CorrespondenceValue } from "./correspondence-value";
import { StudyItem } from "./study-item";
import { StudySection } from "./study-section";
import "./card-fields.css";

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
            field={field}
            key={field}
            label={label}
            onReveal={() => onReveal(field)}
            populated={(content.correspondences[field]?.length ?? 0) > 0}
            revealed={revealed.has(field)}
          >
            <div className="tarot-selected-correspondences">
              {(content.correspondences[field] ?? []).map((value, index) => (
                <StudyItem className="tarot-correspondence-item" key={value} order={index}>
                  <CorrespondenceValue field={field} value={value} />
                </StudyItem>
              ))}
            </div>
          </StudySection>
        ))}
      </div>
      <StudySection
        field="keywords"
        label="Keywords"
        onReveal={() => onReveal("keywords")}
        populated={!!meaning?.keywords.length}
        revealed={revealed.has("keywords")}
      >
        <div className="tarot-keywords">
          {[...new Set(meaning?.keywords ?? [])].map((word, index) => (
            <StudyItem className="tarot-keyword" key={word} order={index}>
              <Tag>{word}</Tag>
            </StudyItem>
          ))}
        </div>
      </StudySection>
      <StudySection
        field="notes"
        label="Notes"
        onReveal={() => onReveal("notes")}
        populated={!!meaning?.notes}
        revealed={revealed.has("notes")}
      >
        <StudyItem className="tarot-notes-item">
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
  const notes = useRef<HTMLTextAreaElement>(null);
  const upright = orientation === "upright";
  const sharedDisabled = !upright || saving;
  // A growing textarea must stay above the persistent footer while the user types.
  useLayoutEffect(() => {
    if (meaning.notes && document.activeElement === notes.current) {
      notes.current?.scrollIntoView({ behavior: "instant", block: "nearest" });
    }
  }, [meaning.notes]);
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
      <fieldset className="tarot-shared-fields" disabled={sharedDisabled}>
        <legend className="visually-hidden">Shared card information</legend>
        <FormField className="tarot-field" controlId="tarot-other-names" label="Other names">
          {(field) => (
            <TagInput
              {...field}
              disabled={sharedDisabled}
              onValuesChange={(otherNames) => onChange({ ...content, otherNames })}
              values={content.otherNames}
            />
          )}
        </FormField>
        <div className="tarot-correspondences">
          {correspondenceFields.map(({ id: field }) => (
            <CorrespondenceSelect
              disabled={sharedDisabled}
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
      <FormField
        className="tarot-field"
        controlId={`tarot-${orientation}-keywords`}
        describedBy={upright && invalid ? "tarot-validation" : undefined}
        key={orientation}
        label="Keywords"
        requiredIndicator={upright ? "Required" : undefined}
      >
        {(field) => (
          <TagInput
            {...field}
            aria-invalid={upright && invalid}
            disabled={saving}
            onValuesChange={(keywords) => updateMeaning({ keywords })}
            options={keywordOptions}
            required={upright}
            values={meaning.keywords}
          />
        )}
      </FormField>
      <FormField className="tarot-field" controlId={`tarot-${orientation}-notes`} label="Notes">
        {(field) => (
          <Textarea
            {...field}
            disabled={saving}
            onChange={(event) => updateMeaning({ notes: event.target.value })}
            ref={notes}
            rows={1}
            value={meaning.notes}
          />
        )}
      </FormField>
    </div>
  );
}
