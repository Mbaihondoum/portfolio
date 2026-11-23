import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { fontVariables } from './fonts'

export const metadata: Metadata = { title: '404 — Page introuvable / Page not found' }

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="grid min-h-dvh place-items-center bg-blueprint px-4 text-center">
        <main>
          <p className="font-mono text-sm text-accent">404</p>
          <h1 className="mt-4 text-5xl font-semibold">Page introuvable</h1>
          <p lang="en" className="mt-2 text-muted">
            Page not found
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link
              href="/fr"
              className="rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground"
            >
              Accueil
            </Link>
            <Link
              href="/en"
              lang="en"
              className="rounded-full border border-border-strong px-6 py-3"
            >
              Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
