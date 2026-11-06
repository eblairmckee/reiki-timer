import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { ChimePlayer } from "./chimes";

const originalContext = Object.getOwnPropertyDescriptor(globalThis, "AudioContext");
const sources: {
  start: ReturnType<typeof mock>;
  stop: ReturnType<typeof mock>;
  disconnect: ReturnType<typeof mock>;
}[] = [];
const resume = mock(async () => {});
const close = mock(async () => {});
const decode = mock(async () => ({ duration: 3 }));
let fetchSound: ReturnType<typeof spyOn<typeof globalThis, "fetch">>;
let player: ChimePlayer;

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
      createBufferSource() {
        const source = {
          connect: mock(),
          disconnect: mock(),
          start: mock(),
          stop: mock(),
          buffer: null,
          onended: null,
        };
        sources.push(source);
        return source;
      }
    },
  });
  fetchSound = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(async () => new Response(new Uint8Array([1, 2, 3])), {
      preconnect: globalThis.fetch.preconnect,
    }),
  );
  player = new ChimePlayer();
});

afterEach(() => {
  player.dispose();
  fetchSound.mockRestore();
  if (originalContext) Object.defineProperty(globalThis, "AudioContext", originalContext);
  else Reflect.deleteProperty(globalThis, "AudioContext");
});

test("audio stays lazy, resumes on preparation, and reuses decoded sounds", async () => {
  expect(fetchSound).not.toHaveBeenCalled();
  const preparing = player.prepare("zen-deep");
  expect(resume).toHaveBeenCalledTimes(1);
  await preparing;
  expect(sources).toHaveLength(0);
  await player.play("zen-deep");
  await player.play("zen-deep");
  expect(fetchSound).toHaveBeenCalledTimes(1);
  expect(decode).toHaveBeenCalledTimes(1);
  expect(sources).toHaveLength(2);
  expect(sources[0].stop).toHaveBeenCalledTimes(1);
  expect(sources[1].start).toHaveBeenCalledTimes(1);
});

test("a slower earlier preview cannot play over the latest selection", async () => {
  let resolveFirst: (response: Response) => void = () => {};
  fetchSound.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveFirst = resolve;
    }),
  );
  const first = player.play("zen-deep");
  await player.play("zen-high");
  resolveFirst(new Response(new Uint8Array([1])));
  await first;
  expect(sources).toHaveLength(1);
  expect(sources[0].start).toHaveBeenCalledTimes(1);
});

test("stopping cancels pending playback; failed loads can be retried", async () => {
  const pending = player.play("zen-deep");
  player.stop();
  await pending;
  expect(sources).toHaveLength(0);
  fetchSound.mockResolvedValueOnce(new Response(null, { status: 404 }));
  await expect(player.play("bowl-hit")).rejects.toThrow("could not be loaded");
  await player.play("bowl-hit");
  expect(sources).toHaveLength(1);
  player.dispose();
  expect(sources[0].stop).toHaveBeenCalledTimes(1);
  expect(close).toHaveBeenCalledTimes(1);
  await player.play("bowl-hit");
  expect(sources).toHaveLength(1);
});
