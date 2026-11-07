import { afterEach, beforeEach, expect, type MockInstance, test, vi } from "vitest";
import { SoundPlayer } from "./sound-player";

const originalContext = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
const sources: {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}[] = [];
const resume = vi.fn(async () => {
  /* Successful audio stub. */
});
const close = vi.fn(async () => {
  /* Successful audio stub. */
});
const decode = vi.fn(async () => ({ duration: 3 }));
let fetchSound: MockInstance<typeof fetch>;
let player: SoundPlayer;

beforeEach(() => {
  sources.length = 0;
  resume.mockClear();
  close.mockClear();
  decode.mockClear();
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: class {
      state = "suspended";
      destination = {};
      resume = resume;
      close = close;
      decodeAudioData = decode;
      // biome-ignore lint/style/useThisInClassMethods: AudioContext mock must expose the native instance method.
      createBufferSource() {
        const source = {
          buffer: null,
          connect: vi.fn(),
          disconnect: vi.fn(),
          onended: null,
          start: vi.fn(),
          stop: vi.fn(),
        };
        sources.push(source);
        return source;
      }
    },
  });
  fetchSound = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])));
  player = new SoundPlayer();
});

afterEach(() => {
  player.dispose();
  fetchSound.mockRestore();
  if (originalContext) {
    Object.defineProperty(globalThis, "AudioContext", originalContext);
  } else {
    Reflect.deleteProperty(globalThis, "AudioContext");
  }
});

test("audio stays lazy, resumes on preparation, and reuses decoded sounds", async () => {
  expect(fetchSound).not.toHaveBeenCalled();
  const preparing = player.prepare("https://example.com/notifications/complete.mp3");
  expect(resume).toHaveBeenCalledTimes(1);
  await preparing;
  expect(sources).toHaveLength(0);
  await player.play("https://example.com/notifications/complete.mp3");
  await player.play("https://example.com/notifications/complete.mp3");
  expect(fetchSound).toHaveBeenCalledTimes(1);
  expect(decode).toHaveBeenCalledTimes(1);
  expect(sources).toHaveLength(2);
  expect(sources[0].stop).toHaveBeenCalledTimes(1);
  expect(sources[1].start).toHaveBeenCalledTimes(1);
});

test("a slower earlier preview cannot play over the latest selection", async () => {
  let resolveFirst: (response: Response) => void = () => {
    /* Assigned by the deferred fetch below before use. */
  };
  fetchSound.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveFirst = resolve;
    })
  );
  const first = player.play("https://example.com/notifications/complete.mp3");
  await player.play("/media/message.wav");
  resolveFirst(new Response(new Uint8Array([1])));
  await first;
  expect(sources).toHaveLength(1);
  expect(sources[0].start).toHaveBeenCalledTimes(1);
});

test("stopping cancels pending playback; failed loads can be retried", async () => {
  const pending = player.play("https://example.com/notifications/complete.mp3");
  player.stop();
  await pending;
  expect(sources).toHaveLength(0);
  fetchSound.mockResolvedValueOnce(new Response(null, { status: 404 }));
  await expect(player.play("/media/retry.ogg")).rejects.toThrow("could not be loaded");
  await player.play("/media/retry.ogg");
  expect(sources).toHaveLength(1);
  player.dispose();
  expect(sources[0].stop).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledTimes(1);
  await player.play("/media/retry.ogg");
  expect(sources).toHaveLength(1);
});

test("independent notification URLs retain their identity and cache separately", async () => {
  const complete = "https://example.com/notifications/complete.mp3";
  const message = "/media/message.wav";
  await player.prepare(complete);
  await player.prepare(message);
  await player.play(complete);
  await player.play(message);
  expect(fetchSound.mock.calls.map(([url]) => url)).toEqual([complete, message]);
  expect(decode).toHaveBeenCalledTimes(2);
  expect(sources).toHaveLength(2);
});

test("disposal aborts pending requests and prevents their eventual playback", async () => {
  const response = Promise.withResolvers<Response>();
  fetchSound.mockReturnValueOnce(response.promise);
  const playing = player.play("/notifications/pending.wav");
  const [, options] = fetchSound.mock.calls[0];
  expect(options?.signal?.aborted).toBe(false);
  player.dispose();
  expect(options?.signal?.aborted).toBe(true);
  response.resolve(new Response(new Uint8Array([1])));
  await playing;
  expect(sources).toHaveLength(0);
});

test("a decode failure evicts the cached request so the same URL can recover", async () => {
  decode.mockRejectedValueOnce(new Error("Invalid audio"));
  await expect(player.prepare("/notifications/retry.wav")).rejects.toThrow("Invalid audio");
  await player.play("/notifications/retry.wav");
  expect(fetchSound).toHaveBeenCalledTimes(2);
  expect(decode).toHaveBeenCalledTimes(2);
  expect(sources[0].start).toHaveBeenCalledTimes(1);
});
