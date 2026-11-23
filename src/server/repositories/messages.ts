import 'server-only'
import { desc, eq, ne, sql } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { contactMessages } from '@/server/db/schema'
import type { ContactData } from '@/lib/validators'

export type MessageStatus = 'new' | 'read' | 'archived'

export const messagesRepository = {
  async create(input: Pick<ContactData, 'name' | 'email' | 'subject' | 'message' | 'locale'>) {
    const [row] = await db()
      .insert(contactMessages)
      .values(input)
      .returning({ id: contactMessages.id })
    return row!
  },
  async list(filter: 'inbox' | 'archived' = 'inbox') {
    return db()
      .select()
      .from(contactMessages)
      .where(
        filter === 'archived'
          ? eq(contactMessages.status, 'archived')
          : ne(contactMessages.status, 'archived'),
      )
      .orderBy(desc(contactMessages.createdAt))
      .limit(200)
  },
  async findById(id: string) {
    const [row] = await db()
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1)
    return row
  },
  async setStatus(id: string, status: MessageStatus) {
    await db().update(contactMessages).set({ status }).where(eq(contactMessages.id, id))
  },
  async remove(id: string) {
    await db().delete(contactMessages).where(eq(contactMessages.id, id))
  },
  async countUnread() {
    const [row] = await db()
      .select({ count: sql<number>`count(*)::int` })
      .from(contactMessages)
      .where(eq(contactMessages.status, 'new'))
    return row?.count ?? 0
  },
}
