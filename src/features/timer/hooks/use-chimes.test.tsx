import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { SoundPlayer } from "@/utils/audio/sound-player";
import { useChimes } from "./use-chimes";

afterEach(() => vi.restoreAllMocks());

test("audio preparation failure is recoverable without throwing into the timer command", async () => {
  vi.spyOn(SoundPlayer.prototype, "prepare").mockRejectedValueOnce(new Error("Permission denied"));
  vi.spyOn(SoundPlayer.prototype, "play").mockResolvedValue(undefined);
  const { result } = renderHook(useChimes, { wrapper: StrictMode });
  await act(async () => result.current.prepare("zen-mid"));
  expect(result.current.error).toBe("Sound couldn't play. Tap a bell to try again.");
  await act(async () => result.current.play("zen-high"));
  expect(result.current.error).toBe("");
});

test("a late failed preview cannot replace the latest preview or survive Stop", async () => {
  const obsolete = Promise.withResolvers<void>();
  const stopped = Promise.withResolvers<void>();
  vi.spyOn(SoundPlayer.prototype, "play")
    .mockReturnValueOnce(obsolete.promise)
    .mockResolvedValueOnce(undefined)
    .mockReturnValueOnce(stopped.promise);
  const { result } = renderHook(useChimes, { wrapper: StrictMode });
  await act(() => {
    result.current.play("zen-deep");
    result.current.play("zen-high");
    obsolete.reject(new Error("Obsolete failure"));
  });
  expect(result.current.error).toBe("");
  await act(() => {
    result.current.play("bowl-hit");
    result.current.stop();
    stopped.reject(new Error("Stopped failure"));
  });
  expect(result.current.error).toBe("");
});

test("unmount disposes the lazily created player and invalidates pending error feedback", async () => {
  const pending = Promise.withResolvers<void>();
  vi.spyOn(SoundPlayer.prototype, "play").mockReturnValue(pending.promise);
  const dispose = vi.spyOn(SoundPlayer.prototype, "dispose");
  const { result, unmount } = renderHook(useChimes, { wrapper: StrictMode });
  expect(dispose).not.toHaveBeenCalled();
  act(() => result.current.play("zen-deep"));
  unmount();
  expect(dispose).toHaveBeenCalledTimes(1);
  await act(async () => pending.reject(new Error("Closed screen")));
  expect(result.current.error).toBe("");
});

test("the feature maps bell identity to resolved URLs during the caller's gesture", () => {
  const prepare = vi.spyOn(SoundPlayer.prototype, "prepare").mockResolvedValue(undefined);
  const play = vi.spyOn(SoundPlayer.prototype, "play").mockResolvedValue(undefined);
  const { result } = renderHook(useChimes);
  act(() => {
    result.current.prepare("zen-mid");
    expect(prepare).toHaveBeenCalledWith(
      `${import.meta.env.BASE_URL}chime-sounds/alex_jauk-zen-tone-mid-202556.mp3`
    );
    result.current.play("bowl-hit");
    expect(play).toHaveBeenCalledWith(
      `${import.meta.env.BASE_URL}chime-sounds/freesound_community-singing-bowl-hit-3-33366.mp3`
    );
  });
});
