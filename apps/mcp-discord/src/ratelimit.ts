const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RateLimiter {
  private globalQueue: Promise<void> = Promise.resolve();
  private guildQueues: Map<string, Promise<void>> = new Map();

  async run<T>(
    options: { scope: "global" | "guild"; guildId?: string },
    fn: () => Promise<T>
  ): Promise<T> {
    const minDelay = options.scope === "guild" ? 500 : 20;

    // Wait for previous queue item to finish
    const queuePromise = options.scope === "guild" && options.guildId
      ? (this.guildQueues.get(options.guildId) || Promise.resolve())
      : this.globalQueue;

    // Create a deferred tracker for the queue
    let resolveTracker: () => void;
    const tracker = new Promise<void>(r => { resolveTracker = r; });

    if (options.scope === "guild" && options.guildId) {
      this.guildQueues.set(options.guildId, tracker);
    } else {
      this.globalQueue = tracker;
    }

    // Wait for queue, execute, then release
    await queuePromise;

    let retries = 0;
    try {
      while (retries < 3) {
        try {
          const result = await fn();
          await delay(minDelay);
          resolveTracker!();
          return result;
        } catch (error: any) {
          if (error?.status === 429 || error?.code === 429) {
            retries++;
            const retryAfter = error?.retryAfter || (Math.pow(2, retries) * 1000);
            await delay(retryAfter);
            continue;
          }
          throw error;
        }
      }
      throw new Error("Rate limit exceeded after 3 retries");
    } catch (err) {
      await delay(minDelay);
      resolveTracker!();
      throw err;
    }
  }
}

