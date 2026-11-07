import { meshGradientFragmentShader, ShaderFitOptions } from "@paper-design/shaders";
import {
  getShaderColorFromString,
  type PaperShaderElement,
  ShaderMount,
} from "@paper-design/shaders-react";
import { memo, type Ref, useMemo } from "react";
import { atmosphereSettings } from "./atmosphere-config";

// Paper 0.0.82 ties grain to object UVs, making it grow with viewport size/zoom.
// Keep the upstream mesh algorithm; anchor only grain to CSS pixels instead.
const grainCoordinates = "vec2 grainUV = uv * 1000.;";
if (!meshGradientFragmentShader.includes(grainCoordinates)) {
  throw new Error(
    "Paper's mesh shader changed: review the grain-coordinate adapter before upgrading."
  );
}
export const pixelGrainMeshShader = meshGradientFragmentShader
  .replace(
    "uniform float u_grainOverlay;",
    "uniform float u_grainOverlay;\nuniform float u_pixelRatio;\nuniform float u_grainFrequency;"
  )
  .replace(grainCoordinates, "vec2 grainUV = gl_FragCoord.xy / u_pixelRatio * u_grainFrequency;");

export const AtmosphereMesh = memo(function AtmosphereMeshView({
  colors,
  ref,
}: {
  /** Decorative palette colors accepted by Paper; no interactive content or accessible name. */
  colors: string[];
  /** Forward the Paper shader element for uniform updates. */
  ref?: Ref<PaperShaderElement>;
}) {
  const uniforms = useMemo(
    () => ({
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_distortion: atmosphereSettings.distortion,
      u_fit: ShaderFitOptions.contain,
      // Matches the approved 390px mobile grain at scale 1.32 on every viewport.
      u_grainFrequency: 1000 / (390 * 1.32),
      u_grainMixer: atmosphereSettings.grainMixer,
      u_grainOverlay: atmosphereSettings.grainOverlay,
      u_offsetX: 0,
      u_offsetY: atmosphereSettings.offsetY,
      u_originX: 0.5,
      u_originY: 0.5,
      u_rotation: 0,
      u_scale: atmosphereSettings.scale,
      u_swirl: atmosphereSettings.swirl,
      u_worldHeight: 0,
      u_worldWidth: 0,
    }),
    [colors]
  );
  return (
    <ShaderMount
      fragmentShader={pixelGrainMeshShader}
      height="100%"
      maxPixelCount={atmosphereSettings.maxPixelCount}
      minPixelRatio={atmosphereSettings.minPixelRatio}
      ref={ref}
      speed={0}
      uniforms={uniforms}
      width="100%"
    />
  );
});
