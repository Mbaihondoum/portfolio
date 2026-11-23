import { sql } from 'drizzle-orm'
import { db } from '@/server/db/client'

export async function truncate(...tables: string[]) {
  await db().execute(
    sql.raw(`truncate table ${tables.map((t) => `"${t}"`).join(', ')} restart identity cascade`),
  )
}
