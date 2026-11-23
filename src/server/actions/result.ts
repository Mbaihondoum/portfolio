import type { z } from 'zod'

export type ActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> }

/** Maps Zod issues to `{ "title.fr": "required", ... }`. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.') || '_'
    out[key] ??= issue.message
  }
  return out
}
