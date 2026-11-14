import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/design-system/select";
import { correspondenceFields } from "../data/correspondences";
import { CorrespondenceValue } from "./correspondence-value";

export function CorrespondenceSelect({
  field,
  values,
  disabled,
  onChange,
}: {
  field: (typeof correspondenceFields)[number]["id"];
  values: string[];
  disabled: boolean;
  onChange: (values: string[]) => void;
}) {
  const id = `tarot-${field}`;
  const definition = correspondenceFields.find((entry) => entry.id === field);
  if (!definition) {
    return null;
  }
  // Older free-text selections remain visible/removable; new choices use the fixed catalog.
  const options = [...new Set([...definition.choices, ...values])];
  return (
    <div className="tarot-field">
      <label data-ink="label" data-lettering="etched" htmlFor={id} id={`${id}-label`}>
        {definition.label}
      </label>
      <Select disabled={disabled} multiple onValueChange={onChange} value={values}>
        <SelectTrigger aria-labelledby={`${id}-label`} id={id}>
          <SelectValue>
            <span className="tarot-selected-correspondences">
              {values.map((value) => (
                <CorrespondenceValue field={field} iconOnly key={value} value={value} />
              ))}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((value) => (
            <SelectItem key={value} value={value}>
              <CorrespondenceValue field={field} value={value} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
