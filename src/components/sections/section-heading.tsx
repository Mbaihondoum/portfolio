import { SplitText } from '@/components/motion/split-text'
import { Reveal } from '@/components/motion/reveal'

export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  id,
}: {
  index: number
  eyebrow: string
  title: string
  lead?: string
  id?: string
}) {
  return (
    <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12">
      <Reveal className="md:col-span-3">
        <p className="flex items-center gap-3 font-mono text-xs tracking-widest text-muted uppercase">
          <span className="text-accent">{String(index).padStart(2, '0')}</span>
          <span className="h-px w-8 bg-border-strong" aria-hidden />
          {eyebrow}
        </p>
      </Reveal>
      <div className="md:col-span-9">
        <SplitText
          as="h2"
          text={title}
          className="text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl"
        />
        {lead && (
          <Reveal delay={150}>
            <p id={id} className="mt-5 max-w-2xl text-lg text-muted">
              {lead}
            </p>
          </Reveal>
        )}
      </div>
    </div>
  )
}
