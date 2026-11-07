import { getShaderColorFromString, type PaperShaderElement } from "@paper-design/shaders-react";
import { animate } from "motion";
import { motion, useMotionValue } from "motion/react";
import { memo, type ReactNode, useEffect, useEffectEvent, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motion as systemMotion } from "../shared/motion";
import { atmosphereSettings } from "./atmosphere-config";
import { inkStrengths } from "./ink-strength";
import { inkSurfaces } from "./ink-surfaces";
import { AtmosphereMesh } from "./paper-mesh";
import "./style.css";

export type AtmospherePalette = readonly [
  `--${string}`,
  `--${string}`,
  `--${string}`,
  `--${string}`,
];

export interface AtmosphereProps {
  /** Fade decorative backdrop to black; defaults to false. */
  blackout?: boolean;
  /** Foreground content nodes; caller owns all semantics and interactive naming. */
  children?: ReactNode;
  /** Backdrop shade amount from 0 to 1; defaults to 0. */
  dim?: number;
  /** Four theme custom-property names. Unresolved tokens retain the last valid backdrop or theme fallback. */
  palette: AtmospherePalette;
  /** Change to apply the next palette immediately. */
  resetId?: number;
  /** Palette interpolation duration in seconds; defaults to 10. */
  transitionSeconds?: number;
}

