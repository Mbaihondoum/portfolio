import { z } from 'zod'
import { localeSchema } from './common'

export const trackSchema = z.object({
  path: z
    .string()
    .max(300)
    .regex(/^\/[^\s?#]*$/, 'invalidPath'),
  locale: localeSchema,
  referrer: z.string().max(2000).optional(),
})
export type TrackInput = z.infer<typeof trackSchema>
