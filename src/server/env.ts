import 'server-only'
import { z } from 'zod'

/**
 * Server-side environment, validated once at first access.
 * Every variable is documented in `.env.example`.
 */
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v)
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional())

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.url(),
  NEXT_PUBLIC_SITE_URL: z.preprocess(emptyToUndefined, z.url().default('http://localhost:3000')),

  // Auth.js
  AUTH_SECRET: optionalString,
  AUTH_GITHUB_ID: optionalString,
  AUTH_GITHUB_SECRET: optionalString,
  ADMIN_EMAILS: z
    .string()
    .default('')
    .transform((v) =>
      v
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),

  // Email
  RESEND_API_KEY: optionalString,
  CONTACT_TO_EMAIL: optionalString,
  CONTACT_FROM_EMAIL: z.string().default('Portfolio <onboarding@resend.dev>'),

  // Storage
  STORAGE_DRIVER: z.preprocess(emptyToUndefined, z.enum(['local', 'supabase']).default('local')),
  SUPABASE_URL: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  SUPABASE_BUCKET: z.string().default('portfolio'),

  // Anti-spam
  TURNSTILE_SECRET_KEY: optionalString,
  IP_HASH_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().min(16).default('dev-only-ip-hash-secret-change-me'),
  ),
})

export type ServerEnv = z.infer<typeof schema>

let cached: ServerEnv | undefined

export function env(): ServerEnv {
  if (cached) return cached
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  if (parsed.data.NODE_ENV === 'production') {
    if (parsed.data.IP_HASH_SECRET.startsWith('dev-only')) {
      console.warn('[env] IP_HASH_SECRET uses the development default. Set a real secret.')
    }
  }
  cached = parsed.data
  return cached
}

/** For tests only. */
export function resetEnvCache() {
  cached = undefined
}
