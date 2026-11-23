import 'server-only'
import { env } from '@/server/env'
import { logger } from '@/server/logger'

/** Verifies a Cloudflare Turnstile token. Disabled (always true) without a secret. */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = env().TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip && ip !== 'unknown') body.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch (err) {
    logger.error('turnstile.verify_failed', { err })
    return false
  }
}
