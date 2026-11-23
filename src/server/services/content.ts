import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { logger } from '@/server/logger'
import {
  experiencesRepository,
  projectsRepository,
  settingsRepository,
  skillsRepository,
} from '@/server/repositories'
import { TAGS } from '@/server/cache-tags'
import { DEFAULT_SETTINGS } from './defaults'

/**
 * Public, cached reads. Content only changes through the admin, which
 * invalidates the matching tags, so entries can live for a long time.
 *
 * If the database is unreachable while prerendering (e.g. a Docker image
 * build without DB access), we fall back to empty content with a short
 * lifetime instead of failing the build.
 */
async function guarded<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      logger.warn('content.build_fallback', { label, err })
      cacheLife('minutes')
      return fallback
    }
    throw err
  }
}

export async function getPublishedProjects() {
  'use cache'
  cacheLife('max')
  cacheTag(TAGS.projects)
  return guarded('projects', [], () => projectsRepository.listPublished())
}

export async function getPublishedProject(slug: string) {
  'use cache'
  cacheLife('max')
  cacheTag(TAGS.projects, TAGS.project(slug))
  return guarded('project', undefined, () => projectsRepository.findPublishedBySlug(slug))
}

export async function getSkills() {
  'use cache'
  cacheLife('max')
  cacheTag(TAGS.skills)
  return guarded('skills', [], () => skillsRepository.list())
}

export async function getExperiences() {
  'use cache'
  cacheLife('max')
  cacheTag(TAGS.experiences)
  return guarded('experiences', [], () => experiencesRepository.list())
}

export async function getSettings() {
  'use cache'
  cacheLife('max')
  cacheTag(TAGS.settings)
  const row = await guarded('settings', undefined, () => settingsRepository.get())
  return row ?? DEFAULT_SETTINGS
}
