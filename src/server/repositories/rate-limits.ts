import 'server-only'
import { lt, sql } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { rateLimits } from '@/server/db/schema'

export const rateLimitsRepository = {
  /** Atomically increments the counter for (key, window) and returns the new count. */
  async hit(key: string, windowStart: Date): Promise<number> {
    const [row] = await db()
      .insert(rateLimits)
      .values({ key, windowStart, count: 1 })
      .onConflictDoUpdate({
        target: [rateLimits.key, rateLimits.windowStart],
        set: { count: sql`${rateLimits.count} + 1` },
      })
      .returning({ count: rateLimits.count })
    return row?.count ?? 1
  },
  async purgeOlderThan(date: Date) {
    await db().delete(rateLimits).where(lt(rateLimits.windowStart, date))
  },
}
