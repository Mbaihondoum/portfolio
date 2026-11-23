import type { Metadata, Viewport } from 'next'
import { locale as rootLocale } from 'next/root-params'
import '../globals.css'
import { fontVariables } from '../fonts'
import { headScript } from '../head-script'
import { LOCALES, isLocale, type Locale } from '@/lib/types'
import { dictionaryFor } from '@/i18n'
import { siteUrl } from '@/lib/site'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const value = await rootLocale()
  const locale: Locale = value && isLocale(value) ? value : 'fr'
  const t = dictionaryFor(locale)
  return {
    metadataBase: new URL(siteUrl()),
    description: t.meta.description,
    alternates: { languages: { fr: '/fr', en: '/en', 'x-default': '/fr' } },
  }
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  colorScheme: 'dark light',
}

export default async function LocaleLayout({ children }: LayoutProps<'/[locale]'>) {
  const value = await rootLocale()
  const locale: Locale = value && isLocale(value) ? value : 'fr'
  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
