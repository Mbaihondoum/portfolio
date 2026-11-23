'use client'

import type { ReactNode } from 'react'
import { useScrollScene } from '@/components/motion/scroll-scrub'

/** Vertical line drawn with the scroll (GSAP scrub); items reveal one by one. */
export function TimelineTrack({ children }: { children: ReactNode }) {
  const ref = useScrollScene(({ gsap, root }) => {
    const line = root.querySelector<HTMLElement>('[data-timeline-line]')
    if (!line) return
    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'bottom 60%', scrub: 0.6 },
      },
    )
  })
  return (
    <div ref={ref} className="relative">
      <div aria-hidden className="absolute top-0 bottom-0 left-[7px] w-px bg-border md:left-1/2">
        <div data-timeline-line className="h-full w-full origin-top bg-accent" />
      </div>
      {children}
    </div>
  )
}
