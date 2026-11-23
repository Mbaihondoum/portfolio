'use client'

import { useInView } from '@/hooks/use-in-view'

type Item = { label: string; value: number; hint?: string }

/** Horizontal ranking (top pages, countries…): label + value, bar as a wash. */
export function BarList({
  items,
  format = (v) => String(v),
  empty = '—',
}: {
  items: Item[]
  format?: (v: number) => string
  empty?: string
}) {
  const [ref, inView] = useInView<HTMLUListElement>()
  const max = Math.max(...items.map((i) => i.value), 1)
  if (!items.length) return <p className="py-6 text-center text-sm text-subtle">{empty}</p>
  return (
    <ul ref={ref} className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li
          key={item.label + i}
          className="relative flex items-center justify-between gap-4 rounded-md px-2.5 py-1.5 text-sm"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 rounded-md bg-accent/15"
            style={{
              width: `${(item.value / max) * 100}%`,
              transformOrigin: 'left',
              transform: `scaleX(${inView ? 1 : 0})`,
              transition: `transform 800ms var(--ease-expo) ${i * 60}ms`,
            }}
          />
          <span className="relative truncate text-foreground" title={item.hint ?? item.label}>
            {item.label}
          </span>
          <span className="relative font-mono text-xs text-muted">{format(item.value)}</span>
        </li>
      ))}
    </ul>
  )
}
