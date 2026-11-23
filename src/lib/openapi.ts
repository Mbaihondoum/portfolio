import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { PROJECT_CATEGORIES, SKILL_CATEGORIES } from '@/lib/types'
import { contactSchema } from '@/lib/validators'

/**
 * OpenAPI 3.1 document generated from the same Zod schemas used for runtime
 * validation, so the docs cannot drift from the implementation.
 */
const registry = new OpenAPIRegistry()

const Locale = z.enum(['fr', 'en']).meta({ description: 'Content language', example: 'fr' })

const Metric = z.object({
  value: z.number().int(),
  prefix: z.string(),
  suffix: z.string(),
  label: z.string(),
})

const ProjectSummary = z
  .object({
    slug: z.string().meta({ example: 'ngo-management-platform' }),
    title: z.string(),
    summary: z.string(),
    category: z.enum(PROJECT_CATEGORIES),
    stack: z.array(z.string()),
    coverImage: z.string().nullable(),
    coverAlt: z.string(),
    isSample: z.boolean().meta({ description: 'True for placeholder example projects' }),
    featured: z.boolean(),
    metrics: z.array(Metric),
  })
  .meta({ id: 'ProjectSummary' })

const Project = ProjectSummary.extend({
  problem: z.string(),
  solution: z.string(),
  role: z.string(),
  description: z.string().meta({ description: 'Markdown' }),
  demoUrl: z.string().nullable(),
  repoUrl: z.string().nullable(),
  powerBiEmbedUrl: z.string().nullable(),
  architecture: z
    .object({
      nodes: z.array(z.object({ id: z.string(), label: z.string(), layer: z.string() })),
      edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional() })),
    })
    .nullable(),
  charts: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['line', 'bar']),
      title: z.string(),
      unit: z.string().optional(),
      labels: z.array(z.string()),
      values: z.array(z.number()),
    }),
  ),
  images: z.array(
    z.object({
      url: z.string(),
      alt: z.string(),
      kind: z.enum(['screenshot', 'dashboard', 'chart']),
      width: z.number().int(),
      height: z.number().int(),
    }),
  ),
  publishedAt: z.string().nullable(),
  updatedAt: z.string(),
}).meta({ id: 'Project' })

const Skill = z
  .object({ name: z.string(), category: z.enum(SKILL_CATEGORIES), inMarquee: z.boolean() })
  .meta({ id: 'Skill' })

const ApiError = z
  .object({ error: z.object({ code: z.string(), message: z.string() }) })
  .meta({ id: 'Error' })

const Health = z
  .object({
    status: z.enum(['ok', 'degraded']),
    version: z.string(),
    uptimeSeconds: z.number(),
    checks: z.object({
      database: z.object({ status: z.enum(['up', 'down']), latencyMs: z.number().optional() }),
    }),
    timestamp: z.string(),
  })
  .meta({ id: 'Health' })

const json = <T extends z.ZodType>(schema: T, description: string) => ({
  description,
  content: { 'application/json': { schema } },
})

registry.registerPath({
  method: 'get',
  path: '/api/projects',
  summary: 'List published projects',
  tags: ['Projects'],
  request: {
    query: z.object({
      locale: Locale.optional(),
      category: z.enum(PROJECT_CATEGORIES).optional(),
    }),
  },
  responses: {
    200: json(z.object({ data: z.array(ProjectSummary) }), 'Published projects, ordered'),
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/projects/{slug}',
  summary: 'Get a published project',
  tags: ['Projects'],
  request: {
    params: z.object({ slug: z.string() }),
    query: z.object({ locale: Locale.optional() }),
  },
  responses: {
    200: json(z.object({ data: Project }), 'Project details'),
    404: json(ApiError, 'Not found'),
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/skills',
  summary: 'List skills grouped by category',
  tags: ['Skills'],
  responses: { 200: json(z.object({ data: z.array(Skill) }), 'Skills') },
})

registry.registerPath({
  method: 'post',
  path: '/api/contact',
  summary: 'Send a contact message',
  description:
    'Validated with Zod, protected by a honeypot, a fill-time check, optional Turnstile and rate limiting (5 requests / 10 min / IP). Same-origin only.',
  tags: ['Contact'],
  request: { body: { content: { 'application/json': { schema: contactSchema } } } },
  responses: {
    200: json(z.object({ ok: z.literal(true) }), 'Message accepted'),
    400: json(ApiError, 'Validation error'),
    403: json(ApiError, 'Forbidden origin or captcha failed'),
    429: json(ApiError, 'Too many requests'),
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/health',
  summary: 'Health check',
  tags: ['Ops'],
  responses: { 200: json(Health, 'Healthy'), 503: json(Health, 'Database unreachable') },
})

export function buildOpenApiDocument(serverUrl: string) {
  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Portfolio public API',
      version: '1.0.0',
      description: 'Read-only content API and contact endpoint of the portfolio.',
    },
    servers: [{ url: serverUrl }],
  })
}
