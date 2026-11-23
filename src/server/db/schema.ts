import { relations, sql } from 'drizzle-orm'
import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import type { ArchitectureDiagram, KeyFigure, Localized, ProjectChart } from '@/lib/types'

/* ── Enums ──────────────────────────────────────────────────────────────── */

export const projectCategory = pgEnum('project_category', ['web', 'mobile', 'data', 'fullstack'])
export const publicationStatus = pgEnum('publication_status', ['draft', 'published'])
export const imageKind = pgEnum('image_kind', ['screenshot', 'dashboard', 'chart'])
export const skillCategory = pgEnum('skill_category', [
  'frontend',
  'backend_db',
  'mobile',
  'data_bi',
  'tools_devops',
])
export const experienceType = pgEnum('experience_type', ['work', 'education'])
export const messageStatus = pgEnum('message_status', ['new', 'read', 'archived'])
export const deviceType = pgEnum('device_type', ['mobile', 'tablet', 'desktop'])

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

const localized = (name: string) =>
  jsonb(name)
    .$type<Localized>()
    .notNull()
    .default(sql`'{"fr":"","en":""}'::jsonb`)

/* ── Projects ───────────────────────────────────────────────────────────── */

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    title: localized('title'),
    summary: localized('summary'),
    problem: localized('problem'),
    solution: localized('solution'),
    role: localized('role'),
    description: localized('description'),
    category: projectCategory('category').notNull(),
    stack: text('stack')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    coverImage: text('cover_image'),
    coverAlt: localized('cover_alt'),
    demoUrl: text('demo_url'),
    repoUrl: text('repo_url'),
    powerBiEmbedUrl: text('power_bi_embed_url'),
    architecture: jsonb('architecture').$type<ArchitectureDiagram | null>(),
    charts: jsonb('charts')
      .$type<ProjectChart[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    status: publicationStatus('status').notNull().default('draft'),
    featured: boolean('featured').notNull().default(false),
    isSample: boolean('is_sample').notNull().default(false),
    position: integer('position').notNull().default(0),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('projects_status_position_idx').on(t.status, t.position)],
)

export const projectMetrics = pgTable(
  'project_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    value: integer('value').notNull(),
    prefix: varchar('prefix', { length: 8 }).notNull().default(''),
    suffix: varchar('suffix', { length: 8 }).notNull().default(''),
    label: localized('label'),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('project_metrics_project_idx').on(t.projectId)],
)

export const projectImages = pgTable(
  'project_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: localized('alt'),
    kind: imageKind('kind').notNull().default('screenshot'),
    width: integer('width').notNull().default(1600),
    height: integer('height').notNull().default(1000),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('project_images_project_idx').on(t.projectId)],
)

export const projectsRelations = relations(projects, ({ many }) => ({
  metrics: many(projectMetrics),
  images: many(projectImages),
}))

export const projectMetricsRelations = relations(projectMetrics, ({ one }) => ({
  project: one(projects, { fields: [projectMetrics.projectId], references: [projects.id] }),
}))

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, { fields: [projectImages.projectId], references: [projects.id] }),
}))

/* ── Skills & experiences ───────────────────────────────────────────────── */

export const skills = pgTable(
  'skills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 60 }).notNull(),
    category: skillCategory('category').notNull(),
    inMarquee: boolean('in_marquee').notNull().default(false),
    position: integer('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('skills_category_position_idx').on(t.category, t.position)],
)

export const experiences = pgTable('experiences', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: experienceType('type').notNull(),
  title: localized('title'),
  organization: varchar('organization', { length: 160 }).notNull(),
  location: varchar('location', { length: 120 }).notNull().default(''),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  description: localized('description'),
  position: integer('position').notNull().default(0),
  ...timestamps,
})

/* ── Contact ────────────────────────────────────────────────────────────── */

export const contactMessages = pgTable(
  'contact_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    subject: varchar('subject', { length: 160 }).notNull(),
    message: text('message').notNull(),
    locale: varchar('locale', { length: 2 }).notNull().default('fr'),
    status: messageStatus('status').notNull().default('new'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('contact_messages_status_created_idx').on(t.status, t.createdAt)],
)

/* ── Analytics (no personal data: no IP, no cookie, no user id) ─────────── */

export const pageViews = pgTable(
  'page_views',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    path: varchar('path', { length: 300 }).notNull(),
    projectSlug: varchar('project_slug', { length: 120 }),
    locale: varchar('locale', { length: 2 }).notNull(),
    country: varchar('country', { length: 2 }),
    device: deviceType('device').notNull(),
    referrerHost: varchar('referrer_host', { length: 200 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('page_views_created_idx').on(t.createdAt),
    index('page_views_project_idx').on(t.projectSlug),
  ],
)

/* ── Rate limiting (fixed window, key = HMAC of IP + bucket) ────────────── */

export const rateLimits = pgTable(
  'rate_limits',
  {
    key: varchar('key', { length: 128 }).notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    count: smallint('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
)

/* ── Site settings (single row, id = 1) ─────────────────────────────────── */

export const siteSettings = pgTable('site_settings', {
  id: smallint('id').primaryKey().default(1),
  fullName: varchar('full_name', { length: 120 }).notNull(),
  initials: varchar('initials', { length: 4 }).notNull(),
  headline: localized('headline'),
  tagline: localized('tagline'),
  bio: localized('bio'),
  approach: localized('approach'),
  location: varchar('location', { length: 120 }).notNull().default(''),
  availability: localized('availability'),
  email: varchar('email', { length: 254 }).notNull(),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  whatsapp: varchar('whatsapp', { length: 32 }),
  cvUrlFr: text('cv_url_fr'),
  cvUrlEn: text('cv_url_en'),
  keyFigures: jsonb('key_figures')
    .$type<KeyFigure[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type ProjectMetric = typeof projectMetrics.$inferSelect
export type ProjectImage = typeof projectImages.$inferSelect
export type Skill = typeof skills.$inferSelect
export type Experience = typeof experiences.$inferSelect
export type ContactMessage = typeof contactMessages.$inferSelect
export type SiteSettings = typeof siteSettings.$inferSelect
