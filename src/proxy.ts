import { NextResponse, type NextRequest } from 'next/server'

const LOCALES = ['fr', 'en'] as const
const DEFAULT_LOCALE = 'fr'
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token']

/** Picks the best supported locale from Accept-Language (q-values honoured). */
export function negotiateLocale(header: string | null): (typeof LOCALES)[number] {
  if (!header) return DEFAULT_LOCALE
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';')
      const q = params.find((p) => p.trim().startsWith('q='))
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q.split('=')[1]) : 1 }
    })
    .filter((x) => x.lang && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q)
  for (const { lang } of ranked) {
    const match = LOCALES.find((l) => l === lang)
    if (match) return match
  }
  return DEFAULT_LOCALE
}

function adminCsp(nonce: string) {
  const isDev = process.env.NODE_ENV !== 'production'
  let supabase = ''
  try {
    if (process.env.SUPABASE_URL) supabase = ` https://${new URL(process.env.SUPABASE_URL).host}`
  } catch {}
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://avatars.githubusercontent.com${supabase}`,
    "font-src 'self'",
    `connect-src 'self'${isDev ? ' ws:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://github.com",
    "frame-ancestors 'none'",
  ].join('; ')
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin: optimistic auth check + strict nonce CSP ───────────────────
  if (pathname.startsWith('/admin')) {
    const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name))
    if (!hasSession && pathname !== '/admin/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.search = pathname === '/admin' ? '' : `?callbackUrl=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
    const nonce = btoa(crypto.randomUUID())
    const csp = adminCsp(nonce)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', csp)
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set('Content-Security-Policy', csp)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  // ── Public site: ensure a locale prefix ───────────────────────────────
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hasLocale) return NextResponse.next()

  const locale = negotiateLocale(request.headers.get('accept-language'))
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals and files with an extension.
    '/((?!api|_next/static|_next/image|samples|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}
