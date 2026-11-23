import 'server-only'
import { sql } from 'drizzle-orm'
import { db } from '@/server/db/client'

const startedAt = Date.now()

export async function checkHealth() {
  const t0 = performance.now()
  let database: { status: 'up' | 'down'; latencyMs?: number; error?: string }
  try {
    await db().execute(sql`select 1`)
    database = { status: 'up', latencyMs: Math.round(performance.now() - t0) }
  } catch (err) {
    database = { status: 'down', error: err instanceof Error ? err.name : 'Error' }
  }
  return {
    status: database.status === 'up' ? ('ok' as const) : ('degraded' as const),
    version:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? process.env.npm_package_version ?? 'dev',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    checks: { database },
    timestamp: new Date().toISOString(),
  }
}
