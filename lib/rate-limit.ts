import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export interface RateLimitResult {
  success: boolean;
  allowed: boolean;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(req: Request, capacity = 100, _refillRate = 10): Promise<RateLimitResult> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("x-real-ip") 
    || "unknown";
  
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Upstash Redis not configured, skipping rate limit");
    if (process.env.NODE_ENV === "production") {
      return { success: false, allowed: false, remaining: 0, reset: Date.now() + 60000 };
    }
    return { success: true, allowed: true, remaining: capacity, reset: Date.now() + 60000 };
  }

  const now = Date.now();
  const key = `rate-limit:${ip}`;

  try {
    const windowSeconds = 60; // 1 minute window
    
    const [count] = await redis.pipeline()
      .incr(key)
      .expire(key, windowSeconds)
      .exec();

    // Type checking the pipeline response
    const currentCount = typeof count === 'number' ? count : 1;
    const isAllowed = currentCount <= capacity;

    return {
      success: isAllowed,
      allowed: isAllowed,
      remaining: Math.max(0, capacity - currentCount),
      reset: now + (windowSeconds * 1000)
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open if Redis is down
    return { success: true, allowed: true, remaining: capacity, reset: now + 60000 };
  }
}

export function rateLimit(req: Request): Promise<RateLimitResult>;
export function rateLimit(req: Request, capacity?: number, refillRate?: number): Promise<RateLimitResult>;
export function rateLimit(capacity?: number, refillRate?: number): (req: Request) => Promise<RateLimitResult>;
export function rateLimit(reqOrCapacity?: Request | number, capacityOrRefillRate = 1, requestedRefillRate = 10) {
  if (reqOrCapacity && typeof reqOrCapacity === "object" && "headers" in reqOrCapacity) {
    const capacity = arguments.length >= 2 ? capacityOrRefillRate : 100;
    const refillRate = arguments.length >= 3 ? requestedRefillRate : 10;
    return checkRateLimit(reqOrCapacity as Request, capacity, refillRate);
  }
  const capacity = typeof reqOrCapacity === "number" ? reqOrCapacity : 10;
  const refillRate = arguments.length >= 2 ? capacityOrRefillRate : 1;
  return async function (req: Request) {
    return await checkRateLimit(req, capacity, refillRate);
  };
}
