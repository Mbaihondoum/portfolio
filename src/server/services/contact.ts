import 'server-only'
import { z } from 'zod'
import { CONTACT_MIN_FILL_MS, contactSchema, type ContactField } from '@/lib/validators'
import { env } from '@/server/env'
import { logger } from '@/server/logger'
import { mailer } from '@/server/mail'
import { messagesRepository } from '@/server/repositories'
import { rateLimit } from './rate-limit'
import { verifyTurnstile } from './turnstile'

export const CONTACT_RATE_LIMIT = { limit: 5, windowMs: 10 * 60_000 }

export type ContactResult =
  | { ok: true }
  | { ok: false; error: 'validation'; fields: Partial<Record<ContactField, string>> }
  | { ok: false; error: 'rate_limited'; retryAfter: number }
  | { ok: false; error: 'captcha' | 'server' }

/**
 * Contact use case: validate → anti-spam → rate limit → persist → notify.
 * Bots caught by the honeypot or timing check get a fake success, so they
 * learn nothing.
 */
export async function submitContact(
  raw: unknown,
  ctx: { ip: string; now?: number },
): Promise<ContactResult> {
  const now = ctx.now ?? Date.now()
  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>
    if (flat.website) return { ok: true } // honeypot filled
    const fields: Partial<Record<ContactField, string>> = {}
    for (const key of ['name', 'email', 'subject', 'message'] as const) {
      if (flat[key]?.[0]) fields[key] = flat[key][0]
    }
    return { ok: false, error: 'validation', fields }
  }
  const data = parsed.data
  if (data.startedAt && now - data.startedAt < CONTACT_MIN_FILL_MS) {
    logger.info('contact.too_fast')
    return { ok: true }
  }

  const rl = await rateLimit({ bucket: 'contact', identifier: ctx.ip, now, ...CONTACT_RATE_LIMIT })
  if (!rl.ok) {
    return {
      ok: false,
      error: 'rate_limited',
      retryAfter: Math.ceil((rl.resetAt.getTime() - now) / 1000),
    }
  }

  if (!(await verifyTurnstile(data.turnstileToken, ctx.ip))) {
    return { ok: false, error: 'captcha' }
  }

  try {
    const { id } = await messagesRepository.create({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      locale: data.locale,
    })
    const to = env().CONTACT_TO_EMAIL
    if (to) {
      // The message is stored; a mail failure must not fail the request.
      await mailer()
        .send({
          to,
          replyTo: data.email,
          subject: `[Portfolio] ${data.subject}`,
          text: `De : ${data.name} <${data.email}>\nLangue : ${data.locale}\n\n${data.message}\n\n— Message ${id}`,
        })
        .catch((err) => logger.error('contact.mail_failed', { id, err }))
    }
    logger.info('contact.received', { id })
    return { ok: true }
  } catch (err) {
    logger.error('contact.persist_failed', { err })
    return { ok: false, error: 'server' }
  }
}
