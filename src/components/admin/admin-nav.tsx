'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const LINKS = [
  { href: '/admin', label: 'Tableau de bord', icon: 'M3 12h4v8H3zM10 4h4v16h-4zM17 9h4v11h-4z' },
  { href: '/admin/projects', label: 'Projets', icon: 'M3 5h18v14H3zM3 9h18' },
  { href: '/admin/skills', label: 'Compétences', icon: 'M4 7h16M4 12h10M4 17h7' },
  { href: '/admin/experiences', label: 'Parcours', icon: 'M12 3v18M6 7h6M12 13h6' },
  { href: '/admin/messages', label: 'Messages', icon: 'M3 6h18v12H3zM3 6l9 7 9-7' },
  {
    href: '/admin/settings',
    label: 'Paramètres',
    icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 12h2M18 12h2M12 4v2M12 18v2',
  },
]

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Administration" className="flex gap-1 overflow-x-auto lg:flex-col">
      {LINKS.map((link) => {
        const active =
          link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-accent-soft text-accent'
                : 'text-muted hover:bg-surface-2 hover:text-foreground',
            )}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-4 fill-none stroke-current"
              strokeWidth={1.6}
            >
              <path d={link.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {link.label}
            {link.href === '/admin/messages' && unread > 0 && (
              <span className="ml-auto rounded-full bg-accent px-1.5 font-mono text-[10px] text-accent-foreground">
                {unread}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
