import { expect, test } from '@playwright/test'

test.describe('Public navigation', () => {
  test('redirects / to a locale and renders the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/(fr|en)$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('#projects')).toBeAttached()
  })

  test('filters projects and opens a project page', async ({ page, isMobile }) => {
    await page.goto('/fr')
    if (isMobile) {
      await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
      await page
        .getByRole('dialog')
        .getByRole('link', { name: /Projets/ })
        .click()
    } else {
      await page
        .getByRole('navigation', { name: 'Navigation principale' })
        .getByRole('link', { name: 'Projets' })
        .click()
    }
    const projects = page.locator('#projects')
    await projects.getByRole('button', { name: /Data \/ BI/ }).click()
    const cards = projects
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: /Voir le projet/ }) })
    await expect(cards).toHaveCount(2)
    await expect(projects.getByRole('button', { name: /Data \/ BI/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await cards.first().getByRole('link').click()
    await expect(page).toHaveURL(/\/fr\/projects\/[a-z0-9-]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dashboard Power BI')
    await expect(page.getByRole('heading', { name: /Problème/ })).toBeVisible()
    await page.getByRole('link', { name: 'Tous les projets' }).click()
    await expect(page).toHaveURL(/\/fr#projects$/)
  })

  test('switches language and keeps the page', async ({ page }) => {
    await page.goto('/fr/projects/analyse-enquete-r')
    await page.getByRole('link', { name: /Switch to English/ }).click()
    await expect(page).toHaveURL(/\/en\/projects\/analyse-enquete-r$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('[SAMPLE]')
  })

  test('shows a localized 404', async ({ page }) => {
    const res = await page.goto('/en/this-page-does-not-exist')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })
})
