'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/types'
import { bezier, duration } from '@/motion.config'
import { useMotion } from '@/components/motion/motion-provider'
import { ThemeToggle } from './theme-toggle'

export type NavItem = { id: string; label: string }

type Props = {
  locale: Locale
  initials: string
  items: NavItem[]
  labels: {
    openMenu: string
    closeMenu: string
    mainNav: string
    switchLanguage: string
    toggleTheme: string
    contact: string
  }
}

export function SiteHeader({ locale, initials, items, labels }: Props) {
  const pathname = usePathname()
  const { lenis } = useMotion()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const isHome = pathname === `/${locale}`
  const other: Locale = locale === 'fr' ? 'en' : 'fr'
  const otherHref = pathname.replace(/^\/(fr|en)(?=\/|$)/, `/${other}`)

  // Hide on scroll down, show on scroll up.
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        setScrolled(y > 24)
        if (Math.abs(y - last) > 6) setHidden(y > last && y > 160)
        last = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active section (home page only).
  useEffect(() => {
    if (!isHome) return
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [isHome, items])

  // Lock scroll while the mobile menu is open; close on Escape.
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

  const href = (id: string) => `/${locale}#${id}`

  return (
    <>
      <header
        style={{ viewTransitionName: 'site-header' }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-out-expo',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
          scrolled || open
            ? 'border-b border-border bg-background/75 backdrop-blur-xl'
            : 'border-b border-transparent',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="group flex items-center gap-2 font-mono text-sm tracking-widest"
            aria-label={initials}
          >
            <span className="grid size-8 place-items-center rounded-lg border border-border-strong text-accent transition-colors group-hover:border-accent">
              {initials}
            </span>
          </Link>
          <nav aria-label={labels.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => (
                <li key={item.id} className="relative">
                  <Link
                    href={href(item.id)}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={cn(
                      'relative block px-3 py-2 text-sm transition-colors',
                      active === item.id ? 'text-foreground' : 'text-muted hover:text-foreground',
                    )}
                  >
                    {item.label}
                    {active === item.id && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-px h-px bg-accent"
                        transition={{ duration: duration.base, ease: bezier.expo }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-1">
            <Link
              href={otherHref}
              hrefLang={other}
              lang={other}
              aria-label={labels.switchLanguage}
              className="grid h-9 place-items-center rounded-full px-3 font-mono text-xs tracking-wider text-muted uppercase transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {other}
            </Link>
            <ThemeToggle label={labels.toggleTheme} />
            <Link
              href={href('contact')}
              className="ml-2 hidden h-9 items-center rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-strong sm:inline-flex"
            >
              {labels.contact}
            </Link>
            <button
              type="button"
              className="relative ml-1 grid size-10 place-items-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? labels.closeMenu : labels.openMenu}
              onClick={() => setOpen((o) => !o)}
            >
              <span
                className={cn(
                  'absolute h-px w-5 bg-foreground transition-transform duration-300',
                  open ? 'rotate-45' : '-translate-y-1',
                )}
              />
              <span
                className={cn(
                  'absolute h-px w-5 bg-foreground transition-transform duration-300',
                  open ? '-rotate-45' : 'translate-y-1',
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={labels.mainNav}
            className="fixed inset-0 z-40 bg-background pt-20 lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 2.5rem) 2rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2rem)' }}
            transition={{ duration: duration.slow * 0.8, ease: bezier.inOut }}
          >
            <nav className="container-page flex h-full flex-col bg-blueprint">
              <ul className="flex flex-col gap-1">
                {[...items, { id: 'contact', label: labels.contact }].map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.15 + i * 0.05,
                      duration: duration.base,
                      ease: bezier.expo,
                    }}
                  >
                    <Link
                      href={href(item.id)}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 border-b border-border py-4 font-display text-3xl font-semibold"
                    >
                      <span className="font-mono text-xs text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
