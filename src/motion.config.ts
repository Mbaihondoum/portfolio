/**
 * Central motion system. Every animation in the app reads its timing from
 * here so the whole site moves with one consistent rhythm.
 * CSS mirrors these values as custom properties in globals.css.
 */
export const duration = {
  fast: 0.2,
  base: 0.5,
  slow: 0.9,
} as const

/** GSAP easing names. */
export const ease = {
  out: 'power3.out',
  expo: 'expo.out',
  inOut: 'power2.inOut',
} as const

/** Equivalent cubic-bezier curves for Motion (Framer) and CSS. */
export const bezier = {
  out: [0.215, 0.61, 0.355, 1] as const,
  expo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.645, 0.045, 0.355, 1] as const,
}

export const stagger = {
  tight: 0.04,
  base: 0.08,
  loose: 0.12,
} as const

/** Spring presets for interactive elements (Motion). */
export const spring = {
  magnetic: { stiffness: 220, damping: 18, mass: 0.4 },
  cursor: { stiffness: 500, damping: 40, mass: 0.3 },
  tilt: { stiffness: 260, damping: 22 },
} as const

export const intro = {
  /** Hard cap for the preloader, in seconds (stays under 2 s). */
  maxDuration: 1.6,
  storageKey: 'intro-seen',
} as const

export const reveal = {
  /** Default vertical offset (px) for reveals. */
  y: 24,
  /** Viewport margin before an element reveals. */
  rootMargin: '0px 0px -12% 0px',
} as const
