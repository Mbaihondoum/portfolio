'use client'

import { useSyncExternalStore } from 'react'

function subscribe(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', cb)
    return () => mql.removeEventListener('change', cb)
  }
}

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  )
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false)
}

/**
 * Decides which motion tier the device gets:
 *  - "none": reduced motion requested;
 *  - "lite": touch / small screens / low-end hardware (no particles, parallax,
 *    custom cursor or tilt);
 *  - "full": everything.
 */
export function useMotionTier(): 'none' | 'lite' | 'full' {
  const reduced = useReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)', false)
  const wide = useMediaQuery('(min-width: 64rem)', false)
  if (reduced) return 'none'
  if (!finePointer || !wide || isLowEnd()) return 'lite'
  return 'full'
}

function isLowEnd() {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  return (
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    nav.connection?.saveData === true
  )
}
