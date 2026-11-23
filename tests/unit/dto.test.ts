import { describe, expect, it } from 'vitest'
import { toProject, toSettings } from '@/server/services/dto'
import { DEFAULT_SETTINGS } from '@/server/services/defaults'
import { sampleProjects } from '@/server/db/seed'
import type { ProjectWithRelations } from '@/server/repositories/projects'

function fakeProject(): ProjectWithRelations {
  const p = sampleProjects[0]!
  const { metrics, images, featured, ...fields } = p
  return {
    ...fields,
    id: '00000000-0000-0000-0000-000000000001',
    featured: featured ?? false,
    status: 'published',
    isSample: true,
    position: 0,
    publishedAt: new Date('2025-01-01'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
    metrics: metrics.map((m, i) => ({ ...m, id: `m${i}`, projectId: 'x', position: i })),
    images: images.map((img, i) => ({ ...img, id: `i${i}`, projectId: 'x', position: i })),
  } as ProjectWithRelations
}

describe('DTO mapping', () => {
  it('localizes a project and hides internal fields', () => {
    const en = toProject(fakeProject(), 'en')
    expect(en.title).toMatch(/^\[SAMPLE\]/)
    expect(en.charts[0]?.title).toMatch(/fictional/)
    expect(en).not.toHaveProperty('id')
    expect(en).not.toHaveProperty('status')
    expect(toProject(fakeProject(), 'fr').title).toMatch(/^\[EXEMPLE\]/)
  })

  it('falls back to the other language when a translation is missing', () => {
    const s = toSettings({ ...DEFAULT_SETTINGS, bio: { fr: 'Bonjour', en: '' } }, 'en')
    expect(s.bio).toBe('Bonjour')
  })

  it('picks the CV for the current locale with fallback', () => {
    const s = toSettings({ ...DEFAULT_SETTINGS, cvUrlFr: '/cv-fr.pdf', cvUrlEn: null }, 'en')
    expect(s.cvUrl).toBe('/cv-fr.pdf')
  })
})
