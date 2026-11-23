import { expect, test } from '@playwright/test'

test.describe('Admin access', () => {
  test('redirects anonymous visitors to the login page', async ({ page }) => {
    await page.goto('/admin/projects')
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByRole('button', { name: 'Continuer avec GitHub' })).toBeVisible()
  })

  test.describe('with a non-allowlisted account', () => {
    test.use({ storageState: 'tests/e2e/.auth/intruder.json' })
    test('is refused', async ({ page }) => {
      await page.goto('/admin')
      await expect(page).toHaveURL(/\/admin\/login/)
    })
  })

  test.describe('as the admin', () => {
    test.use({ storageState: 'tests/e2e/.auth/admin.json' })

    test('sees the dashboard and messages', async ({ page }) => {
      await page.goto('/admin')
      await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
      await page.getByRole('link', { name: /Messages/ }).click()
      await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible()
    })

    test('updates the site settings and the public site reflects it', async ({ page }) => {
      const name = `E2E Name ${Date.now()}`
      await page.goto('/admin/settings')
      await page.getByLabel('Nom complet').fill(name)
      await page.getByRole('button', { name: 'Enregistrer' }).click()
      await expect(page.getByRole('status')).toContainText('Enregistré')
      await page.goto('/fr')
      await expect(page.getByText(name).first()).toBeVisible()
    })

    test('unpublishes and republishes a project', async ({ page }) => {
      await page.goto('/admin/projects')
      const row = page.getByRole('listitem').filter({ hasText: 'API de commandes' })
      await row.getByRole('button', { name: 'Dépublier' }).click()
      await expect(row.getByRole('button', { name: 'Publier' })).toBeVisible()
      const res = await page.request.get('/api/projects/api-commandes-paiements')
      expect(res.status()).toBe(404)
      await row.getByRole('button', { name: 'Publier' }).click()
      await expect(row.getByRole('button', { name: 'Dépublier' })).toBeVisible()
    })
  })
})
