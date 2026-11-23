'use client'

import type { ReactNode } from 'react'
import { useScrollScene } from '@/components/motion/scroll-scrub'

/** Ties the diagram's flows (request → API → database) to the scroll position. */
export function FlowScrub({ children }: { children: ReactNode }) {
  const ref = useScrollScene(({ gsap, root }) => {
    const edges = root.querySelectorAll<SVGPathElement>('.arch-edge')
    const packets = root.querySelectorAll<SVGCircleElement>('.arch-packet')
    root.classList.add('arch-scrub')
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top 80%', end: 'bottom 40%', scrub: 0.8 },
    })
    edges.forEach((edge, i) => {
      tl.fromTo(
        edge,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1, ease: 'none' },
        i * 0.5,
      )
      const packet = packets[i]
      if (packet) {
        tl.fromTo(
          packet,
          { offsetDistance: '0%', opacity: 1 },
          { offsetDistance: '100%', opacity: 1, duration: 1, ease: 'none' },
          i * 0.5,
        )
      }
    })
  })
  return (
    <div
      ref={ref}
      className="[&.arch-scrub_.arch-edge]:transition-none [&.arch-scrub_.arch-packet]:animate-none"
    >
      {children}
    </div>
  )
}
