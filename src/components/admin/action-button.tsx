'use client'

import { useRouter } from 'next/navigation'
import { useTransition, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { ActionResult } from '@/server/actions/result'
import { errorMessage } from './errors'

/** Runs a server action, optionally after confirmation, then refreshes the page. */
export function ActionButton({
  action,
  children,
  confirm,
  variant = 'ghost',
  label,
  onDone,
}: {
  action: () => Promise<ActionResult<unknown>>
  children: ReactNode
  confirm?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  label?: string
  onDone?: () => void
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      size="sm"
      variant={variant}
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return
        start(async () => {
          const result = await action()
          if (!result.ok) window.alert(errorMessage(result.error))
          onDone?.()
          router.refresh()
        })
      }}
    >
      {children}
    </Button>
  )
}
