# Concept prompts

Generated with the **built-in imagegen tool**. See [the study index and feasibility notes](README.md). The saved original screen was the shared image reference; the switch study supplied the final dial's edge and frost reference. Only retained outputs are saved here.

## Original amber screen

Output: `timer-config--amber-relief--rest--v01.png` (the user's original `v1.png`, unchanged apart from its filename).

```text
Use case: ui-mockup
Asset type: high-fidelity mobile web app visual direction, first timer-configuration screen.
Primary request: Explore an exceptionally minimal, warm, translucent glass Reiki timer interface. One tall 9:19.5 mobile screen, full bleed, straight-on UI artwork, no hardware bezel, no surrounding canvas.
Composition: One vertically centered field group only. Small "How long" label and one selected "20m" duration sit immediately above a circular sundial-inspired rotary time picker. Circle approximately 70% viewport width. Leave spacious uninterrupted atmosphere around this focal control. The very bottom of the screen reveals only the top 20% of the next field, intentionally cut off: "Repeat chakras" and just the upper segment of its off switch. A tiny almost transparent glass circular play button floats in the top-right safe area, with no text.
Direction: AMBER RELIEF. The dial feels like an exceptionally shallow frosted glass relief suspended within the colored atmosphere, with a barely visible boundary, delicate concentric etched grooves and precise unnumbered radial ticks. Use one little angular glass sundial index and its soft diagonal shadow to communicate rotation. A broad clear center, no numerals inside the circle. Less sculptural rim than a lens, more subtle etched circular surface. Do not make it stone, ceramic, metallic, or opaque. Do not use a real outdoor sundial or a photoreal scene.
Backdrop: Smooth complex luminous mesh gradient at an orange-to-yellow chakra transition, soft apricot, pale amber, golden yellow and a touch of rose warmth, broad drifting curved color fields. Fine subtle dither only. No harsh rainbow, texture noise, celestial symbols, particles, florals, ocean scene or horizon.
Typography: Elegant light humanist sans-serif, softly translucent warm deep bronze/brown ink, crisp high legibility and generous spacing. Make the selected duration distinct through scale, not a pill or card. Subtle light catching glyph edges can evoke glass, without embossing it into heavy lettering.
Foreground: Every visual surface is translucent and shares the background hues; fine edge catches, softly blurred color transmitted through glass, extremely restrained contact shadows. No large white pills, solid panels, heavy outlines, sharp drop shadows, typical settings-form containers or decorative graphics.
Exact text only: "How long", "20m", "Repeat chakras". Duration ranges 5m–1h and defaults 20m; repeat is off for one cycle. Other settings including Warm up and Cool down continue below and are offscreen. There is no bottom nav or heading. This is a polished practical UI concept, not a moodboard, wireframe, poster or 3D product scene.
```

## dial

Output: `dial--recessed-frost--rest-hover-press--v03.png`.

Initial generation below, followed by the final targeted edit. The intervening diffuse-edge experiment was rejected and is not retained.

```text
Use case: ui-mockup.
Asset type: high-fidelity interaction-state comparison sheet for a mobile Reiki timer.
Input image: the supplied amber mobile screen is the visual reference for palette, restrained translucency, warm deep bronze ink and softness, not a composition to copy wholesale.
Shared new material direction: recessed translucent wells like the reference switch track, with a separate frosted translucent moving/touchable surface like the reference switch thumb. Well depth comes from a soft inner shadow on the upper-left and soft inner light below, not a stroked outline. Frost scatters the apricot background but remains visibly translucent. Keep the broad smooth apricot, amber, pale golden yellow and rose mesh gradient. No white cards or presentation borders.
Composition: one wide landscape sheet, three equally sized large detail studies side by side: Rest, Hover, Press. Identical scale, placement and background luminosity across all three cells, for precise comparison. The component occupies most of its cell. Exact small bronze sans-serif captions below each component: "Rest", "Hover", "Press". No other captions or explanatory text. These captions are annotations outside the UI. Straight-on flat web UI detail, no physical product or phone frame, no perspective.
Interaction realism: effects must be plausible with layered CSS gradients, inset shadows, static blur, simple SVG geometry, transforms and opacity. Show restrained but clearly distinguishable state changes. Avoid simulated watery refraction, caustics, splashes, huge glows, cursor illustrations, fingers, arrows, or motion trails. Preserve the same component anatomy across all three states.
Subject: circular sundial duration picker. Redesign the reference dial using the new shared material. Each study includes small "How long" above "20m" above the dial, using the reference's crisp light bronze typography; these remain identical between states.
Anatomy: the whole control sits in one shallow circular translucent recessed well. Unnumbered radial ticks are incised into the recessed outer track, darker groove plus tiny lower highlight, genuinely recessed rather than raised. The broad inner rotating disk is frosted translucent glass, like a large version of the switch thumb, with the amber backdrop softly visible through it. One small frosted triangular sundial index is integrated into the rotating disk at roughly 1:30, pointing to the fixed etched scale. No other hands, numbers or holes.
CRITICAL: no outline, no luminous perimeter stroke, no double concentric circular linework, no thick torus. Define the circular forms only with soft tonal depth, frost and shading. It should remain airy and shallow, not a chunky opaque puck.
Rest: lightly frosted inner disk resting in the translucent recessed well; shallow soft directional shadow at index.
Hover: same dial and same value/angle; frosted disk lifts imperceptibly, brightens modestly, selected incised tick gains definition, index shadow slightly extends. The outer well and tick geometry remain fixed.
Press: same value/angle; frosted disk settles down into the well, softer subdued top highlight and a tighter contact shadow, index compresses slightly. The outer recess becomes locally more evident around the disk. It must look physically depressed, distinct from hover, without any hard ring or outline. No ripple in this still.
The material should connect directly to a recessed switch track with a frosted thumb, not to a traditional white rotary knob.
```

### Final dial edit

Inputs: the initial dial study and the saved switch study.

```text
Use case: precise-object-edit.
Asset type: high-fidelity three-panel sundial interaction study, Rest / Hover / Press.
Input image 1: original three-panel sundial study, the edit target. Input image 2: three-panel switch study, authoritative material and edge reference.
Primary request: preserve the original sundial study composition but replace its raised triangular wedge pointer with a tiny etched index in the frosted rotating disk, and match the disk/well edge precisely to the switch thumb/track.
Remove EVERY raised pizza-slice wedge, triangle and its long diagonal cast shadow from all three dials. Nothing should project from the dial surface.
Replacement index: a SINGLE short narrow recessed radial dash engraved directly into the frosted disk near its outer edge at about 1:30, aligned with one of the fixed surrounding tick marks. It lies fully inside the disk and stops just before the edge, so it points toward the selected exterior tick. It is approximately 12 percent of the disk radius long. Tiny bronze recess with a subtle lower light edge, as if incised into glass. NO arrowhead, triangle, wedge, fin, clock hand, protrusion, hole or cast shadow. The tiny etched marker is the only rotating indicator.
Material/edge correction: the frosted rotating disk is a large circular version of the switch's thumb; the surrounding tick-bearing well is a circular version of the switch's recessed track. Preserve the switch's clearly defined smooth material boundary, fine curved bevel highlight, warm translucent frost, restrained contact shadow, and recessed well. Do NOT fade the circular edge away. Do NOT add a separate stroked border or concentric decorative linework. The switch edge is correct; a diffuse disappearing edge is wrong.
Keep unnumbered ticks incised in the fixed recessed outer well. All three states retain 20m and the same index angle.
Rest: frosted disk in recessed track, defined softly rounded edge like resting switch thumb.
Hover: a slight lift and brighter frosted face like hovering switch thumb.
Press: disk gently settles into the recess with a tighter contact shadow like pressed switch thumb; no massive dark ring.
Preserve exact three-column composition, sizing, typography, all text verbatim ("How long", "20m", "Rest", "Hover", "Press"), amber/apricot/rose gradient, tick positions, and subtle differences in state. No extra UI, no switch in the output, no framing.
```

## hud-start

Output: `hud-start--recessed-frost--rest-hover-press--v01.png`.

```text
Use case: ui-mockup.
Asset type: high-fidelity interaction-state comparison sheet for a mobile Reiki timer.
Input image: the supplied amber mobile screen is the visual reference for palette, restrained translucency, warm deep bronze ink and softness, not a composition to copy wholesale.
Shared new material direction: recessed translucent wells like the reference switch track, with a separate frosted translucent moving/touchable surface like the reference switch thumb. Well depth comes from a soft inner shadow on the upper-left and soft inner light below, not a stroked outline. Frost scatters the apricot background but remains visibly translucent. Keep the broad smooth apricot, amber, pale golden yellow and rose mesh gradient. No white cards or presentation borders.
Composition: one wide landscape sheet, three equally sized large detail studies side by side: Rest, Hover, Press. Identical scale, placement and background luminosity across all three cells, for precise comparison. The component occupies most of its cell. Exact small bronze sans-serif captions below each component: "Rest", "Hover", "Press". No other captions or explanatory text. These captions are annotations outside the UI. Straight-on flat web UI detail, no physical product or phone frame, no perspective.
Interaction realism: effects must be plausible with layered CSS gradients, inset shadows, static blur, simple SVG geometry, transforms and opacity. Show restrained but clearly distinguishable state changes. Avoid simulated watery refraction, caustics, splashes, huge glows, cursor illustrations, fingers, arrows, or motion trails. Preserve the same component anatomy across all three states.
Subject: the circular Start HUD button from the top-right of the reference, enlarged for material inspection. Each panel contains only one circular button with a centered small deep bronze right-pointing play triangle. No timer, text labels or other controls in these detail panels except the three state captions.
Anatomy: a very shallow translucent circular recessed well containing a softly frosted translucent pressable circular face, sharing the switch thumb's material. Delicate soft inset depth in the well; soft material transitions, no hard perimeter outline, no double rings, no glass torus, no opaque white face.
Rest: very subtle low-contrast glass material, but the bronze play glyph remains recognizable and crisp.
Hover: the same face becomes noticeably more frosted and luminous, the play glyph and material highlight become fully revealed; tiny lift with a soft shadow. Full reveal still means translucent glass, not an opaque white disk.
Press: face descends slightly into the well and shrinks about three percent, top highlight softens, short contact shadow and recessed shading strengthen. Play glyph moves with the face but keeps its shape and contrast. Show the pressed instant before activation; do not change play to stop.
Keep surface diameter and placement consistent; changes are only depth, translucency and tiny scale. Make the three states visibly distinguishable at thumbnail size while retaining restraint. No pulsing/ripple ring in this still.
```

## switch

Output: `switch--recessed-frost--off-rest-hover-press--v01.png`.

```text
Use case: ui-mockup.
Asset type: high-fidelity interaction-state comparison sheet for a mobile Reiki timer.
Input image: the supplied amber mobile screen is the visual reference for palette, restrained translucency, warm deep bronze ink and softness, not a composition to copy wholesale.
Shared new material direction: recessed translucent wells like the reference switch track, with a separate frosted translucent moving/touchable surface like the reference switch thumb. Well depth comes from a soft inner shadow on the upper-left and soft inner light below, not a stroked outline. Frost scatters the apricot background but remains visibly translucent. Keep the broad smooth apricot, amber, pale golden yellow and rose mesh gradient. No white cards or presentation borders.
Composition: one wide landscape sheet, three equally sized large detail studies side by side: Rest, Hover, Press. Identical scale, placement and background luminosity across all three cells, for precise comparison. The component occupies most of its cell. Exact small bronze sans-serif captions below each component: "Rest", "Hover", "Press". No other captions or explanatory text. These captions are annotations outside the UI. Straight-on flat web UI detail, no physical product or phone frame, no perspective.
Interaction realism: effects must be plausible with layered CSS gradients, inset shadows, static blur, simple SVG geometry, transforms and opacity. Show restrained but clearly distinguishable state changes. Avoid simulated watery refraction, caustics, splashes, huge glows, cursor illustrations, fingers, arrows, or motion trails. Preserve the same component anatomy across all three states.
Subject: enlarged detail of the OFF switch at the bottom of the supplied reference. All three states remain OFF with thumb on the LEFT. No labels inside the UI, no text except the state captions below.
Anatomy: a horizontal capsule track approximately twice as wide as tall, translucent amber/peach and recessed into the soft gradient background, with subtle inner shadow at upper-left and softly lit lower interior. No stroked track border. A circular softly frosted translucent cream-apricot glass thumb sits inside on the left with even small clearance. The thumb is visibly frostier than the clear recessed track, like the exact reference thumb. Gentle rounded highlight and tiny soft contact shadow, no shiny metal or opaque plastic.
Rest: frosty thumb rests comfortably in the recessed track.
Hover: frosted thumb softly brightens and lifts very slightly, with a slightly longer soft shadow. Track remains recessed and unchanged in position; thumb stays LEFT.
Press: thumb settles into the track, compressing slightly into a subtly wider oval with less vertical height, contact shadow shortens, upper highlight softens. This is pointer-down before release, not a toggle: keep thumb LEFT and track off-color. Do not animate or depict thumb movement to the right.
The rest/hover/press states should feel like the same airy material, using a frosted touch surface against a recessed translucent well, with no added perimeter rings or glow.
```


## Composed screen regeneration — November 5, 2026

Target: `timer-config--amber-relief--rest--v01.png`, replaced at the user's request. References: the existing screen and retained dial v03, HUD v01, and switch v01 studies. Later user feedback supersedes this image's large readout and pastel palette; material relationships remain the reference.

```text
Use case: compositing.
Asset type: final composed mobile Reiki timer configuration reference.
Input image 1: original full mobile screen, EDIT TARGET for background, typography, airy arrangement and overall proportions. Input image 2: approved sundial Rest/Hover/Press sheet, authoritative DIAL reference. Input image 3: approved switch sheet, authoritative SWITCH reference. Input image 4: approved HUD sheet, authoritative START BUTTON reference.
Regenerate the complete tall, flat, edge-to-edge mobile screen using the REST state of all three approved components together. Keep the original luminous apricot/amber/yellow/rose flowing mesh background, warm translucent bronze light sans-serif typography, label "How long", single large "20m" above the dial, and tiny floating play button at top right.
Replace the entire old dial with the exact REST design in image 2: circular translucent recessed well, incised unnumbered ticks, a large softly frosted rotating circular disk that sits inside, defined curved thumb-like bevel edge, and one tiny recessed radial dash etched into the disk at about 1:30 pointing to its selected tick. NO raised triangular wedge, pizza slice, protrusion, cast pointer shadow, clock hands, numbers on the dial or concentric decorative grooves. The disk and well edges match the switch's material; they do not fade away. The dial is around 84% of screen width, centered horizontally. "How long", "20m", and the dial form one airy vertically centered field.
Replace the top-right play button with the REST face from image 4, scaled to about 11% of screen width and inset about 4% from top/right. Subtle frosted circular touch surface in a shallow recessed well; small bronze triangle.
Mobile layout correction: the next field is vertically stacked, not a horizontal row. Center "Repeat chakras" near the bottom at about 87% height; center the OFF switch from image 3 directly BELOW it, around 96% height, approximately 29% of screen width, so its lower portion is clipped by the viewport. This is a partial glimpse of the next scroll field, not a footer. Only one full field plus the next-field peek appears. All switch details should match image 3: clear warm recessed track, frostier circular thumb on LEFT.
Exact visible text only: "How long", "20m", "Repeat chakras". No comparison captions, no additional labels, helper text, status bar, nav, phone frame, title or containers. Preserve the spacious minimalist interface and translucent material. A precise practical UI reference, no extra decoration.
```
