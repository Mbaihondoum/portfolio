import Link from 'next/link'
import { ViewTransition } from 'react'
import type { Dictionary } from '@/i18n/dictionaries/fr'
import type { Locale } from '@/lib/types'
import { Markdown } from '@/lib/markdown'
import type { PublicProject } from '@/server/services/dto'
import { Counter } from '@/components/motion/counter'
import { Reveal } from '@/components/motion/reveal'
import { SplitText } from '@/components/motion/split-text'
import { buttonClass } from '@/components/ui/button'
import { ArrowIcon, ExternalIcon, GitHubIcon } from '@/components/ui/icons'
import { ArchitectureDiagram } from './architecture-diagram'
import { GalleryReveal } from './gallery-image'
import { PowerBiEmbed } from './power-bi-embed'
import { ProjectCharts } from './project-charts'
import { ProjectImage } from './project-image'

// No empty cell when a project has fewer than 3 results.
const METRIC_COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
}

/**
 * Body of a project page. Shared by the public page and the admin preview
 * (drafts included), so what you preview is exactly what gets published.
 */
export function ProjectDetail({
  p,
  t,
  locale,
  next,
  backHref,
}: {
  p: PublicProject
  t: Dictionary
  locale: Locale
  next?: { slug: string; title: string } | null
  backHref: string
}) {
  const isData = p.category === 'data'
  const blocks = [
    { title: t.projects.problem, text: p.problem },
    { title: t.projects.solution, text: p.solution },
    { title: t.projects.role, text: p.role },
  ].filter((b) => b.text)

  return (
    <div className="container-page">
      <Link
        href={backHref}
        transitionTypes={['nav-back']}
        className="group inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowIcon className="size-4 rotate-180 transition-transform group-hover:-translate-x-1" />
        {t.projects.back}
      </Link>

      <header className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-widest text-accent uppercase">
            {t.projects.filters[p.category]}
            {p.isSample && (
              <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[10px]">
                {t.projects.sample}
              </span>
            )}
          </p>
          <SplitText
            as="h1"
            text={p.title}
            className="mt-4 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl"
          />
          <Reveal delay={200}>
            <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{p.summary}</p>
          </Reveal>
        </div>
        <Reveal delay={300} className="flex flex-col gap-5 lg:col-span-4 lg:pt-10">
          <div>
            <h2 className="font-mono text-xs tracking-widest text-subtle uppercase">
              {t.projects.stack}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li
                  key={s}
                  className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {(p.demoUrl || p.repoUrl) && (
            <div className="flex flex-wrap gap-2">
              {p.demoUrl && (
                <a
                  href={p.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass('primary', 'md')}
                >
                  {t.projects.demo} <ExternalIcon className="size-4" />
                </a>
              )}
              {p.repoUrl && (
                <a
                  href={p.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass('secondary', 'md')}
                >
                  <GitHubIcon className="size-4" /> {t.projects.code}
                </a>
              )}
            </div>
          )}
        </Reveal>
      </header>

      {p.coverImage && (
        <div className="relative mt-14 aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface">
          <ViewTransition name={`project-cover-${p.slug}`} share="morph" default="none">
            <ProjectImage
              src={p.coverImage}
              alt={p.coverAlt}
              fill
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
          </ViewTransition>
        </div>
      )}

      {blocks.length > 0 && (
        <Reveal stagger={120} className="mt-20 grid gap-10 md:grid-cols-3">
          {blocks.map((b, i) => (
            <section key={b.title} data-reveal-item>
              <h2 className="flex items-center gap-3 font-mono text-xs tracking-widest text-accent uppercase">
                <span>0{i + 1}</span>
                {b.title}
              </h2>
              <p className="mt-4 leading-relaxed text-foreground/85">{b.text}</p>
            </section>
          ))}
        </Reveal>
      )}

      {p.metrics.length > 0 && (
        <section className="mt-20" aria-label={t.projects.results}>
          <h2 className="mb-6 font-mono text-xs tracking-widest text-muted uppercase">
            {t.projects.results}
          </h2>
          <Reveal
            stagger={100}
            className={`grid gap-px overflow-hidden rounded-2xl border border-border bg-border ${METRIC_COLS[Math.min(p.metrics.length, 3)] ?? ''}`}
          >
            {p.metrics.map((m) => (
              <div key={m.label} data-reveal-item className="bg-surface p-6 sm:p-8">
                <Counter
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                  locale={locale}
                  className="font-display text-5xl font-semibold"
                />
                <p className="mt-2 text-sm text-muted">{m.label}</p>
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {p.architecture && (
        <section className="mt-20">
          <h2 className="mb-6 font-mono text-xs tracking-widest text-muted uppercase">
            {t.projects.architecture}
          </h2>
          <Reveal className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <ArchitectureDiagram
              diagram={p.architecture}
              layerLabels={t.projects.layers}
              title={`${t.projects.architecture} — ${p.title}`}
            />
          </Reveal>
        </section>
      )}

      {p.charts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-mono text-xs tracking-widest text-muted uppercase">
            {t.projects.charts}
          </h2>
          <ProjectCharts charts={p.charts} locale={locale} />
        </section>
      )}

      {p.powerBiEmbedUrl && (
        <section className="mt-20">
          <h2 className="mb-6 font-mono text-xs tracking-widest text-muted uppercase">
            {t.projects.powerBi}
          </h2>
          <PowerBiEmbed
            url={p.powerBiEmbedUrl}
            title={`${t.projects.powerBi} — ${p.title}`}
            loadLabel={t.projects.loadPowerBi}
            notice={t.projects.powerBiNotice}
          />
        </section>
      )}

      {p.images.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-mono text-xs tracking-widest text-muted uppercase">
            {isData ? t.projects.dataGallery : t.projects.gallery}
          </h2>
          <div className="grid gap-6">
            {p.images.map((img) => (
              <GalleryReveal
                key={img.url}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <figure>
                  <ProjectImage
                    src={img.url}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    sizes="(min-width: 1280px) 1200px, 100vw"
                    className="h-auto w-full"
                  />
                  {img.alt && (
                    <figcaption className="border-t border-border px-4 py-3 text-xs text-muted">
                      {img.alt}
                    </figcaption>
                  )}
                </figure>
              </GalleryReveal>
            ))}
          </div>
        </section>
      )}

      {p.description && (
        <section className="mt-20 grid gap-6 lg:grid-cols-12">
          <h2 className="font-mono text-xs tracking-widest text-muted uppercase lg:col-span-3">
            {t.projects.details}
          </h2>
          <Reveal className="text-lg leading-relaxed text-foreground/85 lg:col-span-8">
            <Markdown source={p.description} />
          </Reveal>
        </section>
      )}

      {next && next.slug !== p.slug && (
        <Link
          href={`/${locale}/projects/${next.slug}`}
          transitionTypes={['nav-forward']}
          className="group mt-24 flex flex-wrap items-end justify-between gap-6 border-t border-border pt-10"
        >
          <div>
            <p className="font-mono text-xs tracking-widest text-muted uppercase">
              {t.projects.next}
            </p>
            <p className="mt-3 font-display text-3xl font-semibold transition-colors group-hover:text-accent sm:text-5xl">
              {next.title}
            </p>
          </div>
          <ArrowIcon className="size-8 text-accent transition-transform duration-500 ease-out-expo group-hover:translate-x-2" />
        </Link>
      )}
    </div>
  )
}
