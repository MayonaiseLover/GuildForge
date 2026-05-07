const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RateLimiter {
  private globalQueue: Promise<void> = Promise.resolve();
  private guildQueues: Map<string, Promise<void>> = new Map();

  async run<T>(
    options: { scope: "global" | "guild"; guildId?: string },
    fn: () => Promise<T>
  ): Promise<T> {
    const minDelay = options.scope === "guild" ? 500 : 20;

    const queuePromise = options.scope === "guild" && options.guildId
      ? (this.guildQueues.get(options.guildId) || Promise.resolve())
      : this.globalQueue;

    const execute = async (): Promise<T> => {
      let retries = 0;
      while (retries < 3) {
        try {
          return await fn();
        } catch (error: any) {
          if (error?.status === 429 || error?.code === 429) {
            retries++;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const retryAfter = error?.retryAfter || (Math.pow(2, retries) * 1000);
            await delay(retryAfter);
            continue;
          }
          throw error;
        }
      }
      throw new Error("Rate limit exceeded after 3 retries");
    };

    const nextPromise = queuePromise.then(async () => {
      const res = await execute();
      await delay(minDelay);
      return res;
    }).catch(async (err) => {
      await delay(minDelay);
      throw err;
    });

    if (options.scope === "guild" && options.guildId) {
      this.guildQueues.set(options.guildId, nextPromise.then(() => {}).catch(() => {}));
    } else {
      this.globalQueue = nextPromise.then(() => {}).catch(() => {});
    }

    return nextPromise;
  }
}
