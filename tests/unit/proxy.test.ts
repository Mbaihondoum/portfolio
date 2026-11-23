import { describe, expect, it } from 'vitest'
import { negotiateLocale } from '@/proxy'

describe('negotiateLocale', () => {
  it('defaults to French', () => {
    expect(negotiateLocale(null)).toBe('fr')
    expect(negotiateLocale('de-DE,de;q=0.9')).toBe('fr')
  })
  it('honours q-values', () => {
    expect(negotiateLocale('de;q=1, en;q=0.8, fr;q=0.5')).toBe('en')
    expect(negotiateLocale('en-US,en;q=0.9,fr;q=0.95')).toBe('en')
    expect(negotiateLocale('fr-CA,en;q=0.7')).toBe('fr')
  })
})
