import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/page-header'
import { EMPTY_PROJECT, ProjectForm } from '@/components/admin/project-form'
import { requireAdmin } from '@/server/auth'

export const metadata: Metadata = { title: 'Nouveau projet' }

export default async function NewProjectPage() {
  await requireAdmin()
  return (
    <>
      <PageHeader
        title="Nouveau projet"
        description="Enregistrez en brouillon, publiez quand tout est prêt."
      />
      <ProjectForm initial={EMPTY_PROJECT} />
    </>
  )
}
