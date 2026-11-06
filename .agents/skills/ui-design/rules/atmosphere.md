# Shared atmosphere

Configuration and playback share one persistent Paper mesh canvas. The [Atmosphere atom](../../../../src/components/atoms/atmosphere/index.tsx) owns lifecycle, palette and uniform updates; [its preset](../../../../src/components/atoms/atmosphere/atmosphere-config.ts) owns distortion, swirl, grain, speed and resolution limits. Resize and view changes never remount the canvas.

Use the bold `--chakra-bold-*` pigments from [theme.css](../../../../src/components/ui/styles/theme.css): recognizable red, orange, yellow ochre, green, blue, indigo and violet. Preserve the earlier pastel tokens for comparison. Resolve computed CSS into shader uniforms; keep palette literals out of JavaScript. Transition the four colors sequentially and update uniforms outside React rendering.

Grain strength and grain size are independent. Derive responsive grain mixing and shape scale from the current preset and the Atmosphere resize mapping; keep tuning values in code rather than duplicating them here. The [version-guarded adapter](../../../../src/components/atoms/atmosphere/paper-mesh.tsx) retains Paper's mesh and anchors grain to CSS pixels using render pixel ratio. Recheck it when upgrading Paper; prefer an upstream frequency control when available.

Keep WebGL fallback pigments synchronized with the current palette and [adaptive ink](typography.md). Cap resolution, stop hidden-tab rendering and freeze decoration for Reduced Motion. Review texture at equal browser zoom. Record GPU/battery measurements separately from visual observations and source safeguards.
