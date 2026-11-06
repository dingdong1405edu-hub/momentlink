interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter
 * @param key unique identifier (e.g. IP or IP+route)
 * @param limit maximum allowed requests
 * @param windowMs window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);

    // Clean up expired keys periodically
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetAt <= now) {
          rateLimitStore.delete(k);
        }
      }
    }

    return { allowed: true, remaining: limit - 1, resetAt: newRecord.resetAt };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

