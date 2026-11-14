import { FormField, type FormFieldProps } from "@/components/molecules/form-field";

interface FieldProps extends Pick<FormFieldProps, "children" | "description" | "label"> {
  /** Reserve clearance for an orbiting dial value in this feature's layout. */
  dialLayout?: boolean;
  id: string;
  related?: boolean;
}

export function Field({ id, label, description, children, related, dialLayout }: FieldProps) {
  return (
    <FormField
      className="timer-field"
      controlId={id}
      data-dial-layout={dialLayout || undefined}
      data-related={related || undefined}
      description={description}
      label={label}
    >
      {children}
    </FormField>
  );
}
