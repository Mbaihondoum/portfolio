import type { Dictionary } from '@/i18n'
import { SKILL_CATEGORIES } from '@/lib/types'
import type { PublicSkill } from '@/server/services/dto'
import { Reveal } from '@/components/motion/reveal'
import { SectionHeading } from './section-heading'

export function Skills({ t, skills }: { t: Dictionary; skills: PublicSkill[] }) {
  const marquee = skills.filter((s) => s.inMarquee).map((s) => s.name)
  return (
    <section
      id="skills"
      className="relative scroll-mt-20 py-24 sm:py-32"
      aria-label={t.skills.title}
    >
      <div className="container-page">
        <SectionHeading index={2} eyebrow={t.skills.title} title={t.skills.lead} />
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {SKILL_CATEGORIES.map((cat) => {
            const items = skills.filter((s) => s.category === cat)
            if (!items.length) return null
            return (
              <div key={cat} className={cat === 'data_bi' ? 'lg:col-span-1' : ''}>
                <h3 className="mb-4 flex items-center gap-3 text-sm font-medium text-foreground">
                  <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                  {t.skills.categories[cat]}
                </h3>
                <Reveal as="ul" stagger={40} className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <li
                      key={s.name}
                      data-reveal-item
                      className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-foreground/90 transition-[transform,border-color,box-shadow,color] duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:text-foreground hover:shadow-[0_8px_24px_-8px_var(--accent-glow)]"
                    >
                      {s.name}
                    </li>
                  ))}
                </Reveal>
              </div>
            )
          })}
        </div>
      </div>
      {marquee.length > 0 && (
        <div
          className="marquee mt-20 overflow-hidden border-y border-border [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] py-6"
          aria-hidden
        >
          <div className="marquee-track flex w-max gap-12">
            {[...marquee, ...marquee].map((name, i) => (
              <span
                key={i}
                className="flex items-center gap-12 font-display text-3xl font-semibold whitespace-nowrap text-subtle sm:text-4xl"
              >
                {name}
                <span className="size-2 rounded-full bg-accent/60" />
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
