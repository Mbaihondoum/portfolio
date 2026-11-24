import { describe, expect, it, vi } from 'vitest'

vi.mock('next-auth', () => ({
  default: () => ({ handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }),
}))
vi.mock('next-auth/providers/github', () => ({ default: {} }))

const { isAuthConfigured } = await import('@/server/auth')

describe('isAuthConfigured', () => {
  const full = {
    AUTH_SECRET: 's',
    AUTH_GITHUB_ID: 'id',
    AUTH_GITHUB_SECRET: 'secret',
    ADMIN_EMAILS: 'me@example.com',
  }
  it('requires the secret, GitHub OAuth credentials and the allowlist', () => {
    expect(isAuthConfigured(full)).toBe(true)
    for (const key of Object.keys(full)) {
      expect(isAuthConfigured({ ...full, [key]: '' })).toBe(false)
      expect(isAuthConfigured({ ...full, [key]: undefined })).toBe(false)
    }
  })
})
