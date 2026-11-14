import { Switch } from ".";

// Compile-only regression evidence for the public JSX contract.
// @ts-expect-error Switch renders a fixed thumb and takes its name from an external label or ARIA.
export const unsupportedChildren = <Switch aria-label="Show guides">Guides</Switch>;
