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
export type MotionTier = 'none' | 'lite' | 'full'

/** Pure decision, unit-tested (tests/unit/motion.test.tsx). */
export function computeMotionTier(input: {
  reduced: boolean
  finePointer: boolean
  wide: boolean
  lowEnd: boolean
}): MotionTier {
  if (input.reduced) return 'none'
  if (!input.finePointer || !input.wide || input.lowEnd) return 'lite'
  return 'full'
}

export function useMotionTier(): MotionTier {
  const reduced = useReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)', false)
  const wide = useMediaQuery('(min-width: 64rem)', false)
  return computeMotionTier({ reduced, finePointer, wide, lowEnd: isLowEnd() })
}

export function isLowEnd(
  nav: Navigator | undefined = typeof navigator === 'undefined' ? undefined : navigator,
) {
  if (!nav) return false
  const n = nav as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  return (
    (n.hardwareConcurrency !== undefined && n.hardwareConcurrency <= 4) ||
    (n.deviceMemory !== undefined && n.deviceMemory <= 4) ||
    n.connection?.saveData === true
  )
}
