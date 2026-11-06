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
    "Paper's mesh shader changed: review the grain-coordinate adapter before upgrading.",
  );
}
export const pixelGrainMeshShader = meshGradientFragmentShader
  .replace(
    "uniform float u_grainOverlay;",
    "uniform float u_grainOverlay;\nuniform float u_pixelRatio;\nuniform float u_grainFrequency;",
  )
  .replace(grainCoordinates, "vec2 grainUV = gl_FragCoord.xy / u_pixelRatio * u_grainFrequency;");

export const PaperMesh = memo(function PaperMesh({
  colors,
  ref,
}: {
  colors: string[];
  ref?: Ref<PaperShaderElement>;
}) {
  const uniforms = useMemo(
    () => ({
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_distortion: atmosphereSettings.distortion,
      u_swirl: atmosphereSettings.swirl,
      u_grainMixer: atmosphereSettings.grainMixer,
      u_grainOverlay: atmosphereSettings.grainOverlay,
      // Matches the approved 390px mobile grain at scale 1.32 on every viewport.
      u_grainFrequency: 1000 / (390 * 1.32),
      u_fit: ShaderFitOptions.contain,
      u_rotation: 0,
      u_scale: atmosphereSettings.scale,
      u_offsetX: 0,
      u_offsetY: atmosphereSettings.offsetY,
      u_originX: 0.5,
      u_originY: 0.5,
      u_worldWidth: 0,
      u_worldHeight: 0,
    }),
    [colors],
  );
  return (
    <ShaderMount
      ref={ref}
      fragmentShader={pixelGrainMeshShader}
      uniforms={uniforms}
      speed={0}
      minPixelRatio={atmosphereSettings.minPixelRatio}
      maxPixelCount={atmosphereSettings.maxPixelCount}
      width="100%"
      height="100%"
    />
  );
});
