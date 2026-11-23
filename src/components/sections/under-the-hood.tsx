import Link from 'next/link'
import type { Dictionary } from '@/i18n'
import type { Locale } from '@/lib/types'
import { ArchitectureDiagram } from '@/components/projects/architecture-diagram'
import { Reveal } from '@/components/motion/reveal'
import { ArrowIcon } from '@/components/ui/icons'
import { SectionHeading } from './section-heading'
import { FlowScrub } from './flow-scrub'

const STACK = [
  'Next.js 16',
  'TypeScript',
  'Tailwind CSS',
  'PostgreSQL',
  'Drizzle ORM',
  'Zod',
  'Auth.js',
  'GSAP',
  'Motion',
  'Lenis',
  'Vitest',
  'Playwright',
  'Docker',
  'GitHub Actions',
  'Vercel',
]

export function UnderTheHood({ t, locale }: { t: Dictionary; locale: Locale }) {
  const s = t.underTheHood.steps
  return (
    <section
      id="under-the-hood"
      className="scroll-mt-20 py-24 sm:py-32"
      aria-label={t.underTheHood.title}
    >
      <div className="container-page">
        <SectionHeading index={6} eyebrow={t.underTheHood.title} title={t.underTheHood.lead} />
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6 lg:col-span-8">
            <p className="mb-4 font-mono text-xs text-muted">
              <span className="text-accent">●</span> {t.underTheHood.flow}
            </p>
            <FlowScrub>
              <ArchitectureDiagram
                title={t.underTheHood.title}
                layerLabels={t.projects.layers}
                diagram={{
                  nodes: [
                    { id: 'browser', label: s.browser, layer: 'client' },
                    { id: 'next', label: s.next, layer: 'api' },
                    { id: 'api', label: s.api, layer: 'api' },
                    { id: 'auth', label: s.auth, layer: 'api' },
                    { id: 'db', label: s.db, layer: 'data' },
                    { id: 'ci', label: s.ci, layer: 'infra' },
                  ],
                  edges: [
                    { from: 'browser', to: 'next', label: 'HTTPS' },
                    { from: 'browser', to: 'api', label: 'fetch' },
                    { from: 'ci', to: 'next', label: 'deploy' },
                    { from: 'next', to: 'db', label: 'cache' },
                    { from: 'api', to: 'db', label: 'SQL' },
                    { from: 'api', to: 'auth' },
                  ],
                }}
              />
            </FlowScrub>
          </Reveal>
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">
            <Reveal as="ul" stagger={90} className="flex flex-col gap-4">
              {t.underTheHood.points.map((p) => (
                <li key={p} data-reveal-item className="flex gap-3 text-muted">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  {p}
                </li>
              ))}
            </Reveal>
            <Reveal as="ul" stagger={25} className="flex flex-wrap gap-1.5">
              {STACK.map((tech) => (
                <li
                  key={tech}
                  data-reveal-item
                  className="rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted"
                >
                  {tech}
                </li>
              ))}
            </Reveal>
            <Link
              href={`/${locale}/docs/api`}
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              {t.underTheHood.api} <ArrowIcon className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
