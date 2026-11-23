'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/use-motion-preference'
import { bezier } from '@/motion.config'

export function RotatingRoles({ roles }: { roles: string[] }) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setI((n) => (n + 1) % roles.length), 2600)
    return () => clearInterval(id)
  }, [reduced, roles.length])
  if (reduced) return <span>{roles.join(' · ')}</span>
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      <span className="sr-only">{roles.join(' · ')}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={roles[i]}
          aria-hidden
          className="col-start-1 row-start-1 text-accent"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.6, ease: bezier.expo }}
        >
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
