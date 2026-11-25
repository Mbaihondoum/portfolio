'use client'

import { useEffect, useRef } from 'react'

/** Reading progress bar (transform only, rAF-throttled). */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div aria-hidden className="fixed inset-x-0 top-16 z-[60] h-0.5 lg:top-0 lg:left-72">
      <div
        ref={bar}
        className="h-full origin-left scale-x-0 bg-accent shadow-[0_0_12px_var(--accent-glow)]"
      />
    </div>
  )
}
