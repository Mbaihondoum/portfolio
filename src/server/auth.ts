import 'server-only'
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { env } from '@/server/env'
import { logger } from '@/server/logger'

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return env().ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Auth.js v5 — GitHub OAuth, single-admin allowlist (ADMIN_EMAILS).
 * Sessions are encrypted JWT cookies (HttpOnly, Secure in production,
 * SameSite=Lax), so no session table is needed. Max age: 8 hours.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/admin/login', error: '/admin/login' },
  callbacks: {
    signIn({ user }) {
      const allowed = isAdminEmail(user.email)
      if (!allowed) logger.warn('auth.denied', { reason: 'not_in_allowlist' })
      return allowed
    },
    authorized({ auth }) {
      return isAdminEmail(auth?.user?.email)
    },
  },
  logger: {
    error: (error) => logger.error('auth.error', { err: error }),
    warn: (code) => logger.warn('auth.warn', { code }),
  },
})

export type AdminUser = { email: string; name: string | null; image: string | null }

/**
 * Data-access-layer guard. Re-checks the allowlist on every call, so removing
 * an email from ADMIN_EMAILS revokes access immediately.
 */
export async function getAdmin(): Promise<AdminUser | null> {
  await connection()
  const session = await auth()
  const email = session?.user?.email
  if (!email || !isAdminEmail(email)) return null
  return { email, name: session.user?.name ?? null, image: session.user?.image ?? null }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin()
  if (!admin) redirect('/admin/login')
  return admin
}

/** For Server Actions / Route Handlers: throws instead of redirecting. */
export async function assertAdmin(): Promise<AdminUser> {
  const admin = await getAdmin()
  if (!admin) throw new Error('Unauthorized')
  return admin
}
