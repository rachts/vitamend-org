import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ eval: vi.fn(), construct: vi.fn() }));
vi.mock("@upstash/redis", () => ({
  Redis: class {
    eval = mocks.eval;
    constructor(...args: unknown[]) { mocks.construct(...args); }
  },
}));

describe("fixed-window rate limiting", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(120_000);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
  const request = (path = "/api/auth/register") => new Request(`https://vitamend.in${path}`, { headers: { "x-forwarded-for": "203.0.113.1" } });

  it("does not construct Redis at import and denies unconfigured production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { checkRateLimit } = await import("@/lib/rate-limit");
    expect(mocks.construct).not.toHaveBeenCalled();
    expect(await checkRateLimit(request())).toMatchObject({ allowed: false, remaining: 0, reset: 180_000 });
  });

  it("counts the local development quota and resets at the fixed boundary", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    expect(await checkRateLimit(request(), 2)).toMatchObject({ allowed: true, remaining: 1, reset: 180_000 });
    vi.setSystemTime(179_000);
    expect(await checkRateLimit(request(), 2)).toMatchObject({ allowed: true, remaining: 0, reset: 180_000 });
    expect((await checkRateLimit(request(), 2)).allowed).toBe(false);
    vi.setSystemTime(180_000);
    expect(await checkRateLimit(request(), 2)).toMatchObject({ allowed: true, remaining: 1, reset: 240_000 });
  });

  it("preserves direct and factory call forms without promising refill", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    expect((await rateLimit(request(), 2, 999)).remaining).toBe(1);
    expect((await rateLimit(2, 1)(request())).remaining).toBe(0);
    expect((await rateLimit(2, 999)(request())).allowed).toBe(false);
    expect((await rateLimit(request("/api/upload"), 2)).remaining).toBe(1);
    expect((await rateLimit(request())).remaining).toBe(99);
  });

  it("uses an atomic first-hit expiry and stable window keys", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    mocks.eval.mockResolvedValue(1);
    const { checkRateLimit } = await import("@/lib/rate-limit");
    await checkRateLimit(request(), 5);
    vi.setSystemTime(150_000);
    expect((await checkRateLimit(request(), 5)).reset).toBe(180_000);
    expect(mocks.construct).toHaveBeenCalledTimes(1);
    expect(mocks.eval.mock.calls[0][0]).toContain("if count == 1 then");
    expect(mocks.eval.mock.calls[0][1]).toEqual(mocks.eval.mock.calls[1][1]);
    expect(mocks.eval.mock.calls[0][2]).toEqual([60]);
    expect(mocks.eval.mock.calls[1][2]).toEqual([30]);
  });

  it("fails closed on configured Redis outages and malformed responses", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    const { checkRateLimit } = await import("@/lib/rate-limit");
    mocks.eval.mockRejectedValueOnce(new Error("unavailable"));
    expect((await checkRateLimit(request())).allowed).toBe(false);
    for (const value of [null, "1", {}, NaN, -1]) {
      mocks.eval.mockResolvedValueOnce(value);
      expect((await checkRateLimit(request())).allowed).toBe(false);
    }
    mocks.eval.mockResolvedValueOnce(6);
    expect((await checkRateLimit(request(), 5)).allowed).toBe(false);
  });
});
