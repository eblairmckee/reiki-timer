# Mobile timer concepts

## Files

Use `component--variant--state--vNN.png`. Variant identifies the material; state identifies interaction and persistent state. Comparison sheets list states left to right. Increment revisions for reviewed changes; keep only useful versions. These studies show the amber phase of the changing background, not a permanent color theme.

| Retained image | Purpose |
| --- | --- |
| [Composed screen](timer-config--amber-relief--rest--v01.png) | Regenerated in place from the retained component studies, as requested |
| [Dial](dial--recessed-frost--rest-hover-press--v03.png) | Recessed ticks, frosted rotating disk, etched index; rest / hover / press |
| [Start HUD](hud-start--recessed-frost--rest-hover-press--v01.png) | Frosted face in a recessed well; rest / hover / press |
| [Switch](switch--recessed-frost--off-rest-hover-press--v01.png) | Recessed track, frosted thumb; all states remain off until release |

For an individual frame, use e.g. `switch--recessed-frost--on-pressed--v02.png`. [Exact prompts](prompts.md) record built-in imagegen generation and the final dial edit.

## Current visual direction

Use the switch as the material reference: a defined curved edge, translucent recessed well, and frostier touch surface. The dial inherits that edge, with recessed stationary ticks and a short etched radial index in its rotating disk. No raised wedge or separate decorative outline. The diffuse disappearing dial edge was rejected.

Hover subtly lifts and reveals the frosted surface; press settles it into the recess. Keep the text and hit area stable. Touch uses press directly; keyboard needs visible focus. Hover must not stick after touch; Motion provides filtered hover gestures. [Motion hover](https://motion.dev/docs/react-hover-animation)

## Build feasibility

| Effect | Proposed implementation |
| --- | --- |
| Recess and frost | CSS translucent gradients, inset shadows and a static `backdrop-filter`. Blur affects the background, preserving sharp text. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) |
| Etched ticks and index | Small SVG with paired dark/light strokes; the index rotates separately. No displacement filter needed. |
| Hover, press, release | Transform and opacity; crossfade prepainted highlight/shadow layers instead of animating shadow blur. These are the safest animation properties. [Motion performance](https://motion.dev/docs/performance) |
| Rotary drag and detents | Pointer angle drives a Motion value; update the label only when its selected step changes, spring to the nearest step on release. Motion values update visuals without React renders. [Motion values](https://motion.dev/docs/react-motion-value) |
| Press/release ripple | Brief expanding, fading gradient behind the control. This suggests a wave without physically distorting the background. |

Keep the filtered backing separate from rotating artwork. Limit blur to visible control regions; static blur still has work to do over a moving background. Avoid animated turbulence/displacement, nested blur and per-frame SVG geometry changes. Profile the actual background plus controls on mobile Safari and Chrome before promising smoothness. [Browser animation guidance](https://web.dev/articles/animations-guide)

Translucent text remains feasible, but filters cannot guarantee contrast against arbitrary changing colors. Constrain background luminance behind text or add a subtle local backing, then verify composited contrast through transitions. Keep the repository's 4.5:1 text target. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## Image review

The final dial removes the wedge and restores the defined switch-like edge. All studies retain the warm transparent material; press states read as recessed. Highlights and press depth are enlarged for comparison and need tuning at mobile size. These images establish appearance, not measured contrast, motion quality or browser performance. The app and UI-design skill now implement this material direction. Later feedback replaces the large detached readout with a small value outside the selected tick, and uses earthy chakra palettes with the approved Paper shader settings. See [implementation evaluation](../../ui-design-evaluation.md).
