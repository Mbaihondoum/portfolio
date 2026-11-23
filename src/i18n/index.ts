import 'server-only'
import { locale as rootLocale } from 'next/root-params'
import { logger } from '@/server/logger'
import { isLocale, type Locale } from '@/lib/types'
import en from './dictionaries/en'
import fr, { type Dictionary } from './dictionaries/fr'

const dictionaries: Record<Locale, Dictionary> = { fr, en }

export type { Dictionary }

/** Current locale from the `[locale]` root segment (Server Components only). */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale()
  if (value && isLocale(value)) return value
  // Unknown locales never reach here (proxy + generateStaticParams); fall back
  // instead of throwing notFound(), which would mark a page as noindex.
  logger.warn('i18n.locale_fallback', { value })
  return 'fr'
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())]
}

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale]
}
