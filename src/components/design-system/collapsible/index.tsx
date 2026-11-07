"use client";

import "./style.css";
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import { type ComponentPropsWithRef, useCallback } from "react";

/** Base UI disclosure root accepting trigger/panel children. Controlled/uncontrolled state,
 * onOpenChange timing and cancellation, native props and refs retain Base UI semantics.
 *
 * A Switch may control a panel without CollapsibleTrigger. The caller owns the shared state,
 * switch name/description, unique panel ID and aria-controls relationship. A switch exposes
 * aria-checked; do not add trigger-style aria-expanded. Before an external update closes a
 * panel containing focus, the caller must move focus to the switch or another visible control.
 * CollapsiblePanel makes closed content inert during exit; it does not restore caller focus.
 *
 * @example
 * ```tsx
 * const [enabled, setEnabled] = useState(false);
 * const id = useId();
 * <Collapsible open={enabled}>
 *   <label htmlFor={`${id}-switch`}>Enable reminders</label>
 *   <Switch
 *     id={`${id}-switch`}
 *     checked={enabled}
 *     onCheckedChange={setEnabled}
 *     aria-controls={enabled ? `${id}-panel` : undefined}
 *     aria-describedby={`${id}-description`}
 *   />
 *   <p id={`${id}-description`}>Choose when to receive a reminder.</p>
 *   <CollapsiblePanel id={`${id}-panel`}>{reminderSettings}</CollapsiblePanel>
 * </Collapsible>
 * ```
 */
function Collapsible(props: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-ui="collapsible" {...props} />;
}

/** Interactive disclosure trigger accepting text/icons; provide visible text or an ARIA name.
 * Each supported activation requests a state change through Base UI. */
function CollapsibleTrigger({ children, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props}>
      {children}
    </CollapsiblePrimitive.Trigger>
  );
}

/** Informational disclosure panel accepting caller-owned content; Base UI manages its relationship
 * to the trigger and hidden state. Native props and refs pass through. */
function CollapsiblePanel({
  render,
  hiddenUntilFound,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  const renderPanel = useCallback(
    (elementProps: ComponentPropsWithRef<"div">, state: CollapsiblePrimitive.Panel.State) => (
      <PanelSurface
        elementProps={elementProps}
        hiddenUntilFound={hiddenUntilFound}
        render={render}
        state={state}
      />
    ),
    [hiddenUntilFound, render]
  );
  return (
    <CollapsiblePrimitive.Panel
      data-ui="collapsible-panel"
      hiddenUntilFound={hiddenUntilFound}
      {...props}
      render={renderPanel}
    />
  );
}

function PanelSurface({
  elementProps,
  hiddenUntilFound,
  render,
  state,
}: {
  elementProps: ComponentPropsWithRef<"div">;
  hiddenUntilFound?: boolean;
  render: CollapsiblePrimitive.Panel.Props["render"];
  state: CollapsiblePrimitive.Panel.State;
}) {
  // A settled hidden-until-found panel must remain searchable by the browser.
  // During exit, hide interactive descendants before the visual transition finishes.
  const inactive = !(state.open || (hiddenUntilFound && elementProps.hidden));
  return useRender({
    props: {
      ...elementProps,
      "aria-hidden": inactive ? true : elementProps["aria-hidden"],
      inert: inactive || elementProps.inert,
    },
    render,
    state: { ...state },
  });
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger };
