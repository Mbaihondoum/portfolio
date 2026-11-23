import { describe, expect, it } from 'vitest'
import {
  contactSchema,
  experienceInputSchema,
  projectInputSchema,
  settingsInputSchema,
} from '@/lib/validators'

const validContact = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Mission freelance',
  message: 'Bonjour, je souhaite discuter d’un projet de tableau de bord.',
  locale: 'fr',
}

describe('contactSchema', () => {
  it('accepts a valid message and trims fields', () => {
    const parsed = contactSchema.parse({ ...validContact, name: '  Ada  ' })
    expect(parsed.name).toBe('Ada')
    expect(parsed.website).toBe('')
  })

  it('returns error codes usable as translation keys', () => {
    const result = contactSchema.safeParse({ ...validContact, email: 'nope', message: 'court' })
    expect(result.success).toBe(false)
    const messages = result.error!.issues.map((i) => `${String(i.path[0])}:${i.message}`)
    expect(messages).toContain('email:invalidEmail')
    expect(messages).toContain('message:tooShort')
  })

  it('rejects a filled honeypot', () => {
    expect(contactSchema.safeParse({ ...validContact, website: 'http://spam' }).success).toBe(false)
  })

  it('rejects an unknown locale', () => {
    expect(contactSchema.safeParse({ ...validContact, locale: 'de' }).success).toBe(false)
  })
})

const baseProject = {
  slug: 'my-project',
  title: { fr: 'Titre', en: 'Title' },
  summary: { fr: 'Résumé', en: 'Summary' },
  problem: { fr: '', en: '' },
  solution: { fr: '', en: '' },
  role: { fr: '', en: '' },
  description: { fr: '', en: '' },
  coverAlt: { fr: '', en: '' },
  category: 'web',
}

describe('projectInputSchema', () => {
  it('applies defaults', () => {
    const p = projectInputSchema.parse(baseProject)
    expect(p.status).toBe('draft')
    expect(p.stack).toEqual([])
    expect(p.demoUrl).toBeNull()
  })

  it('rejects invalid slugs', () => {
    expect(projectInputSchema.safeParse({ ...baseProject, slug: 'Bad Slug' }).success).toBe(false)
    expect(projectInputSchema.safeParse({ ...baseProject, slug: '-bad' }).success).toBe(false)
  })

  it('only accepts Power BI embed URLs from app.powerbi.com', () => {
    expect(
      projectInputSchema.safeParse({ ...baseProject, powerBiEmbedUrl: 'https://evil.com/x' })
        .success,
    ).toBe(false)
    expect(
      projectInputSchema.safeParse({
        ...baseProject,
        powerBiEmbedUrl: 'https://app.powerbi.com/view?r=abc',
      }).success,
    ).toBe(true)
  })

  it('rejects javascript: URLs', () => {
    expect(
      projectInputSchema.safeParse({ ...baseProject, demoUrl: 'javascript:alert(1)' }).success,
    ).toBe(false)
  })

  it('rejects architecture edges pointing to unknown nodes', () => {
    const result = projectInputSchema.safeParse({
      ...baseProject,
      architecture: {
        nodes: [{ id: 'a', label: 'A', layer: 'client' }],
        edges: [{ from: 'a', to: 'b' }],
      },
    })
    expect(result.success).toBe(false)
  })

  it('requires chart labels and values of equal length', () => {
    const chart = {
      id: 'c',
      type: 'bar',
      title: { fr: 'a', en: 'a' },
      labels: ['a', 'b'],
      values: [1],
    }
    expect(projectInputSchema.safeParse({ ...baseProject, charts: [chart] }).success).toBe(false)
  })
})

describe('experienceInputSchema', () => {
  const exp = {
    type: 'work',
    title: { fr: 'Dev', en: 'Dev' },
    organization: 'ACME',
    startDate: '2022-01-01',
    endDate: '',
    description: { fr: '', en: '' },
  }
  it('turns an empty end date into null (current position)', () => {
    expect(experienceInputSchema.parse(exp).endDate).toBeNull()
  })
  it('rejects an end date before the start date', () => {
    expect(experienceInputSchema.safeParse({ ...exp, endDate: '2021-01-01' }).success).toBe(false)
  })
})

describe('settingsInputSchema', () => {
  it('normalises whatsapp numbers', () => {
    const s = settingsInputSchema.parse({
      fullName: 'A B',
      initials: 'AB',
      headline: { fr: 'x', en: 'x' },
      tagline: { fr: 'x', en: 'x' },
      bio: { fr: '', en: '' },
      approach: { fr: '', en: '' },
      availability: { fr: '', en: '' },
      email: 'a@b.co',
      whatsapp: '+33 6 12 34 56 78',
    })
    expect(s.whatsapp).toBe('+33612345678')
  })
})
