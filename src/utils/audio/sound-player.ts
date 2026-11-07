/** One context and cached buffers per player; constructing the player never starts audio. */
export class SoundPlayer {
  private context: AudioContext | null = null;
  private readonly buffers = new Map<string, Promise<AudioBuffer>>();
  private source: AudioBufferSourceNode | null = null;
  private generation = 0;
  private disposed = false;
  private readonly requests = new AbortController();

  private load(url: string, context: AudioContext) {
    let buffer = this.buffers.get(url);
    if (!buffer) {
      buffer = fetch(url, {
        signal: this.requests.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Sound could not be loaded");
          }
          return response.arrayBuffer();
        })
        .then((data) => context.decodeAudioData(data))
        .catch((error: unknown) => {
          this.buffers.delete(url);
          throw error;
        });
      this.buffers.set(url, buffer);
    }
    return buffer;
  }

  async prepare(url: string) {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: Refs, async audio and optional browser APIs can change outside this control-flow analysis; retain the runtime guard.
    if (this.disposed) {
      return;
    }
    this.context ??= new AudioContext();
    // Invoke resume synchronously within the caller’s user gesture, before fetching.
    const ready = this.context.state === "running" ? Promise.resolve() : this.context.resume();
    await Promise.all([ready, this.load(url, this.context)]);
  }

  async play(url: string) {
    this.stop();
    const { generation } = this;
    await this.prepare(url);
    const { context } = this;
    const buffer = await this.buffers.get(url);
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
