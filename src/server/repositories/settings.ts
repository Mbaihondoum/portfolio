import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { siteSettings } from '@/server/db/schema'
import type { SettingsInput } from '@/lib/validators'

export const settingsRepository = {
  async get() {
    const [row] = await db().select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1)
    return row
  },
  async upsert(input: SettingsInput) {
    const [row] = await db()
      .insert(siteSettings)
      .values({ id: 1, ...input })
      .onConflictDoUpdate({ target: siteSettings.id, set: input })
      .returning()
    return row!
  },
}
