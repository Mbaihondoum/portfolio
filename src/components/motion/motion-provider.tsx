'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type Lenis from 'lenis'
import { useMotionTier } from '@/hooks/use-motion-preference'

type MotionContextValue = { tier: 'none' | 'lite' | 'full'; lenis: Lenis | null }

const MotionContext = createContext<MotionContextValue>({ tier: 'none', lenis: null })
export const useMotion = () => useContext(MotionContext)

/** Lazily loads GSAP + ScrollTrigger (never on the critical path). */
let gsapPromise: Promise<{
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}> | null = null
export function loadGsap() {
  gsapPromise ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger)
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger }
  })
  return gsapPromise
}

/**
 * Resolves on the first scroll / pointer / key interaction (or after a long
 * idle period). Scroll-driven scenes all live below the fold, so GSAP is not
 * needed before the user starts moving: keeps the initial main thread free.
 */
let activation: Promise<void> | null = null
export function whenUserActive(): Promise<void> {
  if (typeof window === 'undefined') return new Promise(() => {})
  activation ??= new Promise<void>((resolve) => {
    const events = ['scroll', 'wheel', 'pointerdown', 'keydown', 'touchstart'] as const
    const done = () => {
      events.forEach((e) => window.removeEventListener(e, done))
      resolve()
    }
    events.forEach((e) => window.addEventListener(e, done, { once: true, passive: true }))
    // Already scrolled (e.g. reload in the middle of the page) or anchor link.
    if (window.scrollY > 0 || location.hash) done()
    else setTimeout(done, 8000)
  })
  return activation
}

/**
 * Root of the motion system:
 *  - marks the document as motion-ready (see the reveal safety net in globals.css);
 *  - starts Lenis smooth scrolling on desktop (full tier: touch scrolling is
 *    already native-smooth) and keeps it in sync with GSAP ScrollTrigger;
 *  - exposes the motion tier so heavy effects can opt out on small devices.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const tier = useMotionTier()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('motion-ready')
  }, [])

  useEffect(() => {
    if (tier !== 'full') return
    let instance: Lenis | null = null
    let cancelled = false
    let rafId = 0
    let detachGsap: (() => void) | undefined
    import('lenis').then(({ default: LenisCtor }) => {
      if (cancelled) return
      instance = new LenisCtor({ duration: 1.1, smoothWheel: true, anchors: { offset: -80 } })
      setLenis(instance)
      // Drive Lenis from GSAP's ticker when GSAP is present, else from rAF.
      const raf = (time: number) => {
        instance?.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
      whenUserActive()
        .then(loadGsap)
        .then(({ gsap, ScrollTrigger }) => {
          if (cancelled || !instance) return
          cancelAnimationFrame(rafId)
          const tick = (t: number) => instance?.raf(t * 1000)
          instance.on('scroll', ScrollTrigger.update)
          gsap.ticker.add(tick)
          gsap.ticker.lagSmoothing(0)
          detachGsap = () => gsap.ticker.remove(tick)
        })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      detachGsap?.()
      instance?.destroy()
      setLenis(null)
    }
  }, [tier])

  return <MotionContext.Provider value={{ tier, lenis }}>{children}</MotionContext.Provider>
}
