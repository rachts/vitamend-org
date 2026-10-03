import { Redis } from "@upstash/redis";

let redis: Redis | undefined;
const localWindows = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const incrementWindow = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
  return count
`;

export interface RateLimitResult {
  success: boolean;
  allowed: boolean;
  remaining: number;
  reset: number;
}

// A fixed one-minute window. The legacy third argument is accepted but ignored;
// it has never implemented token-bucket refill semantics.
export async function checkRateLimit(req: Request, capacity = 100, _legacyRefillRate?: number): Promise<RateLimitResult> {
  const now = Date.now();
  const reset = (Math.floor(now / WINDOW_MS) + 1) * WINDOW_MS;
  const denied = { success: false, allowed: false, remaining: 0, reset };
  if (!Number.isSafeInteger(capacity) || capacity < 1) return denied;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip") || "unknown";
  // Isolate endpoints and limits so a permissive endpoint cannot consume or
  // bypass the stricter authentication quota.
  const key = `rate-limit:${new URL(req.url).pathname}:${capacity}:${ip}:${Math.floor(now / WINDOW_MS)}`;
  const configured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  let count: number;
  if (!configured) {
    if (process.env.NODE_ENV === "production") return denied;
    for (const [entryKey, entry] of localWindows) {
      if (entry.reset <= now) localWindows.delete(entryKey);
    }
    count = (localWindows.get(key)?.count ?? 0) + 1;
    localWindows.set(key, { count, reset });
  } else {
    try {
      redis ??= new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      const result = await redis.eval(incrementWindow, [key], [Math.ceil((reset - now) / 1000)]);
      if (typeof result !== "number" || !Number.isSafeInteger(result) || result < 1) return denied;
      count = result;
    } catch {
      // Configured storage failure is never permission to bypass the limit.
      return denied;
    }
  }
  const allowed = count <= capacity;
  return { success: allowed, allowed, remaining: Math.max(0, capacity - count), reset };
}

export function rateLimit(req: Request): Promise<RateLimitResult>;
export function rateLimit(req: Request, capacity?: number, legacyRefillRate?: number): Promise<RateLimitResult>;
export function rateLimit(capacity?: number, legacyRefillRate?: number): (req: Request) => Promise<RateLimitResult>;
export function rateLimit(reqOrCapacity?: Request | number, capacity = 100, _legacyRefillRate?: number) {
  if (reqOrCapacity && typeof reqOrCapacity === "object" && "headers" in reqOrCapacity) {
    return checkRateLimit(reqOrCapacity, capacity);
  }
  const limit = typeof reqOrCapacity === "number" ? reqOrCapacity : 10;
  return (req: Request) => checkRateLimit(req, limit);
}
