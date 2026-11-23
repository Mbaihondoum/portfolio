import type { Dictionary } from '@/i18n'
import type { Locale } from '@/lib/types'
import type { PublicProjectSummary } from '@/server/services/dto'
import { ProjectsGrid } from '@/components/projects/projects-grid'
import { SectionHeading } from './section-heading'

export function Projects({
  t,
  projects,
  locale,
}: {
  t: Dictionary
  projects: PublicProjectSummary[]
  locale: Locale
}) {
  return (
    <section id="projects" className="scroll-mt-20 py-24 sm:py-32" aria-label={t.projects.title}>
      <div className="container-page">
        <SectionHeading index={3} eyebrow={t.projects.title} title={t.projects.lead} />
        <ProjectsGrid
          projects={projects}
          locale={locale}
          labels={{
            filterLabel: t.projects.filterLabel,
            filters: t.projects.filters,
            empty: t.projects.empty,
            sample: t.projects.sample,
            viewProject: t.projects.viewProject,
          }}
        />
      </div>
    </section>
  )
}
