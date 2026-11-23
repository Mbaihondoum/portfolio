import 'server-only'
import { asc, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { skills } from '@/server/db/schema'
import type { SkillInput } from '@/lib/validators'

export const skillsRepository = {
  async list() {
    return db().select().from(skills).orderBy(asc(skills.category), asc(skills.position))
  },
  async findById(id: string) {
    const [row] = await db().select().from(skills).where(eq(skills.id, id)).limit(1)
    return row
  },
  async create(input: SkillInput) {
    const [{ max } = { max: -1 }] = await db()
      .select({ max: sql<number>`coalesce(max(${skills.position}), -1)` })
      .from(skills)
      .where(eq(skills.category, input.category))
    const [row] = await db()
      .insert(skills)
      .values({ ...input, position: Number(max) + 1 })
      .returning()
    return row!
  },
  async update(id: string, input: SkillInput) {
    const [row] = await db().update(skills).set(input).where(eq(skills.id, id)).returning()
    return row
  },
  async remove(id: string) {
    await db().delete(skills).where(eq(skills.id, id))
  },
  async reorder(ids: string[]) {
    await db().transaction(async (tx) => {
      for (const [position, id] of ids.entries()) {
        await tx.update(skills).set({ position }).where(eq(skills.id, id))
      }
    })
  },
}
