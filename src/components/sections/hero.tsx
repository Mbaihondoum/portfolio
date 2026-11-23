import Link from 'next/link'
import type { Dictionary } from '@/i18n'
import type { PublicSettings } from '@/server/services/dto'
import type { Locale } from '@/lib/types'
import { buttonClass } from '@/components/ui/button'
import { GitHubIcon, LinkedInIcon, ArrowIcon } from '@/components/ui/icons'
import { Magnetic } from '@/components/motion/magnetic'
import { Reveal } from '@/components/motion/reveal'
import { SplitText } from '@/components/motion/split-text'
import { HeroBackground } from './hero-background'
import { RotatingRoles } from './rotating-roles'

export function Hero({
  t,
  settings,
  locale,
}: {
  t: Dictionary
  settings: PublicSettings
  locale: Locale
}) {
  return (
    <section
      className="hero relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16"
      aria-labelledby="hero-title"
    >
      <HeroBackground />
      <div className="container-page">
        <Reveal delay={0} className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-3 py-1 font-mono text-xs text-muted backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {settings.availability}
          </span>
        </Reveal>
        <p className="mb-4 font-mono text-sm text-muted">{settings.fullName}</p>
        <h1
          id="hero-title"
          className="max-w-5xl text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.98] font-semibold tracking-tight"
        >
          <SplitText as="span" text={settings.headline} className="block" />
        </h1>
        <p className="mt-6 font-mono text-sm text-muted sm:text-base">
          <span aria-hidden className="text-accent">
            {'>'}{' '}
          </span>
          <RotatingRoles roles={t.hero.roles} />
        </p>
        <Reveal delay={350}>
          <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{settings.tagline}</p>
        </Reveal>
        <Reveal delay={500} className="mt-10 flex flex-wrap items-center gap-3">
          <Magnetic>
            <Link href={`/${locale}#projects`} className={buttonClass('primary', 'lg')} data-cursor>
              {t.hero.ctaProjects}
              <ArrowIcon className="size-4" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href={`/${locale}#contact`}
              className={buttonClass('secondary', 'lg')}
              data-cursor
            >
              {t.hero.ctaContact}
            </Link>
          </Magnetic>
          <div className="ml-1 flex items-center gap-1">
            {settings.githubUrl && (
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noreferrer me"
                aria-label={`GitHub ${t.a11y.newTab}`}
                className="grid size-11 place-items-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <GitHubIcon className="size-5" />
              </a>
            )}
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noreferrer me"
                aria-label={`LinkedIn ${t.a11y.newTab}`}
                className="grid size-11 place-items-center rounded-full text-muted transition-colors hover:text-accent"
              >
                <LinkedInIcon className="size-5" />
              </a>
            )}
          </div>
        </Reveal>
      </div>
      <Link
        href={`/${locale}#about`}
        aria-label={t.a11y.scrollDown}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-subtle uppercase sm:flex"
      >
        {t.hero.scroll}
        <span className="relative h-10 w-px overflow-hidden bg-border-strong">
          <span className="absolute inset-x-0 top-0 h-1/2 [animation:scroll-cue_1.8s_var(--ease-in-out)_infinite] bg-accent motion-reduce:hidden" />
        </span>
      </Link>
    </section>
  )
}
