import { getShaderColorFromString, type PaperShaderElement } from "@paper-design/shaders-react";
import { animate } from "motion";
import { motion, useMotionValue } from "motion/react";
import { memo, type ReactNode, useEffect, useEffectEvent, useRef, useState } from "react";
import { sceneMotion } from "../../ui/shared/motion";
import { useReducedMotion } from "../../ui/shared/use-reduced-motion";
import { atmosphereSettings, chakraPalettes } from "./atmosphere-config";
import { inkStrengths } from "./ink-strength";
import { PaperMesh } from "./paper-mesh";
import "./style.css";

interface AtmosphereProps {
  blackout?: boolean;
  children?: ReactNode;
  cycling?: boolean;
  dim?: number;
  phase?: number;
  resetId?: number;
  transitionSeconds?: number;
}

export const Atmosphere = memo(function AtmosphereView({
  phase = 0,
  cycling = true,
  dim = 0,
  transitionSeconds = 10,
  blackout = false,
  resetId = 0,
  children,
}: AtmosphereProps) {
  const reduced = useReducedMotion();
  const scopeRef = useRef<HTMLDivElement>(null);
  const shade = useMotionValue(dim);
  const previousReset = useRef(resetId);
  const rootRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<PaperShaderElement>(null);
  const colorsRef = useRef<number[][]>([]);
  const [theme, setTheme] = useState<string[][] | null>(null);
  const [supported, setSupported] = useState(false);
  const [previewPhase, setPreviewPhase] = useState(0);
  const activePhase = cycling ? previewPhase : phase;

  const updateInk = useEffectEvent(() => {
    if (!(colorsRef.current.length && scopeRef.current)) {
      return;
    }
    const ink = inkStrengths(colorsRef.current, atmosphereSettings.grainOverlay, shade.get());
    for (const [name, alpha] of Object.entries(ink)) {
      scopeRef.current.style.setProperty(`--ink-${name}-alpha`, `${Math.ceil(alpha * 1000) / 10}%`);
    }
  });

  const updatePalette = useEffectEvent((colors: number[][]) => {
    colorsRef.current = colors;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
    shaderRef.current?.paperShaderMount?.setUniforms({ u_colors: colors });
    // The no-WebGL fallback uses the same interpolated theme pigments as the shader.
    if (!supported) {
      colors.forEach((color, index) => {
        rootRef.current?.style.setProperty(
          `--atmosphere-color-${index}`,
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
    const style = getComputedStyle(document.documentElement);
    const resolved = chakraPalettes.map((names) =>
      names.map((name) => style.getPropertyValue(`--chakra-${name}`).trim())
    );
    if (resolved.some((colors) => colors.some((color) => !color))) {
      return;
    }
    setTheme(resolved);
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    if (!gl) {
      return;
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    setSupported(true);
  }, []);

  useEffect(() => {
    if (!cycling || reduced) {
      return;
    }
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        setPreviewPhase((value) => (value + 1) % chakraPalettes.length);
      }
    }, 10_000);
    return () => window.clearInterval(interval);
  }, [cycling, reduced]);

  useEffect(() => {
    if (!(supported && theme)) {
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
      // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
      shaderRef.current?.paperShaderMount?.setUniforms({
        u_grainMixer: atmosphereSettings.grainMixer - desktop * 0.05,
        u_scale: atmosphereSettings.scale - desktop * 0.42,
      });
    }
    function setSpeed() {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
      shaderRef.current?.paperShaderMount?.setSpeed(
        reduced || document.hidden ? 0 : atmosphereSettings.speed
      );
    }
    function initialize() {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
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
  }, [supported, theme, reduced]);

  useEffect(() => {
    if (!theme || blackout) {
      return;
    }
    const target = theme[activePhase].map(getShaderColorFromString);
    const from = colorsRef.current.length ? colorsRef.current : target;
    if (reduced || resetId !== previousReset.current) {
      previousReset.current = resetId;
      updatePalette(target);
      return;
    }
    const animation = animate(0, 1, {
      duration: transitionSeconds,
      ease: "linear",
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
  }, [activePhase, theme, reduced, transitionSeconds, blackout, resetId]);

  useEffect(() => {
    if (blackout) {
      const animation = animate(shade, 1, reduced ? { duration: 0 } : sceneMotion.blackout);
      return () => animation.stop();
    }
    const reveal = shade.get() === 1 && dim === 0;
    const transition = reveal ? sceneMotion.reveal : { duration: 0.24, ease: "easeInOut" as const };
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
        {supported === true && theme !== null && <PaperMesh colors={theme[0]} ref={shaderRef} />}
        <motion.div className="atmosphere-night" style={{ opacity: shade }} />
      </div>
      {children}
    </div>
  );
});
