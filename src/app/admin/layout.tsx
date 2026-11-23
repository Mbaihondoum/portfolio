import type { Metadata } from 'next'
import { connection } from 'next/server'
import '../globals.css'
import { fontVariables } from '../fonts'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
}

/**
 * Admin root layout. Rendered per request (never prerendered) so the proxy's
 * CSP nonce is applied by Next.js to every script; no inline script of our own.
 */
export const instant = false

export default async function AdminRootLayout({ children }: LayoutProps<'/admin'>) {
  await connection()
  return (
    <html lang="fr" className={fontVariables}>
      <body className="min-h-dvh bg-background">{children}</body>
    </html>
  )
}
