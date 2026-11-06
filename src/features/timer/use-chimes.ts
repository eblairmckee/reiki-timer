import { useCallback, useEffect, useRef, useState } from "react";
import { type ChimeId, ChimePlayer } from "./chimes";

export function useChimes() {
  const player = useRef<ChimePlayer | null>(null);
  const [error, setError] = useState("");
  const request = useRef(0);

  useEffect(
    () => () => {
      request.current += 1;
      player.current?.dispose();
      player.current = null;
    },
    []
  );

  const run = useCallback((action: "prepare" | "play", id: ChimeId) => {
    player.current ??= new ChimePlayer();
    request.current += 1;
    const { current } = request;
    setError("");
    player.current[action](id).catch(() => {
      if (current === request.current) {
        setError("Sound couldn't play. Tap a bell to try again.");
      }
    });
  }, []);
  const prepare = useCallback((id: ChimeId) => run("prepare", id), [run]);
  const play = useCallback((id: ChimeId) => run("play", id), [run]);
  const stop = useCallback(() => {
    request.current += 1;
    player.current?.stop();
    setError("");
  }, []);

  return { error, play, prepare, stop };
}
