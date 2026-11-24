// @vitest-environment jsdom
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Reveal } from '@/components/motion/reveal'
import { computeMotionTier, isLowEnd } from '@/hooks/use-motion-preference'
import { formatNumber, niceTicks } from '@/lib/format'
import { bezier, duration, ease, stagger } from '@/motion.config'

describe('motion config', () => {
  it('keeps the agreed rhythm (fast < base < slow)', () => {
    expect(duration.fast).toBeLessThan(duration.base)
    expect(duration.base).toBeLessThan(duration.slow)
    expect(ease.out).toBe('power3.out')
    expect(bezier.expo).toHaveLength(4)
    expect(stagger.tight).toBeLessThan(stagger.loose)
  })
})

describe('computeMotionTier', () => {
  const base = { reduced: false, finePointer: true, wide: true, lowEnd: false }
  it('honours reduced motion first', () => {
    expect(computeMotionTier({ ...base, reduced: true })).toBe('none')
  })
  it('drops heavy effects on touch, small screens and low-end devices', () => {
    expect(computeMotionTier({ ...base, finePointer: false })).toBe('lite')
    expect(computeMotionTier({ ...base, wide: false })).toBe('lite')
    expect(computeMotionTier({ ...base, lowEnd: true })).toBe('lite')
  })
  it('enables everything on capable desktops', () => {
    expect(computeMotionTier(base)).toBe('full')
  })
})

describe('isLowEnd', () => {
  const nav = (n: object) => n as Navigator
  it('detects few cores, little memory or data saver', () => {
    expect(isLowEnd(nav({ hardwareConcurrency: 4 }))).toBe(true)
    expect(isLowEnd(nav({ hardwareConcurrency: 8, deviceMemory: 2 }))).toBe(true)
    expect(isLowEnd(nav({ hardwareConcurrency: 8, connection: { saveData: true } }))).toBe(true)
    expect(isLowEnd(nav({ hardwareConcurrency: 12, deviceMemory: 16 }))).toBe(false)
    expect(isLowEnd(nav({}))).toBe(false) // no hints = assume capable
  })
})

describe('chart helpers', () => {
  it('produces clean axis ticks that cover the max', () => {
    expect(niceTicks(85)).toEqual([0, 25, 50, 75, 100])
    expect(niceTicks(180)).toEqual([0, 50, 100, 150, 200])
    expect(niceTicks(0)).toEqual([0, 1])
  })
  it('formats numbers per locale, compact only from 10,000', () => {
    expect(formatNumber(1284, 'en')).toBe('1,284')
    expect(formatNumber(12900, 'en', true).toLowerCase()).toBe('12.9k')
    expect(formatNumber(1284, 'fr').replace(/\s/g, ' ')).toBe('1 284')
  })
})

describe('<Reveal>', () => {
  let trigger: (visible: boolean) => void
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          trigger = (visible) =>
            cb([{ isIntersecting: visible } as IntersectionObserverEntry], this as never)
        }
        observe() {}
        disconnect() {}
      },
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  it('is visible content by default and marks itself revealed in view', () => {
    const { getByText } = render(<Reveal delay={120}>Hello</Reveal>)
    const el = getByText('Hello')
    expect(el).toHaveProperty('dataset.reveal', '')
    expect(el.style.getPropertyValue('--reveal-delay')).toBe('120ms')
    expect(el.hasAttribute('data-revealed')).toBe(false)
    act(() => trigger(true))
    expect(el.hasAttribute('data-revealed')).toBe(true)
  })

  it('staggers marked children', () => {
    const { container } = render(
      <Reveal stagger={50}>
        <span data-reveal-item>a</span>
        <span data-reveal-item>b</span>
      </Reveal>,
    )
    const items = container.querySelectorAll<HTMLElement>('[data-reveal-item]')
    expect(items[1]!.style.getPropertyValue('--reveal-delay')).toBe('50ms')
    act(() => trigger(true))
    expect([...items].every((i) => i.hasAttribute('data-revealed'))).toBe(true)
  })
})
