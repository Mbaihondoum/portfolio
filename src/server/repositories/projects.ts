import 'server-only'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { projectImages, projectMetrics, projects } from '@/server/db/schema'
import type { ProjectInput } from '@/lib/validators'

export type ProjectWithRelations = typeof projects.$inferSelect & {
  metrics: (typeof projectMetrics.$inferSelect)[]
  images: (typeof projectImages.$inferSelect)[]
}

const withRelations = {
  metrics: { orderBy: [asc(projectMetrics.position)] },
  images: { orderBy: [asc(projectImages.position)] },
}

export const projectsRepository = {
  async listPublished(): Promise<ProjectWithRelations[]> {
    return db().query.projects.findMany({
      where: eq(projects.status, 'published'),
      orderBy: [asc(projects.position), desc(projects.publishedAt)],
      with: withRelations,
    })
  },

  async findPublishedBySlug(slug: string): Promise<ProjectWithRelations | undefined> {
    return db().query.projects.findFirst({
      where: and(eq(projects.slug, slug), eq(projects.status, 'published')),
      with: withRelations,
    })
  },

  async listAll() {
    return db().query.projects.findMany({
      orderBy: [asc(projects.position), desc(projects.createdAt)],
      columns: {
        id: true,
        slug: true,
        title: true,
        category: true,
        status: true,
        isSample: true,
        featured: true,
        position: true,
        updatedAt: true,
      },
    })
  },

  async findById(id: string): Promise<ProjectWithRelations | undefined> {
    return db().query.projects.findFirst({ where: eq(projects.id, id), with: withRelations })
  },

  async slugExists(slug: string, exceptId?: string) {
    const rows = await db()
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1)
    return rows.length > 0 && rows[0]?.id !== exceptId
  },

  /** Creates or updates a project and replaces its metrics/images atomically. */
  async save(input: ProjectInput, id?: string): Promise<{ id: string; slug: string }> {
    const { metrics, images, ...fields } = input
    return db().transaction(async (tx) => {
      let projectId = id
      const publishedAt =
        fields.status === 'published' ? sql`coalesce(${projects.publishedAt}, now())` : null
      if (projectId) {
        await tx
          .update(projects)
          .set({ ...fields, publishedAt })
          .where(eq(projects.id, projectId))
        await tx.delete(projectMetrics).where(eq(projectMetrics.projectId, projectId))
        await tx.delete(projectImages).where(eq(projectImages.projectId, projectId))
      } else {
        const [{ max } = { max: -1 }] = await tx
          .select({ max: sql<number>`coalesce(max(${projects.position}), -1)` })
          .from(projects)
        const [row] = await tx
          .insert(projects)
          .values({
            ...fields,
            position: Number(max) + 1,
            publishedAt: fields.status === 'published' ? new Date() : null,
          })
          .returning({ id: projects.id })
        projectId = row!.id
      }
      if (metrics.length) {
        await tx
          .insert(projectMetrics)
          .values(metrics.map((m, position) => ({ ...m, projectId: projectId!, position })))
      }
      if (images.length) {
        await tx
          .insert(projectImages)
          .values(images.map((img, position) => ({ ...img, projectId: projectId!, position })))
      }
      return { id: projectId!, slug: fields.slug }
    })
  },

  async setStatus(id: string, status: 'draft' | 'published') {
    const [row] = await db()
      .update(projects)
      .set({
        status,
        publishedAt: status === 'published' ? sql`coalesce(${projects.publishedAt}, now())` : null,
      })
      .where(eq(projects.id, id))
      .returning({ slug: projects.slug })
    return row
  },

  async remove(id: string) {
    const [row] = await db()
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ slug: projects.slug })
    return row
  },

  async reorder(ids: string[]) {
    await db().transaction(async (tx) => {
      for (const [position, id] of ids.entries()) {
        await tx.update(projects).set({ position }).where(eq(projects.id, id))
      }
    })
  },

  async countByStatus() {
    return db()
      .select({ status: projects.status, count: sql<number>`count(*)::int` })
      .from(projects)
      .groupBy(projects.status)
  },

  async slugsByIds(ids: string[]) {
    if (!ids.length) return []
    return db().select({ slug: projects.slug }).from(projects).where(inArray(projects.id, ids))
  },
}
