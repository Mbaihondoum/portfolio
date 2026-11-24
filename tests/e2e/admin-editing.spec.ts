import { expect, test } from '@playwright/test'
import { db } from './helpers'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

async function projectOrder() {
  const sql = db()
  const rows = await sql<{ slug: string }[]>`select slug from projects order by position`
  await sql.end()
  return rows.map((r) => r.slug)
}

test.describe('Admin editing', () => {
  test('reorders projects by drag and drop, and with the keyboard buttons', async ({ page }) => {
    const before = await projectOrder()
    await page.goto('/admin/projects')
    const rows = page.getByRole('list', { name: /Projets/ }).getByRole('listitem')
    const firstTitle = (await rows.nth(0).getByRole('link').first().textContent())!.trim()

    // Drag the first row's grip onto the third row.
    await rows.nth(0).locator('[title="Glisser pour réordonner"]').dragTo(rows.nth(2))
    await expect(rows.nth(2).getByRole('link').first()).toHaveText(firstTitle)
    await expect.poll(projectOrder).toEqual([before[1], before[2], before[0], ...before.slice(3)])

    // Restore with the ↑ buttons (keyboard-accessible path).
    await rows.nth(2).getByRole('button', { name: 'Monter' }).click()
    await expect(rows.nth(1).getByRole('link').first()).toHaveText(firstTitle)
    await rows.nth(1).getByRole('button', { name: 'Monter' }).click()
    await expect.poll(projectOrder).toEqual(before)
  })

  test('creates a draft with the visual editors and previews it', async ({ page }) => {
    await page.goto('/admin/projects/new')
    await page.getByLabel('Titre · FR').fill('Projet E2E brouillon')
    await page.getByLabel('Titre · EN').fill('E2E draft project')
    await page.getByLabel('Résumé (carte) · FR').fill('Résumé de test.')
    await page.getByLabel('Résumé (carte) · EN').fill('Test summary.')
    await page.getByRole('button', { name: 'Générer' }).click()

    await page.getByRole('button', { name: '+ Créer un schéma' }).click()
    await page.getByLabel('Libellé du bloc 3').fill('PostgreSQL E2E')
    await expect(page.locator('svg[aria-label="Aperçu du schéma"]')).toContainText('PostgreSQL E2E')

    await page.getByRole('button', { name: '+ Graphique' }).click()
    await page.getByLabel('Titre FR du graphique 1').fill('Ventes')
    await page.getByLabel('Titre EN du graphique 1').fill('Sales')

    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]{36}$/)
    const id = page.url().split('/').pop()!

    await page.goto(`/admin/preview/${id}`)
    await expect(page.getByRole('note')).toContainText('Brouillon')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Projet E2E brouillon')
    await expect(page.locator('.arch svg')).toContainText('PostgreSQL E2E')
    await page.getByRole('link', { name: 'en', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('E2E draft project')

    // Drafts never reach the public site.
    const res = await page.request.get('/api/projects/projet-e2e-brouillon')
    expect(res.status()).toBe(404)
  })
})
