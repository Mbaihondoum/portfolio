import 'server-only'
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/types'

export const PUBLIC_CACHE = 'public, s-maxage=300, stale-while-revalidate=86400'

export function jsonError(status: number, code: string, message: string, init?: ResponseInit) {
  return Response.json({ error: { code, message } }, { ...init, status })
}

export function localeFrom(url: URL): Locale {
  const value = url.searchParams.get('locale') ?? ''
  return isLocale(value) ? value : DEFAULT_LOCALE
}
