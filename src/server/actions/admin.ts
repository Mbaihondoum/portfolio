'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'
import {
  experienceInputSchema,
  projectInputSchema,
  reorderSchema,
  settingsInputSchema,
  skillInputSchema,
  uuidSchema,
} from '@/lib/validators'
import { assertAdmin, signOut } from '@/server/auth'
import { TAGS } from '@/server/cache-tags'
import { logger } from '@/server/logger'
import {
  experiencesRepository,
  messagesRepository,
  projectsRepository,
  settingsRepository,
  skillsRepository,
} from '@/server/repositories'
import { toFieldErrors, type ActionResult } from './result'

/**
 * Admin mutations. Every action: (1) re-checks the admin session (defence in
 * depth on top of the proxy), (2) validates input with Zod, (3) writes through
 * a repository, (4) expires the cache tags of the public pages it affects.
 * Server Actions also get Next.js' built-in Origin check (CSRF).
 */
async function run<T>(name: string, fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    await assertAdmin()
  } catch {
    return { ok: false, error: 'unauthorized' }
  }
  try {
    return await fn()
  } catch (err) {
    logger.error('admin.action_failed', { action: name, err })
    return { ok: false, error: 'server' }
  }
}

const idArg = (id: unknown) => uuidSchema.parse(id)

/* ── Projects ───────────────────────────────────────────────────────── */

export async function saveProject(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  return run('saveProject', async () => {
    const parsed = projectInputSchema.safeParse(input)
    if (!parsed.success)
      return { ok: false, error: 'validation', fieldErrors: toFieldErrors(parsed.error) }
    const projectId = id ? idArg(id) : undefined
    if (await projectsRepository.slugExists(parsed.data.slug, projectId)) {
      return { ok: false, error: 'validation', fieldErrors: { slug: 'slugTaken' } }
    }
    const previous = projectId ? await projectsRepository.findById(projectId) : undefined
    const saved = await projectsRepository.save(parsed.data, projectId)
    updateTag(TAGS.projects)
    updateTag(TAGS.project(saved.slug))
    if (previous && previous.slug !== saved.slug) updateTag(TAGS.project(previous.slug))
    return { ok: true, data: { id: saved.id } }
  })
}

export async function setProjectStatus(
  id: string,
  status: 'draft' | 'published',
): Promise<ActionResult> {
  return run('setProjectStatus', async () => {
    const row = await projectsRepository.setStatus(
      idArg(id),
      z.enum(['draft', 'published']).parse(status),
    )
    updateTag(TAGS.projects)
    if (row) updateTag(TAGS.project(row.slug))
    return { ok: true, data: undefined }
  })
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return run('deleteProject', async () => {
    const row = await projectsRepository.remove(idArg(id))
    updateTag(TAGS.projects)
    if (row) updateTag(TAGS.project(row.slug))
    return { ok: true, data: undefined }
  })
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  return run('reorderProjects', async () => {
    await projectsRepository.reorder(reorderSchema.parse({ ids }).ids)
    updateTag(TAGS.projects)
    return { ok: true, data: undefined }
  })
}

/* ── Skills ─────────────────────────────────────────────────────────── */

export async function saveSkill(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  return run('saveSkill', async () => {
    const parsed = skillInputSchema.safeParse(input)
    if (!parsed.success)
      return { ok: false, error: 'validation', fieldErrors: toFieldErrors(parsed.error) }
    const row = id
      ? await skillsRepository.update(idArg(id), parsed.data)
      : await skillsRepository.create(parsed.data)
    updateTag(TAGS.skills)
    return row ? { ok: true, data: { id: row.id } } : { ok: false, error: 'not_found' }
  })
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  return run('deleteSkill', async () => {
    await skillsRepository.remove(idArg(id))
    updateTag(TAGS.skills)
    return { ok: true, data: undefined }
  })
}

export async function reorderSkills(ids: string[]): Promise<ActionResult> {
  return run('reorderSkills', async () => {
    await skillsRepository.reorder(reorderSchema.parse({ ids }).ids)
    updateTag(TAGS.skills)
    return { ok: true, data: undefined }
  })
}

/* ── Experiences ────────────────────────────────────────────────────── */

export async function saveExperience(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  return run('saveExperience', async () => {
    const parsed = experienceInputSchema.safeParse(input)
    if (!parsed.success)
      return { ok: false, error: 'validation', fieldErrors: toFieldErrors(parsed.error) }
    const row = id
      ? await experiencesRepository.update(idArg(id), parsed.data)
      : await experiencesRepository.create(parsed.data)
    updateTag(TAGS.experiences)
    return row ? { ok: true, data: { id: row.id } } : { ok: false, error: 'not_found' }
  })
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  return run('deleteExperience', async () => {
    await experiencesRepository.remove(idArg(id))
    updateTag(TAGS.experiences)
    return { ok: true, data: undefined }
  })
}

export async function reorderExperiences(ids: string[]): Promise<ActionResult> {
  return run('reorderExperiences', async () => {
    await experiencesRepository.reorder(reorderSchema.parse({ ids }).ids)
    updateTag(TAGS.experiences)
    return { ok: true, data: undefined }
  })
}

/* ── Messages ───────────────────────────────────────────────────────── */

export async function setMessageStatus(
  id: string,
  status: 'new' | 'read' | 'archived',
): Promise<ActionResult> {
  return run('setMessageStatus', async () => {
    await messagesRepository.setStatus(idArg(id), z.enum(['new', 'read', 'archived']).parse(status))
    return { ok: true, data: undefined }
  })
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return run('deleteMessage', async () => {
    await messagesRepository.remove(idArg(id))
    return { ok: true, data: undefined }
  })
}

/* ── Settings ───────────────────────────────────────────────────────── */

export async function saveSettings(input: unknown): Promise<ActionResult> {
  return run('saveSettings', async () => {
    const parsed = settingsInputSchema.safeParse(input)
    if (!parsed.success)
      return { ok: false, error: 'validation', fieldErrors: toFieldErrors(parsed.error) }
    await settingsRepository.upsert(parsed.data)
    updateTag(TAGS.settings)
    return { ok: true, data: undefined }
  })
}

/* ── Session ────────────────────────────────────────────────────────── */

export async function signOutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
