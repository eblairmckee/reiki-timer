import { LinkButton } from "../link-button";
import { Button } from ".";

const activate = () => undefined;

// Compile-only regression evidence, checked by the existing TypeScript command.
export const supportedControls = [
  <Button key="default">Run</Button>,
  <Button iconOnly key="icon" size="md" />,
  <Button appearance="inset" key="word" size="lg">
    Save
  </Button>,
  <Button appearance="solid" intent="error" key="legacy" size="sm">
    Delete
  </Button>,
  <Button appearance="link" intent="neutral" key="legacy-link" size="lg">
    Retry
  </Button>,
  <Button appearance="etched" intent="primary" key="etched" size="sm">
    Edit
  </Button>,
  <LinkButton href="/details" key="navigation">
    Details
  </LinkButton>,
  <LinkButton as="button" key="command" onClick={activate}>
    Retry
  </LinkButton>,
];

// @ts-expect-error Frost does not render semantic error ink.
export const frostIntent = <Button intent="error">Delete</Button>;
// @ts-expect-error Inset does not render neutral ink.
export const insetIntent = <Button appearance="inset" intent="neutral" />;
// @ts-expect-error Etched uses fixed brand ink.
export const etchedIntent = <Button appearance="etched" intent="error" />;
// @ts-expect-error Text uses fixed brand ink.
export const textIntent = <Button appearance="text" intent="neutral" />;
// @ts-expect-error Frost words have no small dimensions.
export const frostSmall = <Button size="sm">Run</Button>;
// @ts-expect-error Frost icons are sized with root custom properties.
export const frostLargeIcon = <Button iconOnly size="lg" />;
// @ts-expect-error Inset icons are sized with root custom properties.
export const insetSmallIcon = <Button appearance="inset" iconOnly size="sm" />;
// @ts-expect-error Navigation requires a destination.
export const missingDestination = <LinkButton>Details</LinkButton>;
// @ts-expect-error Explicit anchors also require a destination.
export const missingAnchorDestination = <LinkButton as="a">Details</LinkButton>;
// @ts-expect-error Commands use native button props, not navigation destinations.
export const commandDestination = <LinkButton as="button" href="/details" />;
