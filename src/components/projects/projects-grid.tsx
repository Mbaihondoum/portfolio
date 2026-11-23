'use client'

import Link from 'next/link'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useState, ViewTransition } from 'react'
import { cn } from '@/lib/cn'
import type { Locale, ProjectCategory } from '@/lib/types'
import type { PublicProjectSummary } from '@/server/services/dto'
import { bezier, duration } from '@/motion.config'
import { ArrowIcon } from '@/components/ui/icons'
import { ProjectImage } from './project-image'
import { TiltCard } from './tilt-card'

type Labels = {
  filterLabel: string
  filters: Record<'all' | ProjectCategory, string>
  empty: string
  sample: string
  viewProject: string
}

const FILTERS = ['all', 'web', 'mobile', 'data', 'fullstack'] as const

export function ProjectsGrid({
  projects,
  locale,
  labels,
}: {
  projects: PublicProjectSummary[]
  locale: Locale
  labels: Labels
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const visible = filter === 'all' ? projects : projects.filter((p) => p.category === filter)
  const counts = Object.fromEntries(
    FILTERS.map((f) => [
      f,
      f === 'all' ? projects.length : projects.filter((p) => p.category === f).length,
    ]),
  )

  return (
    <LayoutGroup>
      <div role="group" aria-label={labels.filterLabel} className="mb-10 flex flex-wrap gap-2">
        {FILTERS.filter((f) => f === 'all' || counts[f]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'relative rounded-full border px-4 py-2 text-sm transition-colors',
              filter === f
                ? 'border-transparent text-accent-foreground'
                : 'border-border text-muted hover:border-border-strong hover:text-foreground',
            )}
          >
            {filter === f && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 -z-0 rounded-full bg-accent"
                transition={{ duration: duration.base, ease: bezier.expo }}
              />
            )}
            <span className="relative">
              {labels.filters[f]} <span className="font-mono text-xs opacity-70">{counts[f]}</span>
            </span>
          </button>
        ))}
      </div>

      <motion.ul layout className="grid gap-6 md:grid-cols-2" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: duration.base, ease: bezier.expo }}
              className={cn(i === 0 && filter === 'all' && p.featured ? 'md:col-span-2' : '')}
            >
              <TiltCard className="h-full">
                <Link
                  href={`/${locale}/projects/${p.slug}`}
                  transitionTypes={['nav-forward']}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-300 hover:border-accent/50"
                  data-cursor
                >
                  <div
                    className={cn(
                      'relative overflow-hidden bg-background',
                      i === 0 && filter === 'all' && p.featured
                        ? 'aspect-[16/8]'
                        : 'aspect-[16/10]',
                    )}
                  >
                    {p.coverImage && (
                      <ViewTransition name={`project-cover-${p.slug}`} share="morph" default="none">
                        <ProjectImage
                          src={p.coverImage}
                          alt={p.coverAlt}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                        />
                      </ViewTransition>
                    )}
                    {p.isSample && (
                      <span className="absolute top-4 left-4 rounded-full border border-accent/40 bg-background/80 px-2.5 py-0.5 font-mono text-[10px] tracking-widest text-accent uppercase backdrop-blur">
                        {labels.sample}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="font-mono text-xs tracking-widest text-subtle uppercase">
                      {labels.filters[p.category]}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">{p.title}</h3>
                    <p className="mt-2 text-muted">{p.summary}</p>
                    {p.metrics.length > 0 && (
                      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                        {p.metrics.slice(0, 2).map((m) => (
                          <div key={m.label}>
                            <dt className="sr-only">{m.label}</dt>
                            <dd className="font-display text-xl font-semibold text-foreground">
                              {m.prefix}
                              {m.value}
                              {m.suffix}{' '}
                              <span className="font-sans text-xs font-normal text-muted">
                                {m.label}
                              </span>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
                      <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
                        {p.stack.slice(0, 4).map((s) => (
                          <li
                            key={s}
                            className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                      <span className="inline-flex items-center gap-2 text-sm text-accent">
                        {labels.viewProject}
                        <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {!visible.length && <p className="text-muted">{labels.empty}</p>}
    </LayoutGroup>
  )
}
