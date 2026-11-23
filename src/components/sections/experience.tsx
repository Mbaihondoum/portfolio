import type { Dictionary } from '@/i18n'
import { formatMonthYear } from '@/lib/format'
import type { Locale } from '@/lib/types'
import type { PublicExperience } from '@/server/services/dto'
import { Reveal } from '@/components/motion/reveal'
import { SectionHeading } from './section-heading'
import { TimelineTrack } from './timeline'

export function Experience({
  t,
  items,
  locale,
}: {
  t: Dictionary
  items: PublicExperience[]
  locale: Locale
}) {
  return (
    <section
      id="experience"
      className="scroll-mt-20 py-24 sm:py-32"
      aria-label={t.experience.title}
    >
      <div className="container-page">
        <SectionHeading index={4} eyebrow={t.experience.title} title={t.experience.lead} />
        <TimelineTrack>
          <ol className="flex flex-col gap-12">
            {items.map((item, i) => {
              const left = i % 2 === 0
              return (
                <li key={item.id} className="relative grid pl-10 md:grid-cols-2 md:gap-16 md:pl-0">
                  <span
                    aria-hidden
                    className="absolute top-1.5 left-0 size-[15px] rounded-full border-2 border-accent bg-background md:left-1/2 md:-translate-x-1/2"
                  />
                  <Reveal
                    y={32}
                    className={left ? 'md:col-start-1 md:text-right' : 'md:col-start-2'}
                  >
                    <p className="font-mono text-xs tracking-widest text-accent uppercase">
                      {item.type === 'work' ? t.experience.work : t.experience.education} ·{' '}
                      <time dateTime={item.startDate}>
                        {formatMonthYear(item.startDate, locale)}
                      </time>{' '}
                      —{' '}
                      {item.endDate ? (
                        <time dateTime={item.endDate}>{formatMonthYear(item.endDate, locale)}</time>
                      ) : (
                        t.experience.present
                      )}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {item.organization}
                      {item.location ? ` · ${item.location}` : ''}
                    </p>
                    {item.description && <p className="mt-3 text-muted">{item.description}</p>}
                  </Reveal>
                </li>
              )
            })}
          </ol>
        </TimelineTrack>
      </div>
    </section>
  )
}
