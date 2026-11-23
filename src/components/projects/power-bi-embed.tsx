'use client'

import { useState } from 'react'

/** Click-to-load Power BI iframe: no third-party request until asked (perf + privacy). */
export function PowerBiEmbed({
  url,
  title,
  loadLabel,
  notice,
}: {
  url: string
  title: string
  loadLabel: string
  notice: string
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-surface">
      {loaded ? (
        <iframe
          title={title}
          src={url}
          className="size-full"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="grid size-full place-items-center bg-blueprint p-6 text-center">
          <div>
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground hover:bg-accent-strong"
            >
              {loadLabel}
            </button>
            <p className="mt-3 max-w-sm text-xs text-muted">{notice}</p>
          </div>
        </div>
      )}
    </div>
  )
}
