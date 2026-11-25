'use client'

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { spring } from '@/motion.config'
import { useMotion } from './motion-provider'

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]'

/** Dot + ring cursor for fine pointers. Native cursor stays visible (a11y). */
export function Cursor() {
  const { tier } = useMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, spring.cursor)
  const ry = useSpring(y, spring.cursor)
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (tier !== 'full') return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      setActive(!!(e.target as Element | null)?.closest?.(INTERACTIVE))
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [tier, x, y])

  if (tier !== 'full') return null
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms' }}
    >
      <motion.div
        className="absolute top-0 left-0 size-1.5 -translate-1/2 rounded-full bg-accent shadow-[0_0_0_1.5px_var(--background)]"
        style={{ x, y }}
      />
      <motion.div
        className="absolute top-0 left-0 -translate-1/2 rounded-full border border-accent/60"
        style={{ x: rx, y: ry }}
        animate={{
          width: active ? 48 : 28,
          height: active ? 48 : 28,
          backgroundColor: active ? 'rgba(56,189,248,0.08)' : 'rgba(56,189,248,0)',
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}
