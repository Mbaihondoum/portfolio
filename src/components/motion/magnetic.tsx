'use client'

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { spring } from '@/motion.config'
import { useMotion } from './motion-provider'

/** Pulls its child slightly toward the pointer (desktop, full motion tier only). */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const { tier } = useMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(useMotionValue(0), spring.magnetic)
  const y = useSpring(useMotionValue(0), spring.magnetic)
  if (tier !== 'full') return <span className={className}>{children}</span>
  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className ?? ''}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
