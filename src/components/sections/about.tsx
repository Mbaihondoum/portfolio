import type { Dictionary } from '@/i18n'
import type { Locale } from '@/lib/types'
import type { PublicSettings } from '@/server/services/dto'
import { Counter } from '@/components/motion/counter'
import { Reveal } from '@/components/motion/reveal'
import { SectionHeading } from './section-heading'

const COLS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

export function About({
  t,
  settings,
  locale,
}: {
  t: Dictionary
  settings: PublicSettings
  locale: Locale
}) {
  return (
    <section id="about" className="relative scroll-mt-20 py-24 sm:py-32" aria-label={t.about.title}>
      <div className="container-page">
        <SectionHeading index={1} eyebrow={t.about.title} title={t.about.lead} />
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-4">
            <Reveal>
              <p className="text-xl leading-relaxed whitespace-pre-line text-foreground/90">
                {settings.bio}
              </p>
            </Reveal>
            {settings.approach && (
              <Reveal delay={100} className="mt-10 border-l-2 border-accent pl-6">
                <h3 className="font-mono text-xs tracking-widest text-accent uppercase">
                  {t.about.approachTitle}
                </h3>
                <p className="mt-3 whitespace-pre-line text-muted">{settings.approach}</p>
              </Reveal>
            )}
          </div>
        </div>

        {settings.keyFigures.length > 0 && (
          <Reveal
            stagger={100}
            className={`mt-20 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 ${COLS[settings.keyFigures.length] ?? 'lg:grid-cols-4'}`}
          >
            {settings.keyFigures.map((k) => (
              <div key={k.label} data-reveal-item className="bg-surface p-6 sm:p-8">
                <Counter
                  value={k.value}
                  suffix={k.suffix}
                  locale={locale}
                  className="font-display text-5xl font-semibold text-foreground"
                />
                <p className="mt-2 text-sm text-muted">{k.label}</p>
              </div>
            ))}
          </Reveal>
        )}

        <div className="mt-20">
          <h3 className="mb-8 font-mono text-xs tracking-widest text-muted uppercase">
            {t.about.valueTitle}
          </h3>
          <Reveal stagger={120} className="grid gap-6 md:grid-cols-3">
            {t.about.values.map((v, i) => (
              <article
                key={v.title}
                data-reveal-item
                className="group rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-accent/50"
              >
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <h4 className="mt-4 font-display text-xl font-semibold">{v.title}</h4>
                <p className="mt-2 text-muted">{v.text}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
