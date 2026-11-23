/** Shared domain types (used by DB schema, validators, UI). */

export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

export type Localized = Record<Locale, string>

export const PROJECT_CATEGORIES = ['web', 'mobile', 'data', 'fullstack'] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export const SKILL_CATEGORIES = [
  'frontend',
  'backend_db',
  'mobile',
  'data_bi',
  'tools_devops',
] as const
export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

export const ARCHITECTURE_LAYERS = ['client', 'api', 'data', 'infra', 'external'] as const
export type ArchitectureLayer = (typeof ARCHITECTURE_LAYERS)[number]

export type ArchitectureNode = { id: string; label: string; layer: ArchitectureLayer }
export type ArchitectureEdge = { from: string; to: string; label?: string }
export type ArchitectureDiagram = { nodes: ArchitectureNode[]; edges: ArchitectureEdge[] }

export type ProjectChart = {
  id: string
  type: 'line' | 'bar'
  title: Localized
  unit?: string
  labels: string[]
  values: number[]
}

export type KeyFigure = { value: number; suffix?: string; label: Localized }

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export function pick(value: Localized, locale: Locale): string {
  return value[locale] || value.fr || value.en || ''
}
