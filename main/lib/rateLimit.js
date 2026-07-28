import redis from './redis.js';

/**
 * Serverless-safe rate limiting utility using Redis.
 * @param {string} key - Unique rate limit identifier (e.g. action:ip).
 * @param {number} limit - Maximum number of requests allowed.
 * @param {number} windowSeconds - Time window in seconds.
 * @returns {Promise<{success: boolean, limit: number, remaining: number}>}
 */
export async function rateLimit(key, limit, windowSeconds) {
  const redisKey = `ratelimit:${key}`;
  const current = await redis.get(redisKey);
  
  if (current !== null) {
    const num = parseInt(current, 10);
    if (num >= limit) {
      return { success: false, limit, remaining: 0 };
    }
    const newVal = await redis.incr(redisKey);
    return { success: true, limit, remaining: Math.max(0, limit - newVal) };
  } else {
    // Key doesn't exist, set to 1 and apply expiration window
    await redis.set(redisKey, '1', 'EX', windowSeconds);
    return { success: true, limit, remaining: limit - 1 };
  }
}
