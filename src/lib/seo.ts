import type { Locale } from '@/lib/types'
import type { PublicProject, PublicSettings } from '@/server/services/dto'
import { siteUrl } from './site'

/** JSON-LD is embedded in a <script>; escape "<" so content can't close it. */
function safeJson(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function personJsonLd(s: PublicSettings, locale: Locale) {
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: s.fullName,
    jobTitle: s.headline,
    description: s.tagline,
    url: `${siteUrl()}/${locale}`,
    email: `mailto:${s.email}`,
    address: s.location ? { '@type': 'PostalAddress', addressLocality: s.location } : undefined,
    sameAs: [s.githubUrl, s.linkedinUrl].filter(Boolean),
    knowsAbout: [
      'Full stack development',
      'Data analysis',
      'Power BI',
      'R',
      'PostgreSQL',
      'Next.js',
    ],
  })
}

export function projectJsonLd(p: PublicProject, s: PublicSettings, locale: Locale) {
  return safeJson({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    abstract: p.summary,
    url: `${siteUrl()}/${locale}/projects/${p.slug}`,
    inLanguage: locale,
    keywords: p.stack.join(', '),
    image: p.coverImage ? new URL(p.coverImage, siteUrl()).toString() : undefined,
    author: { '@type': 'Person', name: s.fullName },
    dateModified: p.updatedAt,
  })
}
