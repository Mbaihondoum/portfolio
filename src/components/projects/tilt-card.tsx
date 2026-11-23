'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { ReactNode } from 'react'
import { spring } from '@/motion.config'
import { useMotion } from '@/components/motion/motion-provider'

/** Light 3D tilt following the pointer (full motion tier only). */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const { tier } = useMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [5, -5]), spring.tilt)
  const ry = useSpring(useTransform(px, [0, 1], [-6, 6]), spring.tilt)
  if (tier !== 'full') return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width)
        py.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
      }}
    >
      {children}
    </motion.div>
  )
}
