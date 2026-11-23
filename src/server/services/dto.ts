import { pick, type Locale } from '@/lib/types'
import type { ProjectWithRelations } from '@/server/repositories/projects'
import type { Experience, SiteSettings, Skill } from '@/server/db/schema'

/** Localized, public-safe representations (no internal fields). */

export type PublicProjectSummary = ReturnType<typeof toProjectSummary>
export type PublicProject = ReturnType<typeof toProject>
export type PublicSkill = ReturnType<typeof toSkill>
export type PublicExperience = ReturnType<typeof toExperience>
export type PublicSettings = ReturnType<typeof toSettings>

export function toProjectSummary(p: ProjectWithRelations, locale: Locale) {
  return {
    slug: p.slug,
    title: pick(p.title, locale),
    summary: pick(p.summary, locale),
    category: p.category,
    stack: p.stack,
    coverImage: p.coverImage,
    coverAlt: pick(p.coverAlt, locale) || pick(p.title, locale),
    isSample: p.isSample,
    featured: p.featured,
    metrics: p.metrics.map((m) => ({
      value: m.value,
      prefix: m.prefix,
      suffix: m.suffix,
      label: pick(m.label, locale),
    })),
  }
}

export function toProject(p: ProjectWithRelations, locale: Locale) {
  return {
    ...toProjectSummary(p, locale),
    problem: pick(p.problem, locale),
    solution: pick(p.solution, locale),
    role: pick(p.role, locale),
    description: pick(p.description, locale),
    demoUrl: p.demoUrl,
    repoUrl: p.repoUrl,
    powerBiEmbedUrl: p.powerBiEmbedUrl,
    architecture: p.architecture,
    charts: p.charts.map((c) => ({ ...c, title: pick(c.title, locale) })),
    images: p.images.map((img) => ({
      url: img.url,
      alt: pick(img.alt, locale),
      kind: img.kind,
      width: img.width,
      height: img.height,
    })),
    publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
    updatedAt: new Date(p.updatedAt).toISOString(),
  }
}

export function toSkill(s: Skill) {
  return { name: s.name, category: s.category, inMarquee: s.inMarquee }
}

export function toExperience(e: Experience, locale: Locale) {
  return {
    id: e.id,
    type: e.type,
    title: pick(e.title, locale),
    organization: e.organization,
    location: e.location,
    startDate: e.startDate,
    endDate: e.endDate,
    description: pick(e.description, locale),
  }
}

export function toSettings(s: SiteSettings, locale: Locale) {
  return {
    fullName: s.fullName,
    initials: s.initials,
    headline: pick(s.headline, locale),
    tagline: pick(s.tagline, locale),
    bio: pick(s.bio, locale),
    approach: pick(s.approach, locale),
    location: s.location,
    availability: pick(s.availability, locale),
    email: s.email,
    githubUrl: s.githubUrl,
    linkedinUrl: s.linkedinUrl,
    whatsapp: s.whatsapp,
    cvUrl: (locale === 'en' ? s.cvUrlEn : s.cvUrlFr) ?? s.cvUrlFr ?? s.cvUrlEn,
    keyFigures: s.keyFigures.map((k) => ({
      value: k.value,
      suffix: k.suffix ?? '',
      label: pick(k.label, locale),
    })),
  }
}
