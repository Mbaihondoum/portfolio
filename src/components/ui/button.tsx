import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out-power disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-foreground hover:bg-accent-strong hover:shadow-[0_0_0_6px_var(--accent-soft),0_10px_40px_-10px_var(--accent-glow)]',
  secondary:
    'border border-border-strong bg-surface/60 text-foreground backdrop-blur hover:border-accent hover:text-accent',
  ghost: 'text-muted hover:bg-surface-2 hover:text-foreground',
  danger: 'border border-danger/40 text-danger hover:bg-danger/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

type ButtonProps = ComponentProps<'button'> & { variant?: Variant; size?: Size }

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}
