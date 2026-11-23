'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'
import { useReducedMotion } from '@/hooks/use-motion-preference'

/**
 * Counts up to `value` when scrolled into view. The final value is rendered
 * on the server (SEO, no-JS) and announced once to assistive tech.
 */
export function Counter({
  value,
  prefix = '',
  suffix = '',
  duration = 1600,
  locale = 'fr',
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  locale?: string
  className?: string
}) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const started = useRef(false)

  useEffect(() => {
    if (!inView || reduced || started.current || value === 0) return
    started.current = true
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 4)
      setDisplay(Math.round(value * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, value, duration])

  const fmt = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB')
  return (
    <span ref={ref} className={className}>
      <span aria-hidden className="tabular-nums">
        {prefix}
        {fmt.format(display)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {fmt.format(value)}
        {suffix}
      </span>
    </span>
  )
}
