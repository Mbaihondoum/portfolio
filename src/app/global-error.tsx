'use client'

import './globals.css'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fr">
      <body className="grid min-h-dvh place-items-center bg-background px-4 text-center text-foreground">
        <main>
          <p className="font-mono text-sm text-danger">500</p>
          <h1 className="mt-4 text-4xl font-semibold">Une erreur est survenue</h1>
          <p lang="en" className="mt-2 text-muted">
            Something went wrong
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground"
          >
            Réessayer / Retry
          </button>
        </main>
      </body>
    </html>
  )
}
