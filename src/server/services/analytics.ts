import 'server-only'
import { trackSchema } from '@/lib/validators'
import { analyticsRepository } from '@/server/repositories'
import { logger } from '@/server/logger'

export type Device = 'mobile' | 'tablet' | 'desktop'

const BOT_RE = /bot|crawler|spider|crawling|headless|lighthouse|preview|curl|wget|python-requests/i

export function detectDevice(ua: string): Device {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet'
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

export function isBot(ua: string) {
  return !ua || BOT_RE.test(ua)
}

export function referrerHost(referrer: string | undefined, ownHost: string | null): string | null {
  if (!referrer) return null
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    if (ownHost && host === ownHost.replace(/^www\./, '').split(':')[0]) return null
    return host.slice(0, 200)
  } catch {
    return null
  }
}

export function projectSlugFromPath(path: string): string | null {
  const match = /^\/(?:fr|en)\/projects\/([a-z0-9-]+)\/?$/.exec(path)
  return match?.[1] ?? null
}

/**
 * Records an anonymous page view. Stored: path, locale, country (from the
 * hosting edge header), device class and referrer host. No IP, cookie or ID.
 */
export async function trackPageView(raw: unknown, headers: Headers): Promise<boolean> {
  const parsed = trackSchema.safeParse(raw)
  if (!parsed.success) return false
  const ua = headers.get('user-agent') ?? ''
  if (isBot(ua) || headers.get('dnt') === '1' || headers.get('sec-gpc') === '1') return true
  const country = headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry')
  try {
    await analyticsRepository.record({
      path: parsed.data.path,
      projectSlug: projectSlugFromPath(parsed.data.path),
      locale: parsed.data.locale,
      country: country && /^[A-Z]{2}$/.test(country) ? country : null,
      device: detectDevice(ua),
      referrerHost: referrerHost(parsed.data.referrer, headers.get('host')),
    })
  } catch (err) {
    logger.error('analytics.record_failed', { err })
  }
  return true
}

export async function getAnalyticsDashboard(days = 30) {
  const since = new Date(Date.now() - days * 86_400_000)
  const [daily, totals, topPaths, topProjects, countries, devices, locales, referrers] =
    await Promise.all([
      analyticsRepository.dailyViews(days),
      analyticsRepository.totals(since),
      analyticsRepository.topPaths(since),
      analyticsRepository.topProjects(since),
      analyticsRepository.byCountry(since),
      analyticsRepository.byDevice(since),
      analyticsRepository.byLocale(since),
      analyticsRepository.topReferrers(since),
    ])
  return { days, daily, totals, topPaths, topProjects, countries, devices, locales, referrers }
}