/** Decorative, aria-hidden backdrop surrounding caller-owned foreground content. */
export const Atmosphere = memo(function AtmosphereView({
  palette: tokens,
  dim = 0,
  transitionSeconds = systemMotion.palette.settle.duration,
  blackout = false,
  resetId = 0,
  children,
}: AtmosphereProps) {
  const reduced = useReducedMotion();
  const [first, second, third, fourth] = tokens;
  const paletteKey = tokens.join("\u0000");
  const scopeRef = useRef<HTMLDivElement>(null);
  const shade = useMotionValue(dim);
  const previousReset = useRef(resetId);
  const rootRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<PaperShaderElement>(null);
  const colorsRef = useRef<number[][]>([]);
  const surfacesRef = useRef<ReturnType<typeof inkSurfaces> | null>(null);
  const [theme, setTheme] = useState<{ key: string; colors: string[] } | null>(null);
  const [initialColors, setInitialColors] = useState<string[] | null>(null);
  const [supported, setSupported] = useState(false);

  const updateInk = useEffectEvent(() => {
    if (!(colorsRef.current.length && scopeRef.current && surfacesRef.current)) {
      return;
    }
    const ink = inkStrengths(
      colorsRef.current,
      atmosphereSettings.grainOverlay,
      shade.get(),
      surfacesRef.current
    );
    for (const [name, alpha] of Object.entries(ink)) {
      scopeRef.current.style.setProperty(
        `--sys-opacity-ink-${name}-alpha`,
        `${Math.ceil(alpha * 1000) / 10}%`
      );
    }
  });

  const updatePalette = useEffectEvent((colors: number[][]) => {
    colorsRef.current = colors;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: The shader ref is null before mount and after context loss; retain this runtime guard.
    shaderRef.current?.paperShaderMount?.setUniforms({ u_colors: colors });
    // Renderer boundary: channels come from resolved theme tokens, never a second palette.
    // The no-WebGL fallback serializes the same interpolated pigments as the shader.
    if (!supported) {
      colors.forEach((color, index) => {
        rootRef.current?.style.setProperty(
          `--cmp-color-atmosphere-pigment-${index}`,
          `rgb(${color
            .slice(0, 3)
            .map((channel) => channel * 255)
            .join(" ")})`
        );
      });
    }
    updateInk();
  });

  useEffect(() => {
    if (!supported && colorsRef.current.length) {
      updatePalette(colorsRef.current);
    }
  }, [supported]);

  useEffect(() => shade.on("change", updateInk), [shade]);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) {
      return;
    }
    const style = getComputedStyle(scope);
    surfacesRef.current = inkSurfaces(style);
    const palette = [first, second, third, fourth];
    const resolved = palette.map((token) => style.getPropertyValue(token).trim());
    if (resolved.some((color) => !color)) {
      return;
    }
    setTheme({ colors: resolved, key: paletteKey });
    setInitialColors((current) => current ?? resolved);
  }, [first, second, third, fourth, paletteKey]);

  useEffect(() => {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    if (!gl) {
      return;
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    setSupported(true);
  }, []);

  useEffect(() => {
    if (!(supported && initialColors)) {
      return;
    }
    const root = rootRef.current;
    if (!root) {
      return;
    }
    // Paper initializes asynchronously. Wait for its mount, then update uniforms in place.
    // Width changes never remount the canvas or restart the current palette transition.
    let frame = 0;
    let observer: ResizeObserver | undefined;
    function resize(width: number) {
      const desktop = Math.max(0, Math.min(1, (width - 600) / 600));
      // biome-ignore lint/suspicious/noUnnecessaryConditions: The shader ref is null before mount and after context loss; retain this runtime guard.
      shaderRef.current?.paperShaderMount?.setUniforms({
        u_grainMixer: atmosphereSettings.grainMixer - desktop * 0.05,
        u_scale: atmosphereSettings.scale - desktop * 0.42,
      });
    }
    function setSpeed() {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: The shader ref is null before mount and after context loss; retain this runtime guard.
      shaderRef.current?.paperShaderMount?.setSpeed(
        reduced || document.hidden ? 0 : atmosphereSettings.speed
      );
    }
    function initialize() {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: The shader ref is null before mount and after context loss; retain this runtime guard.
      const mount = shaderRef.current?.paperShaderMount;
      if (!mount) {
        frame = requestAnimationFrame(initialize);
        return;
      }
      if (colorsRef.current.length) {
        mount.setUniforms({ u_colors: colorsRef.current });
      }
      setSpeed();
      resize(root?.clientWidth ?? 0);
      observer = new ResizeObserver(([entry]) => resize(entry.contentRect.width));
      if (root) {
        observer.observe(root);
      }
    }
    frame = requestAnimationFrame(initialize);
    document.addEventListener("visibilitychange", setSpeed);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", setSpeed);
    };
  }, [supported, initialColors, reduced]);

  useEffect(() => {
    if (!theme || theme.key !== paletteKey || blackout) {
      return;
    }
    const target = theme.colors.map(getShaderColorFromString);
    const from = colorsRef.current.length ? colorsRef.current : target;
    if (reduced || resetId !== previousReset.current) {
      previousReset.current = resetId;
      updatePalette(target);
      return;
    }
    const animation = animate(0, 1, {
      ...systemMotion.palette.settle,
      duration: transitionSeconds,
      onUpdate(progress) {
        if (document.hidden) {
          return;
        }
        // Each color follows the previous one, keeping the transition continuous.
        const colors = target.map((color, i) => {
          const mix = Math.max(0, Math.min(1, progress * 2 - i / 3));
          return color.map((channel, c) => from[i][c] + (channel - from[i][c]) * mix);
        });
        updatePalette(colors);
      },
    });
    return () => animation.stop();
  }, [theme, paletteKey, reduced, transitionSeconds, blackout, resetId]);

  useEffect(() => {
    if (blackout) {
      const animation = animate(shade, 1, reduced ? { duration: 0 } : systemMotion.scene.blackout);
      return () => animation.stop();
    }
    const reveal = shade.get() === 1 && dim === 0;
    const transition = reveal ? systemMotion.scene.reveal : systemMotion.scene.feedback;
    const animation = animate(shade, dim, reduced ? { duration: 0 } : transition);
    return () => animation.stop();
  }, [blackout, dim, reduced, shade]);

  useEffect(() => {
    const root = rootRef.current;
    function handleLoss(event: Event) {
      event.preventDefault();
      setSupported(false);
    }
    root?.addEventListener("webglcontextlost", handleLoss, true);
    return () => root?.removeEventListener("webglcontextlost", handleLoss, true);
  }, []);

  return (
    <div className="atmosphere-scope" ref={scopeRef}>
      <div aria-hidden="true" className="atmosphere" ref={rootRef}>
        {supported === true && initialColors !== null && (
          <AtmosphereMesh colors={initialColors} ref={shaderRef} />
        )}
        <motion.div className="atmosphere-night" style={{ opacity: shade }} />
      </div>
      {children}
    </div>
  );
});
