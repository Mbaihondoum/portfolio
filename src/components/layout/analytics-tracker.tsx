'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import type { Locale } from '@/lib/types'

/** Sends one anonymous beacon per page view (no cookie, no identifier). */
export function AnalyticsTracker({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    const body = JSON.stringify({
      path: pathname,
      locale,
      referrer: document.referrer || undefined,
    })
    const blob = new Blob([body], { type: 'application/json' })
    if (!navigator.sendBeacon?.('/api/track', blob)) {
      fetch('/api/track', {
        method: 'POST',
        body,
        keepalive: true,
        headers: { 'content-type': 'application/json' },
      }).catch(() => {})
    }
  }, [pathname, locale])
  return null
}
