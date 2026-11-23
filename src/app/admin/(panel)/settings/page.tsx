import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/page-header'
import { SettingsForm } from '@/components/admin/settings-form'
import { settingsRepository } from '@/server/repositories'
import { DEFAULT_SETTINGS } from '@/server/services/defaults'

export const metadata: Metadata = { title: 'Paramètres' }

export default async function SettingsPage() {
  const s = (await settingsRepository.get()) ?? DEFAULT_SETTINGS
  return (
    <>
      <PageHeader
        title="Paramètres du site"
        description="Remplacez ici tous les textes marqués [À REMPLACER]. Les changements sont visibles immédiatement."
      />
      <SettingsForm
        initial={{
          fullName: s.fullName,
          initials: s.initials,
          headline: s.headline,
          tagline: s.tagline,
          bio: s.bio,
          approach: s.approach,
          location: s.location,
          availability: s.availability,
          email: s.email,
          githubUrl: s.githubUrl,
          linkedinUrl: s.linkedinUrl,
          whatsapp: s.whatsapp,
          cvUrlFr: s.cvUrlFr,
          cvUrlEn: s.cvUrlEn,
          keyFigures: s.keyFigures,
        }}
      />
    </>
  )
}
