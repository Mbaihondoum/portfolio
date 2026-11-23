'use client'

import { useEffect, useState } from 'react'
import { intro } from '@/motion.config'

/**
 * One-time-per-session preloader. The whole sequence is CSS (works even if
 * JS is slow); JS only adds "skip" and remembers that the intro was seen.
 * Hidden up front by the head script when already seen / reduced motion.
 */
export function Intro({ initials, skipLabel }: { initials: string; skipLabel: string }) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    try {
      sessionStorage.setItem(intro.storageKey, '1')
    } catch {}
    const t = setTimeout(
      () => {
        document.documentElement.classList.add('intro-seen')
        setGone(true)
      },
      intro.maxDuration * 1000 + 200,
    )
    return () => clearTimeout(t)
  }, [])
  if (gone) return null
  const skip = () => {
    document.documentElement.classList.add('intro-seen', 'intro-skipped')
    setGone(true)
  }
  return (
    <div
      className="intro fixed inset-0 z-[70] grid place-items-center bg-background"
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 120" className="w-48 sm:w-64" role="presentation">
        <text
          x="100"
          y="86"
          textAnchor="middle"
          className="intro-letters font-display"
          fontSize="92"
          fontWeight="700"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.4"
        >
          {initials}
        </text>
      </svg>
      <button
        type="button"
        tabIndex={-1}
        onClick={skip}
        className="absolute right-6 bottom-6 rounded-full border border-border-strong px-4 py-2 font-mono text-xs tracking-widest text-muted uppercase hover:text-foreground"
      >
        {skipLabel}
      </button>
    </div>
  )
}
