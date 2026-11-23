import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

/** Applies migrations to the test database once before the unit/integration suite. */
export default async function setup() {
  config({ path: ['.env.test'], quiet: true })
  const url = process.env.DATABASE_URL!
  const client = postgres(url, { max: 1, onnotice: () => {} })
  await migrate(drizzle(client), { migrationsFolder: './drizzle' })
  await client.end()
}
