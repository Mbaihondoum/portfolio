import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/page-header'
import { EMPTY_PROJECT, ProjectForm } from '@/components/admin/project-form'

export const metadata: Metadata = { title: 'Nouveau projet' }

export default function NewProjectPage() {
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
