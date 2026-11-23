import 'server-only'
import { createHmac } from 'node:crypto'
import { env } from '@/server/env'
import { rateLimitsRepository } from '@/server/repositories'
import { logger } from '@/server/logger'

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: Date }

/** HMAC so raw IPs are never persisted. */
export function hashIdentifier(identifier: string, bucket: string) {
  return createHmac('sha256', env().IP_HASH_SECRET).update(`${bucket}:${identifier}`).digest('hex')
}

export function windowStartFor(now: number, windowMs: number) {
  return new Date(Math.floor(now / windowMs) * windowMs)
}

/**
 * Fixed-window rate limiter backed by Postgres (atomic upsert).
 * Fails open (allows the request) if the database errors, and logs it.
 */
export async function rateLimit(opts: {
  bucket: string
  identifier: string
  limit: number
  windowMs: number
  now?: number
}): Promise<RateLimitResult> {
  const now = opts.now ?? Date.now()
  const windowStart = windowStartFor(now, opts.windowMs)
  const resetAt = new Date(windowStart.getTime() + opts.windowMs)
  try {
    const key = hashIdentifier(opts.identifier, opts.bucket)
    const count = await rateLimitsRepository.hit(key, windowStart)
    // Opportunistic cleanup (~2% of calls) of windows older than a day.
    if (Math.random() < 0.02) {
      void rateLimitsRepository.purgeOlderThan(new Date(now - 86_400_000)).catch(() => {})
    }
    return { ok: count <= opts.limit, remaining: Math.max(0, opts.limit - count), resetAt }
  } catch (err) {
    logger.error('rate_limit.failed', { bucket: opts.bucket, err })
    return { ok: true, remaining: opts.limit, resetAt }
  }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
