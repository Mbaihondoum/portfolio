import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/page-header'
import { ProjectForm } from '@/components/admin/project-form'
import { uuidSchema } from '@/lib/validators'
import { projectsRepository } from '@/server/repositories'
import { requireAdmin } from '@/server/auth'

export const metadata: Metadata = { title: 'Modifier le projet' }

export default async function EditProjectPage({ params }: PageProps<'/admin/projects/[id]'>) {
  await requireAdmin()
  const { id } = await params
  if (!uuidSchema.safeParse(id).success) notFound()
  const p = await projectsRepository.findById(id)
  if (!p) notFound()
  return (
    <>
      <PageHeader title={p.title.fr || p.title.en} description={`/${p.slug}`} />
      <ProjectForm
        id={p.id}
        initial={{
          slug: p.slug,
          title: p.title,
          summary: p.summary,
          problem: p.problem,
          solution: p.solution,
          role: p.role,
          description: p.description,
          category: p.category,
          stack: p.stack,
          coverImage: p.coverImage,
          coverAlt: p.coverAlt,
          demoUrl: p.demoUrl,
          repoUrl: p.repoUrl,
          powerBiEmbedUrl: p.powerBiEmbedUrl,
          architecture: p.architecture,
          charts: p.charts,
          status: p.status,
          featured: p.featured,
          isSample: p.isSample,
          metrics: p.metrics.map(({ value, prefix, suffix, label }) => ({
            value,
            prefix,
            suffix,
            label,
          })),
          images: p.images.map(({ url, alt, kind, width, height }) => ({
            url,
            alt,
            kind,
            width,
            height,
          })),
        }}
      />
    </>
  )
}
