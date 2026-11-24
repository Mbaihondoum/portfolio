'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { loadGsap, useMotion, whenUserActive } from './motion-provider'

/**
 * Generic GSAP ScrollTrigger hook-up. `setup` receives gsap + the root element
 * and returns nothing; everything created inside is reverted on unmount via
 * gsap.context(). Skipped entirely with reduced motion.
 */
export function useScrollScene(
  setup: (ctx: {
    gsap: typeof import('gsap').gsap
    root: HTMLElement
    tier: 'lite' | 'full'
  }) => void,
  deps: unknown[] = [],
) {
  const ref = useRef<HTMLDivElement>(null)
  const { tier } = useMotion()
  useEffect(() => {
    if (tier === 'none' || !ref.current) return
    let ctx: { revert: () => void } | undefined
    let cancelled = false
    whenUserActive()
      .then(loadGsap)
      .then(({ gsap }) => {
        if (cancelled || !ref.current) return
        const root = ref.current
        ctx = gsap.context(() => setup({ gsap, root, tier }), root)
      })
    return () => {
      cancelled = true
      ctx?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, ...deps])
  return ref
}

/** Light parallax on children marked [data-parallax="<speed>"]. */
export function Parallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useScrollScene(({ gsap, root, tier }) => {
    if (tier !== 'full') return
    root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      const speed = Number(el.dataset.parallax) || 0.15
      gsap.fromTo(
        el,
        { yPercent: speed * 50 },
        {
          yPercent: -speed * 50,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    })
  })
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
