import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locale as rootLocale } from 'next/root-params'
import { ViewTransition } from 'react'
import { dictionaryFor, getDictionary, getLocale } from '@/i18n'
import { isLocale } from '@/lib/types'
import { projectJsonLd } from '@/lib/seo'
import { getPublishedProject, getPublishedProjects, getSettings } from '@/server/services/content'
import { toProject, toSettings } from '@/server/services/dto'
import { ProjectDetail } from '@/components/projects/project-detail'

export async function generateStaticParams() {
  const projects = await getPublishedProjects()
  // Cache Components needs at least one value; unknown slugs render on demand.
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: 'example' }]
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const value = await rootLocale()
  const locale = value && isLocale(value) ? value : 'fr'
  const raw = await getPublishedProject(slug)
  if (!raw) return { title: dictionaryFor(locale).notFound.title }
  const p = toProject(raw, locale)
  return {
    title: p.title,
    description: p.summary,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: { fr: `/fr/projects/${slug}`, en: `/en/projects/${slug}` },
    },
    openGraph: {
      type: 'article',
      title: p.title,
      description: p.summary,
      images:
        p.coverImage && !p.coverImage.endsWith('.svg')
          ? [{ url: p.coverImage, alt: p.coverAlt }]
          : undefined,
    },
  }
}

export default async function ProjectPage({ params }: PageProps<'/[locale]/projects/[slug]'>) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const [raw, all, rawSettings] = await Promise.all([
    getPublishedProject(slug),
    getPublishedProjects(),
    getSettings(),
  ])
  if (!raw) notFound()
  const p = toProject(raw, locale)
  const settings = toSettings(rawSettings, locale)
  const index = all.findIndex((x) => x.slug === slug)
  const nextRaw = all.length > 1 ? all[(index + 1) % all.length] : undefined
  const next = nextRaw
    ? { slug: nextRaw.slug, title: nextRaw.title[locale] || nextRaw.title.fr }
    : null

  return (
    <ViewTransition
      enter={{ 'nav-forward': 'page', 'nav-back': 'page', default: 'page' }}
      exit="page"
      default="none"
    >
      <article className="pt-28 pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: projectJsonLd(p, settings, locale) }}
        />
        <ProjectDetail p={p} t={t} locale={locale} next={next} backHref={`/${locale}#projects`} />
      </article>
    </ViewTransition>
  )
}
