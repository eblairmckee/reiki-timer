export const chimes = [
  { file: "alex_jauk-zen-tone-deep-202555.mp3", id: "zen-deep", name: "Deep zen tone" },
  { file: "alex_jauk-zen-tone-mid-202556.mp3", id: "zen-mid", name: "Mid zen tone" },
  { file: "alex_jauk-zen-tone-high-202554.mp3", id: "zen-high", name: "High zen tone" },
  {
    file: "freesound_community-e-flat-tibetan-singing-bowl-struck-38746.mp3",
    id: "tibetan-bowl",
    name: "Tibetan singing bowl",
  },
  {
    file: "freesound_community-singing-bowl-hit-3-33366.mp3",
    id: "bowl-hit",
    name: "Singing bowl hit",
  },
  {
    file: "freesound_community-singing-bowl-strike-sound-84682.mp3",
    id: "bowl-strike",
    name: "Singing bowl strike",
  },
] as const;

export type ChimeId = (typeof chimes)[number]["id"];
export const defaultChime: ChimeId = "zen-mid";

export function isChimeId(value: unknown): value is ChimeId {
  return chimes.some((chime) => chime.id === value);
}

/** One context and cached buffers per screen; constructing the player never starts audio. */
export class ChimePlayer {
  private context: AudioContext | null = null;
  private readonly buffers = new Map<ChimeId, Promise<AudioBuffer>>();
  private source: AudioBufferSourceNode | null = null;
  private generation = 0;
  private disposed = false;
  private readonly requests = new AbortController();

  private load(id: ChimeId, context: AudioContext) {
    let buffer = this.buffers.get(id);
    if (!buffer) {
      const chime = chimes.find((item) => item.id === id);
      if (!chime) {
        throw new Error("Unknown chime");
      }
      buffer = fetch(`${import.meta.env?.BASE_URL ?? "/"}chime-sounds/${chime.file}`, {
        signal: this.requests.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Chime could not be loaded");
          }
          return response.arrayBuffer();
        })
        .then((data) => context.decodeAudioData(data))
        .catch((error: unknown) => {
          this.buffers.delete(id);
          throw error;
        });
      this.buffers.set(id, buffer);
    }
    return buffer;
  }

  async prepare(id: ChimeId) {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
    if (this.disposed) {
      return;
    }
    this.context ??= new AudioContext();
    // Invoke resume synchronously from Enable / Preview / Start, before fetching.
    const ready = this.context.state === "running" ? Promise.resolve() : this.context.resume();
    await Promise.all([ready, this.load(id, this.context)]);
  }

  async play(id: ChimeId) {
    this.stop();
    const { generation } = this;
    await this.prepare(id);
    const { context } = this;
    const buffer = await this.buffers.get(id);
    // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
    if (this.disposed || generation !== this.generation || !context || !buffer) {
      return;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.onended = () => {
      source.disconnect();
      if (this.source === source) {
        this.source = null;
      }
    };
    this.source = source;
    source.start();
  }

  stop() {
    this.generation += 1;
    this.source?.stop();
    this.source?.disconnect();
    this.source = null;
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.requests.abort();
    this.buffers.clear();
    this.context?.close().catch(() => {
      // Audio context disposal is best effort.
    });
  }
}
