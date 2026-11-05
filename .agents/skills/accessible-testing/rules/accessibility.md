# Accessible interaction contracts

## Semantics and names

Prefer native controls and supplied accessible primitives. Give controls accessible names, including icon-only buttons through visible or assistive text, and synchronize necessary ARIA with their real state. Keep independently interactive controls separate; a button or link must not contain another independent button or link.

Use a logical heading hierarchy and meaningful landmarks. Provide a way to bypass repeated navigation when needed. Give informative images useful alt text and decorative images an empty alt attribute. Hide decorative icons from assistive technology when they duplicate an existing name.

## Keyboard, focus, and gestures

Preserve native keyboard behavior and add custom handlers for interactions that the chosen element does not provide. Check activation, arrow navigation, and dismissal as appropriate to the widget, including that a single activation triggers an action once.

Preserve logical tab order and visible focus, using focus-visible or an equivalent treatment that remains clear for keyboard use. Keep focused controls and heading anchors clear of sticky headers, footers, and overlays. Place, contain, and restore focus appropriately for modal dialogs, and preserve normal focus behavior for nonmodal interfaces.

Provide tap or click and keyboard alternatives to drag, swipe, pinch, or path gestures unless the gesture is essential. Keep browser zoom and text resizing available. Use autofocus only when the task benefits and the resulting focus and mobile keyboard behavior are intentional.

## Perception, media, and feedback

Convey information beyond color, support narrow layouts, and respect reduced motion. Check contrast and applicable forced-color behavior when changing visual treatments. Keep native controls readable in the active theme.

Provide captions, transcripts, or descriptions for meaningful media as appropriate to its content, and keep media controls keyboard operable. Hide purely decorative media from assistive technology when appropriate.

Provide meaningful loading, empty, error, retry, and disabled states where reachable. Announce important async feedback using an appropriate live region without repeating routine updates or announcing every keystroke.
