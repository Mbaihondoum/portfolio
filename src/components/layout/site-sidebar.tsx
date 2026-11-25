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
  name: string
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

/**
 * Site navigation. Desktop (lg+): fixed blue sidebar on the left, full
 * height (the page content is offset by `lg:pl-72` in the locale layout).
 * Below lg: a fixed blue top bar whose burger opens a full-screen menu.
 */
export function SiteSidebar({ locale, name, initials, items, labels }: Props) {
  const pathname = usePathname()
  const { lenis } = useMotion()
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const isHome = pathname === `/${locale}`
  const other: Locale = locale === 'fr' ? 'en' : 'fr'
  const otherHref = pathname.replace(/^\/(fr|en)(?=\/|$)/, `/${other}`)

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
        style={{ viewTransitionName: 'site-nav' }}
        className="sidebar fixed inset-x-0 top-0 z-50 h-16 bg-sidebar text-sidebar-foreground lg:inset-y-0 lg:right-auto lg:h-dvh lg:w-72"
      >
        <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:flex-col lg:items-stretch lg:justify-start lg:overflow-y-auto lg:px-5 lg:py-8">
          {/* Accessible name = the full name (visible from lg; screen-reader
              only below), so the label always matches the visible text. */}
          <Link href={`/${locale}`} className="group flex items-center gap-3 rounded-lg">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-sidebar-foreground/40 font-mono text-sm tracking-widest transition-colors group-hover:border-sidebar-foreground"
            >
              {initials}
            </span>
            <span className="sr-only font-display text-lg leading-tight font-semibold lg:not-sr-only">
              {name || initials}
            </span>
          </Link>

          <nav aria-label={labels.mainNav} className="hidden lg:mt-12 lg:block">
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const current = active === item.id
                return (
                  <li key={item.id} className="relative">
                    <Link
                      href={href(item.id)}
                      aria-current={current ? 'true' : undefined}
                      className={cn(
                        'relative block rounded-lg px-4 py-2.5 transition-colors',
                        current
                          ? 'bg-sidebar-foreground/10 font-medium text-sidebar-foreground'
                          : 'text-sidebar-foreground/85 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
                      )}
                    >
                      {current && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sidebar-foreground"
                          transition={{ duration: duration.base, ease: bezier.expo }}
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-4 lg:pt-8">
            <div className="flex items-center gap-1 lg:justify-between">
              <Link
                href={otherHref}
                hrefLang={other}
                lang={other}
                className="grid h-9 place-items-center rounded-full px-3 font-mono text-xs tracking-wider text-sidebar-foreground/85 uppercase transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
              >
                {other}
                <span className="sr-only"> — {labels.switchLanguage}</span>
              </Link>
              <ThemeToggle
                label={labels.toggleTheme}
                className="text-sidebar-foreground/85 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
              />
            </div>
            <Link
              href={href('contact')}
              className="ml-2 hidden h-9 items-center justify-center rounded-full bg-sidebar-foreground px-4 text-sm font-medium text-sidebar transition-opacity hover:opacity-90 sm:inline-flex lg:ml-0 lg:h-10"
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
                  'absolute h-px w-5 bg-sidebar-foreground transition-transform duration-300',
                  open ? 'rotate-45' : '-translate-y-1',
                )}
              />
              <span
                className={cn(
                  'absolute h-px w-5 bg-sidebar-foreground transition-transform duration-300',
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
            className="sidebar fixed inset-0 z-40 bg-sidebar pt-20 text-sidebar-foreground lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 2.5rem) 2rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 2.5rem) 2rem)' }}
            transition={{ duration: duration.slow * 0.8, ease: bezier.inOut }}
          >
            <nav className="container-page flex h-full flex-col">
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
                      className="flex items-baseline gap-4 border-b border-sidebar-foreground/20 py-4 font-display text-3xl font-semibold"
                    >
                      <span className="font-mono text-xs text-sidebar-foreground/85">
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
