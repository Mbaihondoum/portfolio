import 'server-only'
import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { experiences } from '@/server/db/schema'
import type { ExperienceInput } from '@/lib/validators'

export const experiencesRepository = {
  async list() {
    return db()
      .select()
      .from(experiences)
      .orderBy(asc(experiences.position), desc(experiences.startDate))
  },
  async findById(id: string) {
    const [row] = await db().select().from(experiences).where(eq(experiences.id, id)).limit(1)
    return row
  },
  async create(input: ExperienceInput) {
    const [row] = await db().insert(experiences).values(input).returning()
    return row!
  },
  async update(id: string, input: ExperienceInput) {
    const [row] = await db()
      .update(experiences)
      .set(input)
      .where(eq(experiences.id, id))
      .returning()
    return row
  },
  async remove(id: string) {
    await db().delete(experiences).where(eq(experiences.id, id))
  },
  async reorder(ids: string[]) {
    await db().transaction(async (tx) => {
      for (const [position, id] of ids.entries()) {
        await tx.update(experiences).set({ position }).where(eq(experiences.id, id))
      }
    })
  },
}
