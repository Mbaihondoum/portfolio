import { z } from 'zod'
import { localeSchema } from './common'

/** Minimum time (ms) a human needs to fill the form. Faster = bot. */
export const CONTACT_MIN_FILL_MS = 2500

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'tooShort').max(120, 'tooLong'),
  email: z.email('invalidEmail').trim().max(254, 'tooLong'),
  subject: z.string().trim().min(3, 'tooShort').max(160, 'tooLong'),
  message: z.string().trim().min(20, 'tooShort').max(5000, 'tooLong'),
  locale: localeSchema.default('fr'),
  /** Honeypot: hidden field, must stay empty. */
  website: z.string().max(0, 'spam').optional().default(''),
  /** Timestamp (ms) when the form was rendered. */
  startedAt: z.coerce.number().int().positive().optional(),
  turnstileToken: z.string().max(4096).optional(),
})

export type ContactInput = z.input<typeof contactSchema>
export type ContactData = z.output<typeof contactSchema>

export const contactFieldNames = ['name', 'email', 'subject', 'message'] as const
export type ContactField = (typeof contactFieldNames)[number]
