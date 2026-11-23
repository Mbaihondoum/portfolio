'use client'

import { useEffect, useRef, useState } from 'react'

/** True once the element has entered the viewport (fires once). */
export function useInView<T extends Element>(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    // IntersectionObserver is available in every supported browser.
    if (!el || inView) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView, rootMargin])
  return [ref, inView] as const
}
