import { z } from 'zod'
import { ARCHITECTURE_LAYERS, PROJECT_CATEGORIES, SKILL_CATEGORIES } from '@/lib/types'
import { assetUrl, localizedSchema, optionalUrl, slugSchema } from './common'

export const architectureSchema = z
  .object({
    nodes: z
      .array(
        z.object({
          id: z.string().min(1).max(40),
          label: z.string().min(1).max(60),
          layer: z.enum(ARCHITECTURE_LAYERS),
        }),
      )
      .max(20),
    edges: z
      .array(
        z.object({
          from: z.string().min(1),
          to: z.string().min(1),
          label: z.string().max(40).optional(),
        }),
      )
      .max(40),
  })
  .refine(
    (d) => {
      const ids = new Set(d.nodes.map((n) => n.id))
      return d.edges.every((e) => ids.has(e.from) && ids.has(e.to))
    },
    { message: 'edgeUnknownNode' },
  )

export const chartSchema = z
  .object({
    id: z.string().min(1).max(40),
    type: z.enum(['line', 'bar']),
    title: localizedSchema({ max: 120 }),
    unit: z.string().max(12).optional(),
    labels: z.array(z.string().max(24)).min(2).max(24),
    values: z.array(z.number().finite()).min(2).max(24),
  })
  .refine((c) => c.labels.length === c.values.length, { message: 'chartLengthMismatch' })

export const metricSchema = z.object({
  value: z.coerce.number().int().min(0).max(1_000_000_000),
  prefix: z.string().max(8).default(''),
  suffix: z.string().max(8).default(''),
  label: localizedSchema({ required: true, max: 80 }),
})

export const projectImageSchema = z.object({
  url: z.string().min(1).max(2000),
  alt: localizedSchema({ max: 200 }),
  kind: z.enum(['screenshot', 'dashboard', 'chart']).default('screenshot'),
  width: z.coerce.number().int().min(1).max(10000).default(1600),
  height: z.coerce.number().int().min(1).max(10000).default(1000),
})

export const projectInputSchema = z.object({
  slug: slugSchema,
  title: localizedSchema({ required: true, max: 120 }),
  summary: localizedSchema({ required: true, max: 300 }),
  problem: localizedSchema({ max: 3000 }),
  solution: localizedSchema({ max: 3000 }),
  role: localizedSchema({ max: 1000 }),
  description: localizedSchema({ max: 10000 }),
  category: z.enum(PROJECT_CATEGORIES),
  stack: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  coverImage: assetUrl,
  coverAlt: localizedSchema({ max: 200 }),
  demoUrl: optionalUrl,
  repoUrl: optionalUrl,
  powerBiEmbedUrl: optionalUrl.refine(
    (v) => v === null || /^https:\/\/app\.powerbi\.com\//.test(v),
    'invalidPowerBiUrl',
  ),
  architecture: architectureSchema.nullable().default(null),
  charts: z.array(chartSchema).max(6).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  isSample: z.boolean().default(false),
  metrics: z.array(metricSchema).max(6).default([]),
  images: z.array(projectImageSchema).max(20).default([]),
})
export type ProjectInput = z.output<typeof projectInputSchema>

export const skillInputSchema = z.object({
  name: z.string().trim().min(1, 'required').max(60, 'tooLong'),
  category: z.enum(SKILL_CATEGORIES),
  inMarquee: z.boolean().default(false),
})
export type SkillInput = z.output<typeof skillInputSchema>

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'invalidDate')

export const experienceInputSchema = z
  .object({
    type: z.enum(['work', 'education']),
    title: localizedSchema({ required: true, max: 160 }),
    organization: z.string().trim().min(1, 'required').max(160),
    location: z.string().trim().max(120).default(''),
    startDate: isoDate,
    endDate: z
      .union([isoDate, z.literal('')])
      .nullish()
      .transform((v) => (v ? v : null)),
    description: localizedSchema({ max: 3000 }),
  })
  .refine((e) => !e.endDate || e.endDate >= e.startDate, {
    message: 'endBeforeStart',
    path: ['endDate'],
  })
export type ExperienceInput = z.output<typeof experienceInputSchema>

export const keyFigureSchema = z.object({
  value: z.coerce.number().int().min(0).max(1_000_000),
  suffix: z.string().max(4).optional(),
  label: localizedSchema({ required: true, max: 60 }),
})

export const settingsInputSchema = z.object({
  fullName: z.string().trim().min(1, 'required').max(120),
  initials: z.string().trim().min(1, 'required').max(4),
  headline: localizedSchema({ required: true, max: 160 }),
  tagline: localizedSchema({ required: true, max: 300 }),
  bio: localizedSchema({ max: 4000 }),
  approach: localizedSchema({ max: 4000 }),
  location: z.string().trim().max(120).default(''),
  availability: localizedSchema({ max: 160 }),
  email: z.email('invalidEmail'),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  whatsapp: z
    .string()
    .nullish()
    .transform((v) => v ?? '')
    .pipe(
      z
        .string()
        .trim()
        .regex(/^(\+?[0-9 ]{6,20})?$/, 'invalidPhone'),
    )
    .transform((v) => (v ? v.replace(/\s/g, '') : null)),
  cvUrlFr: assetUrl,
  cvUrlEn: assetUrl,
  keyFigures: z.array(keyFigureSchema).max(4).default([]),
})
export type SettingsInput = z.output<typeof settingsInputSchema>

export const reorderSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(500),
})
