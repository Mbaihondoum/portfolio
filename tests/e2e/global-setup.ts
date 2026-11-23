import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { encode } from 'next-auth/jwt'
import postgres from 'postgres'

export const E2E_DB =
  process.env.E2E_DATABASE_URL ?? 'postgres://portfolio:portfolio@localhost:5432/portfolio_test'
export const E2E_SECRET =
  process.env.E2E_AUTH_SECRET ?? 'e2e-auth-secret-0123456789abcdefghijklmnop'
const PORT = Number(process.env.E2E_PORT ?? 3100)

async function sessionCookie(email: string) {
  const value = await encode({
    token: { name: 'E2E', email, sub: email },
    secret: E2E_SECRET,
    salt: 'authjs.session-token',
  })
  return {
    cookies: [
      {
        name: 'authjs.session-token',
        value,
        domain: 'localhost',
        path: '/',
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax' as const,
      },
    ],
    origins: [],
  }
}

/** Fresh, seeded test database + pre-signed admin sessions (no test-only route in the app). */
export default async function globalSetup() {
  const env = { ...process.env, DATABASE_URL: E2E_DB }
  execSync('pnpm db:migrate && pnpm db:seed --reset', { env, stdio: 'inherit' })
  const sql = postgres(E2E_DB, { max: 1, onnotice: () => {} })
  await sql`truncate contact_messages, rate_limits, page_views`
  await sql.end()
  mkdirSync('tests/e2e/.auth', { recursive: true })
  writeFileSync(
    'tests/e2e/.auth/admin.json',
    JSON.stringify(await sessionCookie('admin@example.com')),
  )
  writeFileSync(
    'tests/e2e/.auth/intruder.json',
    JSON.stringify(await sessionCookie('intruder@example.com')),
  )
  void PORT
}
