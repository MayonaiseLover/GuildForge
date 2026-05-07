import { describe, it, expect } from "vitest";
import { RateLimiter } from "../src/ratelimit.js";

describe("RateLimiter", () => {
  it("should run tasks in order", async () => {
    const limiter = new RateLimiter();
    const results: number[] = [];
    
    const p1 = limiter.run({ scope: "global" }, async () => { results.push(1); return 1; });
    const p2 = limiter.run({ scope: "global" }, async () => { results.push(2); return 2; });
    
    await Promise.all([p1, p2]);
    expect(results).toEqual([1, 2]);
  });
});
