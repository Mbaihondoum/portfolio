import type { Metadata, Viewport } from 'next'
import { locale as rootLocale } from 'next/root-params'
import '../globals.css'
import { fontVariables } from '../fonts'
import { headScript } from '../head-script'
import { LOCALES, isLocale, type Locale } from '@/lib/types'
import { dictionaryFor } from '@/i18n'
import { siteUrl } from '@/lib/site'
import { getSettings } from '@/server/services/content'
import { toSettings } from '@/server/services/dto'
import { MotionProvider } from '@/components/motion/motion-provider'
import { ScrollProgress } from '@/components/motion/scroll-progress'
import { Cursor } from '@/components/motion/cursor'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { AnalyticsTracker } from '@/components/layout/analytics-tracker'

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

async function currentLocale(): Promise<Locale> {
  const value = await rootLocale()
  return value && isLocale(value) ? value : 'fr'
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale()
  const t = dictionaryFor(locale)
  const settings = toSettings(await getSettings(), locale)
  const title = `${settings.fullName} — ${t.meta.titleSuffix}`
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s · ${settings.fullName}` },
    description: t.meta.description,
    applicationName: settings.fullName,
    authors: [{ name: settings.fullName }],
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: '/fr', en: '/en', 'x-default': '/fr' },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_GB',
      alternateLocale: locale === 'fr' ? 'en_GB' : 'fr_FR',
      siteName: settings.fullName,
      title,
      description: t.meta.description,
    },
    twitter: { card: 'summary_large_image', title, description: t.meta.description },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
  colorScheme: 'dark light',
}

export default async function LocaleLayout({ children }: LayoutProps<'/[locale]'>) {
  const locale = await currentLocale()
  const t = dictionaryFor(locale)
  const settings = toSettings(await getSettings(), locale)
  const navItems = (['about', 'skills', 'projects', 'experience', 'services'] as const).map(
    (id) => ({ id, label: t.nav[id] }),
  )
  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body id="top">
        <a
          href="#content"
          className="fixed top-3 left-3 z-[80] -translate-y-20 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-transform focus:translate-y-0"
        >
          {t.a11y.skipToContent}
        </a>
        <MotionProvider>
          <ScrollProgress />
          <SiteHeader
            locale={locale}
            initials={settings.initials}
            items={navItems}
            labels={{
              openMenu: t.a11y.openMenu,
              closeMenu: t.a11y.closeMenu,
              mainNav: t.a11y.mainNav,
              switchLanguage: t.a11y.switchLanguage,
              toggleTheme: t.a11y.toggleTheme,
              contact: t.nav.contact,
            }}
          />
          <main id="content" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter t={t} settings={settings} locale={locale} />
          <Cursor />
        </MotionProvider>
        <AnalyticsTracker locale={locale} />
      </body>
    </html>
  )
}
