import { submitContact } from '@/server/services/contact'
import { clientIp } from '@/server/services/rate-limit'
import { isAllowedOrigin } from '@/server/security'
import { jsonError } from '@/server/http/responses'

const MAX_BODY_BYTES = 16 * 1024

export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers)) return jsonError(403, 'forbidden', 'Origin not allowed')
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonError(415, 'unsupported_media_type', 'Expected application/json')
  }
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) return jsonError(413, 'payload_too_large', 'Payload too large')
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return jsonError(400, 'invalid_json', 'Invalid JSON')
  }

  const result = await submitContact(body, { ip: clientIp(request.headers) })
  if (result.ok) return Response.json({ ok: true })
  switch (result.error) {
    case 'validation':
      return Response.json(
        { error: { code: 'validation', message: 'Invalid fields', fields: result.fields } },
        { status: 400 },
      )
    case 'rate_limited':
      return jsonError(429, 'rate_limited', 'Too many requests', {
        headers: { 'Retry-After': String(result.retryAfter) },
      })
    case 'captcha':
      return jsonError(403, 'captcha', 'Captcha verification failed')
    default:
      return jsonError(500, 'server', 'Unexpected error')
  }
}
