import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/page-header'
import { ProjectsTable } from '@/components/admin/projects-table'
import { LinkButton } from '@/components/ui/button'
import { projectsRepository } from '@/server/repositories'

export const metadata: Metadata = { title: 'Projets' }

export default async function ProjectsAdminPage() {
  const projects = await projectsRepository.listAll()
  return (
    <>
      <PageHeader
        title="Projets"
        description="L’ordre ci-dessous est celui du site. Les projets « Exemple » sont à remplacer par vos réalisations."
        actions={<LinkButton href="/admin/projects/new">Nouveau projet</LinkButton>}
      />
      <ProjectsTable
        rows={projects.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title.fr || p.title.en,
          category: p.category,
          status: p.status,
          isSample: p.isSample,
          featured: p.featured,
        }))}
      />
    </>
  )
}
