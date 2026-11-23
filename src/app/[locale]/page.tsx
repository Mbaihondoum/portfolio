import { ViewTransition } from 'react'
import { getDictionary, getLocale } from '@/i18n'
import {
  getExperiences,
  getPublishedProjects,
  getSettings,
  getSkills,
} from '@/server/services/content'
import { toExperience, toProjectSummary, toSettings, toSkill } from '@/server/services/dto'
import { personJsonLd } from '@/lib/seo'
import { Intro } from '@/components/layout/intro'
import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { Skills } from '@/components/sections/skills'
import { Projects } from '@/components/sections/projects'
import { Experience } from '@/components/sections/experience'
import { Services } from '@/components/sections/services'
import { UnderTheHood } from '@/components/sections/under-the-hood'
import { Contact } from '@/components/sections/contact'

export default async function HomePage() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const [rawSettings, projects, skills, experiences] = await Promise.all([
    getSettings(),
    getPublishedProjects(),
    getSkills(),
    getExperiences(),
  ])
  const settings = toSettings(rawSettings, locale)
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJsonLd(settings, locale) }}
        />
        <Intro initials={settings.initials} skipLabel={t.intro.skip} />
        <Hero t={t} settings={settings} locale={locale} />
        <About t={t} settings={settings} locale={locale} />
        <Skills t={t} skills={skills.map(toSkill)} />
        <Projects
          t={t}
          projects={projects.map((p) => toProjectSummary(p, locale))}
          locale={locale}
        />
        <Experience t={t} items={experiences.map((e) => toExperience(e, locale))} locale={locale} />
        <Services t={t} />
        <UnderTheHood t={t} locale={locale} />
        <Contact t={t} settings={settings} locale={locale} />
      </div>
    </ViewTransition>
  )
}
