import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export interface RateLimitResult {
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
    return { allowed: true, remaining: capacity, reset: Date.now() + 60000 };
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

    return {
      allowed: currentCount <= capacity,
      remaining: Math.max(0, capacity - currentCount),
      reset: now + (windowSeconds * 1000)
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open if Redis is down
    return { allowed: true, remaining: capacity, reset: now + 60000 };
  }
}
export function rateLimit(capacity = 10, refillRate = 1) {
  return async function (req: Request) {
    return await checkRateLimit(req, capacity, refillRate);
  };
}
