---
name: visual-design
description: Design or materially change the app's visual composition, typography, responsive hierarchy, surfaces or motion while preserving its brand and accessible presentation. Use for visual design decisions and rendered review, independently of React composition work.
---

# Visual design in this app

Start with the intended hierarchy and actual content, then inspect the affected views and existing system contracts. The app owns the adapted design system's brand and interaction. Reuse its typography roles, semantic theme colors, atmosphere, material defaults and motion behavior. Preserve Bona Nova SC for headings, countdowns and field labels, and Cabin for dialog body/actions, descriptions and summary copy; use Hugeicons consistently. Button defaults to frost, with inset as a variant. Exact product hierarchy, including the finish dialog’s icon-or-text choices, stays with that feature. Preserve intentional distinctions; neither exact historical timer constants nor upstream examples define a universal design rule.

Choose each surface for its content and interaction purpose. Keep foreground content legible against its actual backing, including atmospheric or changing surfaces. Numerical token contrast does not certify gradients, translucency or every rendered frame. Retain native/forced-color and reduced-transparency behavior where promised; do not hard-code literal paints around a token failure. Color values belong in `src/components/design-system/styles/theme.css`; consumers use semantic references. Preserve `currentColor`, transparency and theme-derived renderer inputs. Public styling extensions must preserve portal theming and required Olyx aliases; private CSS variables/selectors are not public APIs merely because they appear in source.

Use content-driven layout. Check narrow and wide views, long headings, empty/error states, enlarged text, wrapping and meaningful content order. An icon-only control still needs a useful name; visible labels and context must communicate the action. Product copy and localization decisions belong with the feature. Do not hide essential content or require a hover gesture to understand it.

Use motion to explain relationships and state, without blocking input or making completion depend on an animation. Preserve reduced-motion behavior and interruption/exit behavior. Test ordinary motion separately from the reduced-motion test default. Do not impose one timing value on interactions with different purposes.

Typography and media choices have semantic roles as well as delivery cost. Preserve reading hierarchy, useful fallbacks, stable media dimensions and appropriate alternative text. Load what the view needs; investigate a measured performance problem before adding a broad optimization recipe.

Inspect the running affected states for hierarchy, brand, legibility, spacing and motion. Use browser relationships and resolved styles for objective guarantees. A preview or layout fixture must load the app's actual global stylesheet and cascade. Observe the cue the contract allows, including color or pseudo-elements when relevant, rather than assuming motion means element travel or opacity. Report uninspected device, font, screen-reader or perceptual conditions. Do not turn generated screenshots into a mandatory approval baseline or claim static color/a11y checks prove visual quality.
