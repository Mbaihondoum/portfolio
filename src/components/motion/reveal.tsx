'use client'

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { reveal as revealConfig } from '@/motion.config'

type Props = {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Delay in ms (use for manual staggers). */
  delay?: number
  /** Vertical offset in px. */
  y?: number
  /** Stagger direct children marked with [data-reveal-item] by this many ms. */
  stagger?: number
  id?: string
  split?: boolean
} & Record<`data-${string}`, string | undefined>

/**
 * Reveals its content when it enters the viewport by toggling
 * `data-revealed`; the motion itself is pure CSS (transform + opacity only).
 * Content stays visible without JS or with reduced motion.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  y,
  stagger,
  split,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const items = stagger ? Array.from(el.querySelectorAll<HTMLElement>('[data-reveal-item]')) : []
    items.forEach((item, i) => {
      item.setAttribute('data-reveal', '')
      item.style.setProperty('--reveal-delay', `${delay + i * stagger!}ms`)
    })
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        el.setAttribute('data-revealed', '')
        items.forEach((item) => item.setAttribute('data-revealed', ''))
        io.disconnect()
      },
      { rootMargin: revealConfig.rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay, stagger])

  const style = {
    '--reveal-delay': `${delay}ms`,
    ...(y !== undefined ? { '--reveal-y': `${y}px` } : {}),
  } as CSSProperties
  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      {...(split ? { 'data-split': '' } : stagger ? {} : { 'data-reveal': '' })}
      {...rest}
    >
      {children}
    </Tag>
  )
}
