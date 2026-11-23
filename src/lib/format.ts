import type { Locale } from '@/lib/types'

const intlLocale = (l: Locale) => (l === 'fr' ? 'fr-FR' : 'en-GB')

export function formatNumber(value: number, locale: Locale, compact = false) {
  return new Intl.NumberFormat(intlLocale(locale), {
    notation: compact && Math.abs(value) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value)
}

export function formatMonthYear(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { month: 'short', year: 'numeric' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
}

export function formatDate(date: Date | string, locale: Locale = 'fr') {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/** Clean axis ticks (1, 2, 2.5, 5 × 10^n). */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1]
  const raw = max / count
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw
  const ticks: number[] = []
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 1000) / 1000)
  if ((ticks.at(-1) ?? 0) < max) ticks.push((ticks.at(-1) ?? 0) + step)
  return ticks
}
