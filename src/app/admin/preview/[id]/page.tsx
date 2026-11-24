import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dictionaryFor } from '@/i18n'
import { cn } from '@/lib/cn'
import { isLocale, type Locale } from '@/lib/types'
import { uuidSchema } from '@/lib/validators'
import { requireAdmin } from '@/server/auth'
import { projectsRepository } from '@/server/repositories'
import { toProject } from '@/server/services/dto'
import { ProjectDetail } from '@/components/projects/project-detail'

export const metadata: Metadata = { title: 'Aperçu du projet' }

/**
 * Admin-only preview of a project exactly as it will appear on the site,
 * drafts included. Uses the same ProjectDetail component as the public page.
 */
export default async function ProjectPreviewPage({
  params,
  searchParams,
}: PageProps<'/admin/preview/[id]'>) {
  await requireAdmin()
  const { id } = await params
  const { lang } = await searchParams
  if (!uuidSchema.safeParse(id).success) notFound()
  const raw = await projectsRepository.findById(id)
  if (!raw) notFound()
  const locale: Locale = typeof lang === 'string' && isLocale(lang) ? lang : 'fr'
  const p = toProject(raw, locale)
  const published = raw.status === 'published'

  return (
    <>
      <div
        role="note"
        className="sticky top-0 z-50 border-b border-accent/40 bg-background/90 backdrop-blur"
      >
        <div className="container-page flex flex-wrap items-center gap-3 py-3 text-sm">
          <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-[11px] tracking-widest text-accent-foreground uppercase">
            Aperçu
          </span>
          <span className="text-muted">
            {published ? 'Publié — identique au site' : 'Brouillon — non visible sur le site'}
          </span>
          <nav aria-label="Langue de l’aperçu" className="ml-auto flex gap-1">
            {(['fr', 'en'] as const).map((l) => (
              <Link
                key={l}
                href={`/admin/preview/${id}?lang=${l}`}
                aria-current={l === locale ? 'true' : undefined}
                className={cn(
                  'rounded-full px-3 py-1 font-mono text-xs uppercase',
                  l === locale
                    ? 'bg-surface-2 text-foreground'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {l}
              </Link>
            ))}
          </nav>
          <Link href={`/admin/projects/${id}`} className="text-accent hover:underline">
            ← Retour à l’édition
          </Link>
        </div>
      </div>
      <article className="pt-12 pb-24">
        <ProjectDetail
          p={p}
          t={dictionaryFor(locale)}
          locale={locale}
          backHref={`/admin/projects/${id}`}
        />
      </article>
    </>
  )
}
