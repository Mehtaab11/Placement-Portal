// Simple in-memory rate limiter (per process, resets on restart).
// Suitable for demo/portfolio. In production replace with a Redis-based limiter.

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();

/**
 * Returns true if the request should be allowed.
 * @param key      - unique key (e.g. userId + routeName)
 * @param maxCalls - max calls in the window
 * @param windowMs - time window in milliseconds
 */
export function checkRateLimit(key: string, maxCalls: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxCalls) return false;

  entry.count += 1;
  return true;
}
