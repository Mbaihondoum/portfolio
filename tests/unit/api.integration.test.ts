/**
 * Integration tests: route handlers + services + real PostgreSQL (test DB).
 * Only the outbound email driver is replaced.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST as contactPOST } from '@/app/api/contact/route'
import { GET as healthGET } from '@/app/api/health/route'
import { POST as trackPOST } from '@/app/api/track/route'
import { setMailerForTests, type Mail } from '@/server/mail'
import { messagesRepository } from '@/server/repositories'
import { rateLimit, windowStartFor } from '@/server/services/rate-limit'
import { db } from '@/server/db/client'
import { pageViews } from '@/server/db/schema'
import { truncate } from './helpers/db'

vi.mock('next/server', async (orig) => ({
  ...(await orig<typeof import('next/server')>()),
  connection: async () => {},
}))

const sent: Mail[] = []
setMailerForTests({ send: async (m) => void sent.push(m) })
process.env.CONTACT_TO_EMAIL = 'owner@example.com'

const ORIGIN = 'http://localhost:3000'

function contactRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}/api/contact`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: ORIGIN,
      host: 'localhost:3000',
      'x-forwarded-for': '203.0.113.7',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

const valid = {
  name: 'Grace Hopper',
  email: 'grace@example.com',
  subject: 'Projet de dashboard',
  message: 'Bonjour, j’aimerais échanger sur un projet Power BI pour mon équipe.',
  locale: 'fr',
  startedAt: Date.now() - 10_000,
}

beforeEach(async () => {
  sent.length = 0
  await truncate('contact_messages', 'rate_limits', 'page_views')
})

afterAll(() => setMailerForTests(undefined))

describe('POST /api/contact', () => {
  it('stores the message and notifies the owner', async () => {
    const res = await contactPOST(contactRequest(valid))
    expect(res.status).toBe(200)
    const inbox = await messagesRepository.list()
    expect(inbox).toHaveLength(1)
    expect(inbox[0]).toMatchObject({ email: 'grace@example.com', status: 'new', locale: 'fr' })
    expect(sent[0]?.to).toBe('owner@example.com')
    expect(sent[0]?.replyTo).toBe('grace@example.com')
  })

  it('returns field errors on invalid input', async () => {
    const res = await contactPOST(contactRequest({ ...valid, email: 'x' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.fields).toEqual({ email: 'invalidEmail' })
  })

  it('silently drops honeypot submissions', async () => {
    const res = await contactPOST(contactRequest({ ...valid, website: 'spam' }))
    expect(res.status).toBe(200)
    expect(await messagesRepository.list()).toHaveLength(0)
  })

  it('silently drops forms submitted too fast', async () => {
    const res = await contactPOST(contactRequest({ ...valid, startedAt: Date.now() }))
    expect(res.status).toBe(200)
    expect(await messagesRepository.list()).toHaveLength(0)
  })

  it('rejects cross-origin requests (CSRF)', async () => {
    const res = await contactPOST(contactRequest(valid, { origin: 'https://evil.example' }))
    expect(res.status).toBe(403)
  })

  it('rejects non-JSON bodies', async () => {
    const res = await contactPOST(contactRequest(valid, { 'content-type': 'text/plain' }))
    expect(res.status).toBe(415)
  })

  it('rate limits after 5 messages per IP', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await contactPOST(contactRequest(valid))).status).toBe(200)
    }
    const blocked = await contactPOST(contactRequest(valid))
    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0)
    const otherIp = await contactPOST(contactRequest(valid, { 'x-forwarded-for': '198.51.100.1' }))
    expect(otherIp.status).toBe(200)
  })
})

describe('rateLimit', () => {
  it('uses fixed windows and resets in the next one', async () => {
    const windowMs = 60_000
    const now = windowStartFor(Date.now(), windowMs).getTime() + 1000
    const opts = { bucket: 'test', identifier: 'ip', limit: 2, windowMs }
    expect((await rateLimit({ ...opts, now })).ok).toBe(true)
    expect((await rateLimit({ ...opts, now })).ok).toBe(true)
    expect((await rateLimit({ ...opts, now })).ok).toBe(false)
    expect((await rateLimit({ ...opts, now: now + windowMs })).ok).toBe(true)
  })
})

describe('POST /api/track', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148'
  const track = (body: unknown, headers: Record<string, string> = {}) =>
    trackPOST(
      new Request(`${ORIGIN}/api/track`, {
        method: 'POST',
        headers: { origin: ORIGIN, host: 'localhost:3000', 'user-agent': ua, ...headers },
        body: JSON.stringify(body),
      }),
    )

  it('records an anonymous page view', async () => {
    const res = await track(
      { path: '/fr/projects/demo', locale: 'fr', referrer: 'https://www.linkedin.com/' },
      { 'x-vercel-ip-country': 'SN' },
    )
    expect(res.status).toBe(204)
    const rows = await db().select().from(pageViews)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      projectSlug: 'demo',
      device: 'mobile',
      country: 'SN',
      referrerHost: 'linkedin.com',
    })
  })

  it('ignores bots and Do Not Track', async () => {
    await track({ path: '/fr', locale: 'fr' }, { 'user-agent': 'Googlebot' })
    await track({ path: '/fr', locale: 'fr' }, { dnt: '1' })
    expect(await db().select().from(pageViews)).toHaveLength(0)
  })

  it('rejects invalid payloads', async () => {
    expect((await track({ path: 'javascript:x', locale: 'fr' })).status).toBe(400)
  })
})

describe('GET /api/health', () => {
  it('reports the database as up', async () => {
    const res = await healthGET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.checks.database.status).toBe('up')
  })
})
