import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'
const supabaseHost = (() => {
  try {
    return process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).host : null
  } catch {
    return null
  }
})()

/**
 * CSP for the public site. Public pages are prerendered (static shell + cache),
 * so per-request nonces are not possible there; inline scripts emitted by
 * Next.js need 'unsafe-inline'. Everything else is locked down. The admin,
 * which is fully dynamic, gets a stricter nonce-based CSP from `src/proxy.ts`.
 */
const publicCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabaseHost ? ` https://${supabaseHost}` : ''}`,
  "font-src 'self'",
  `connect-src 'self' https://challenges.cloudflare.com${isDev ? ' ws:' : ''}`,
  'frame-src https://app.powerbi.com https://challenges.cloudflare.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

export const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: supabaseHost ? [{ protocol: 'https', hostname: supabaseHost }] : [],
  },
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ['gsap', 'motion'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Admin and auth routes receive a nonce-based CSP from the proxy.
        source: '/((?!admin|api/auth).*)',
        headers: [{ key: 'Content-Security-Policy', value: publicCsp }],
      },
      {
        source: '/samples/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },
}

export default nextConfig
