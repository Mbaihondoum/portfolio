import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('Accessibility & reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  for (const path of ['/fr', '/en/projects/dashboard-power-bi-ventes', '/fr/docs/api']) {
    test(`no WCAG A/AA violations on ${path}`, async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      const summary = results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
      )
      expect(summary).toEqual([])
    })
  }

  test('reduced motion: no intro, all content visible immediately', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.locator('.intro')).toBeHidden()
    await expect(page.locator('html')).not.toHaveClass(/js-reveal/)
    await page.locator('#contact').scrollIntoViewIfNeeded()
    const hidden = await page.$$eval(
      '[data-reveal]',
      (els) => els.filter((e) => getComputedStyle(e).opacity === '0').length,
    )
    expect(hidden).toBe(0)
  })
})
