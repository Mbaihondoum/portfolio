import type { Dictionary } from '@/i18n'
import { Reveal } from '@/components/motion/reveal'
import { SectionHeading } from './section-heading'

const ICONS = [
  'M4 5h16v11H4zM8 20h8M12 16v4', // web & mobile
  'M4 7h16M4 12h16M4 17h10M18 15l2 2-2 2', // API
  'M4 19V9M10 19V5M16 19v-7M22 19H2', // dashboards
  'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5', // consulting
]

export function Services({ t }: { t: Dictionary }) {
  return (
    <section id="services" className="scroll-mt-20 py-24 sm:py-32" aria-label={t.services.title}>
      <div className="container-page">
        <SectionHeading index={5} eyebrow={t.services.title} title={t.services.lead} />
        <Reveal
          stagger={90}
          className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2"
        >
          {t.services.items.map((s, i) => (
            <article
              key={s.title}
              data-reveal-item
              className="group relative bg-surface p-8 transition-colors duration-300 hover:bg-surface-2 sm:p-10"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-8 fill-none stroke-accent transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:rotate-[-6deg]"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d={ICONS[i] ?? ICONS[0]}
                  pathLength={1}
                  className="transition-[stroke-dashoffset] duration-700 [stroke-dasharray:1] [stroke-dashoffset:0] group-hover:[animation:draw_900ms_var(--ease-in-out)]"
                />
              </svg>
              <h3 className="mt-6 font-display text-2xl font-semibold">{s.title}</h3>
              <p className="mt-3 max-w-md text-muted">{s.text}</p>
              <span aria-hidden className="absolute top-8 right-8 font-mono text-xs text-subtle">
                0{i + 1}
              </span>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
