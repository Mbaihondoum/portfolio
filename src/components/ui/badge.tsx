import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'accent' | 'success' | 'danger'

const tones: Record<Tone, string> = {
  neutral: 'border-border-strong text-muted',
  accent: 'border-accent/40 bg-accent-soft text-accent',
  success: 'border-success/40 text-success',
  danger: 'border-danger/40 text-danger',
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: ComponentProps<'span'> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] tracking-wide uppercase',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
