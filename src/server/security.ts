import 'server-only'
import { env } from '@/server/env'

/**
 * CSRF defence for JSON POST endpoints: the browser always sends `Origin` on
 * cross-site POSTs, so we only accept our own origin (or none, for same-origin
 * navigations in old browsers / server-to-server tests).
 */
export function isAllowedOrigin(headers: Headers): boolean {
  const origin = headers.get('origin')
  if (!origin) return headers.get('sec-fetch-site') !== 'cross-site'
  const allowed = new Set([new URL(env().NEXT_PUBLIC_SITE_URL).origin])
  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  if (host) {
    const proto = headers.get('x-forwarded-proto') ?? 'https'
    allowed.add(`${proto}://${host}`)
    allowed.add(`http://${host}`)
  }
  return allowed.has(origin)
}
