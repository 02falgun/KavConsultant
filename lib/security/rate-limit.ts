import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

let redis: Redis | null = null;
let apiRateLimiter: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    apiRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'), // Allows 10 requests every 10 seconds per identifier
      analytics: true,
      prefix: '@upstash/ratelimit/kavconsultant',
    });
  }
} catch (error) {
  console.error('Failed to initialize Upstash Redis rate limiter:', error);
}

/**
 * Applies sliding-window rate limiting to Next.js API route requests.
 * Uses client IP or custom string identifier (e.g. login email/tenant ID) to partition buckets.
 *
 * @param request The incoming Request object
 * @param customKey Optional custom identifier for rate-limiting partition
 * @returns NextResponse with 429 status if rate limit exceeded, or null if allowed to proceed
 */
export async function applyRateLimit(
  request: Request,
  customKey?: string
): Promise<Response | null> {
  if (!apiRateLimiter) {
    // Fallback/Fail-open if Upstash is not configured in local/dev environments
    return null;
  }

  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const identifier = customKey ? `${customKey}:${ip}` : ip;

    const { success, limit, reset, remaining } = await apiRateLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests: Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  } catch (error) {
    console.error('Rate limiting execution error:', error);
    // Fail-open to preserve API availability in case of Upstash network hiccups
    return null;
  }

  return null;
}
