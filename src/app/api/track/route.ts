import { trackPageView } from '@/server/services/analytics'
import { isAllowedOrigin } from '@/server/security'

/** Anonymous page-view beacon (sent with navigator.sendBeacon). */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers)) return new Response(null, { status: 403 })
  let body: unknown
  try {
    body = JSON.parse(await request.text())
  } catch {
    return new Response(null, { status: 400 })
  }
  const ok = await trackPageView(body, request.headers)
  return new Response(null, { status: ok ? 204 : 400 })
}
