import { z } from 'zod'
import { LOCALES } from '@/lib/types'

export const localeSchema = z.enum(LOCALES)

/** Bilingual text. `required` = both languages must be filled. */
export const localizedSchema = (opts: { required?: boolean; max?: number } = {}) => {
  const base = z
    .string()
    .trim()
    .max(opts.max ?? 5000, 'tooLong')
  const field = opts.required ? base.min(1, 'required') : base
  return z.object({ fr: field, en: field })
}

/** Optional absolute URL; empty string becomes null. */
export const optionalUrl = z
  .union([z.literal(''), z.url({ protocol: /^https?$/, message: 'invalidUrl' })])
  .nullish()
  .transform((v) => (v ? v : null))

/** Accepts absolute http(s) URLs or site-relative paths (e.g. /uploads/x.png). */
export const assetUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//.test(v), 'invalidUrl')
  .nullish()
  .transform((v) => (v ? v : null))

export const slugSchema = z
  .string()
  .trim()
  .min(2, 'tooShort')
  .max(120, 'tooLong')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'invalidSlug')

export const uuidSchema = z.uuid()
