'use client'

import type { ReactNode } from 'react'
import { useInView } from '@/hooks/use-in-view'

/** Reveals a screenshot with a clip-path wipe when it scrolls into view (CSS-gated, see globals.css). */
export function GalleryReveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>('0px 0px -15% 0px')
  return (
    <div
      ref={ref}
      className={`gallery-reveal ${className ?? ''}`}
      {...(inView ? { 'data-revealed': '' } : {})}
    >
      {children}
    </div>
  )
}
