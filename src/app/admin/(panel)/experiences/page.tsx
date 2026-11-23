import type { Metadata } from 'next'
import { ExperienceManager } from '@/components/admin/experience-manager'
import { PageHeader } from '@/components/admin/page-header'
import { experiencesRepository } from '@/server/repositories'

export const metadata: Metadata = { title: 'Parcours' }

export default async function ExperiencesAdminPage() {
  const items = await experiencesRepository.list()
  return (
    <>
      <PageHeader
        title="Parcours"
        description="Expériences et formations affichées dans la timeline, dans cet ordre."
      />
      <ExperienceManager
        items={items.map((e) => ({
          id: e.id,
          type: e.type,
          title: e.title,
          organization: e.organization,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate ?? '',
          description: e.description,
        }))}
      />
    </>
  )
}
