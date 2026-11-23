import 'server-only'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/server/env'
import * as schema from './schema'

export type Database = PostgresJsDatabase<typeof schema>

declare global {
  // Reuse the connection across hot reloads in development.
  var __pgClient: ReturnType<typeof postgres> | undefined
}

function createClient() {
  const url = env().DATABASE_URL
  return postgres(url, {
    // Supabase transaction pooler (port 6543) does not support prepared statements.
    prepare: !url.includes(':6543'),
    max: process.env.VERCEL ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

let instance: Database | undefined

export function db(): Database {
  if (instance) return instance
  const client = globalThis.__pgClient ?? createClient()
  if (process.env.NODE_ENV !== 'production') globalThis.__pgClient = client
  instance = drizzle(client, { schema, casing: 'snake_case' })
  return instance
}

export { schema }
