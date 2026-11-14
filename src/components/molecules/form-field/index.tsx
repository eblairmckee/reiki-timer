import { type ComponentPropsWithRef, type ReactNode, useId } from "react";

type ControlAttributes = Pick<
  ComponentPropsWithRef<"input">,
  "aria-describedby" | "aria-labelledby"
> & { id: string };

interface LabelSlotProps {
  children: ReactNode;
  htmlFor: string;
  id: string;
}

interface DescriptionSlotProps {
  children: ReactNode;
  id: string;
}

export interface FormFieldProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** Spread the supplied attributes on the focusable control. With an authored node,
   * the caller owns its id and any ARIA associations the control needs. */
  children: ReactNode | ((attributes: ControlAttributes) => ReactNode);
  /** Id for the associated control. Defaults to a stable id scoped to this field. */
  controlId?: string;
  /** Additional description ids (space-separated), such as an external validation error. */
  describedBy?: string;
  /** Supporting content associated with the control. Omit it or pass null to hide it. */
  description?: ReactNode;
  /** Accessible label content. With no label, supply an accessible name on the control. */
  label?: ReactNode;
  /** Replace the default description. Keep its id on the element containing its content. */
  renderDescription?: (props: DescriptionSlotProps) => ReactNode;
  /** Replace the native label. Keep its id and its association with the control. */
  renderLabel?: (props: LabelSlotProps) => ReactNode;
  /** Optional phrasing content for the visual marker. Set required semantics on the control. */
  requiredIndicator?: ReactNode;
}

/** One labeled field, with value, validation, and actions owned by the caller.
 * The copy and control wrappers expose `data-slot="copy"` and `data-slot="control"`
 * for layout. The default label, description, and required marker expose their named slots. */
export function FormField({
  children,
  controlId,
  describedBy,
  description,
  label,
  renderDescription,
  renderLabel,
  requiredIndicator,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const id = controlId ?? generatedId;
  const labelId = hasContent(label) ? `${id}-label` : undefined;
  const descriptionId = hasContent(description) ? `${id}-description` : undefined;
  const attributes: ControlAttributes = {
    "aria-describedby": [descriptionId, describedBy].filter(Boolean).join(" ") || undefined,
    "aria-labelledby": labelId,
    id,
  };
  const control = typeof children === "function" ? children(attributes) : children;

  return (
    <div {...props}>
      {Boolean(labelId || descriptionId) && (
        <div data-slot="copy">
          {labelId !== undefined &&
            (renderLabel ?? defaultLabel)({
              children: (
                <>
                  {label}
                  {hasContent(requiredIndicator) && (
                    <small aria-hidden="true" data-slot="required">
                      {requiredIndicator}
                    </small>
                  )}
                </>
              ),
              htmlFor: id,
              id: labelId,
            })}
          {descriptionId !== undefined &&
            (renderDescription ?? defaultDescription)({ children: description, id: descriptionId })}
        </div>
      )}
      <div data-slot="control">{control}</div>
    </div>
  );
}

function hasContent(content: ReactNode) {
  return (
    content !== null && content !== undefined && typeof content !== "boolean" && content !== ""
  );
}

function defaultLabel({ children, htmlFor, id }: LabelSlotProps) {
  return (
    <label data-ink="label" data-lettering="etched" data-slot="label" htmlFor={htmlFor} id={id}>
      {children}
    </label>
  );
}

function defaultDescription(props: DescriptionSlotProps) {
  return <div data-ink="detail" data-slot="description" {...props} />;
}
