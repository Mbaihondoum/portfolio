import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/page-header'
import { SkillsManager } from '@/components/admin/skills-manager'
import { skillsRepository } from '@/server/repositories'

export const metadata: Metadata = { title: 'Compétences' }

export default async function SkillsAdminPage() {
  const skills = await skillsRepository.list()
  return (
    <>
      <PageHeader
        title="Compétences"
        description="Affichées en badges groupés par catégorie, dans cet ordre."
      />
      <SkillsManager
        skills={skills.map(({ id, name, category, inMarquee }) => ({
          id,
          name,
          category,
          inMarquee,
        }))}
      />
    </>
  )
}
