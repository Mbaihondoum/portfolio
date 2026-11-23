import { getDictionary } from '@/i18n'
import { getPublishedProjects, getSettings } from '@/server/services/content'
import { toSettings } from '@/server/services/dto'
import { getLocale } from '@/i18n'

export default async function HomePage() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const settings = toSettings(await getSettings(), locale)
  const projects = await getPublishedProjects()
  return (
    <main className="container-page py-20">
      <h1 className="text-5xl font-bold">{settings.fullName}</h1>
      <p className="text-muted">{settings.headline}</p>
      <p>
        {t.hero.ctaProjects} ({projects.length})
      </p>
    </main>
  )
}
