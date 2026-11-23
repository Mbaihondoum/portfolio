import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import { getPublishedProjects } from '@/server/services/content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const projects = await getPublishedProjects()
  const lang = (path: string) => ({
    languages: { fr: `${base}/fr${path}`, en: `${base}/en${path}` },
  })
  return [
    { url: `${base}/fr`, changeFrequency: 'monthly', priority: 1, alternates: lang('') },
    { url: `${base}/en`, changeFrequency: 'monthly', priority: 0.9, alternates: lang('') },
    ...projects.flatMap((p) =>
      (['fr', 'en'] as const).map((l) => ({
        url: `${base}/${l}/projects/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: lang(`/projects/${p.slug}`),
      })),
    ),
    { url: `${base}/fr/docs/api`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
