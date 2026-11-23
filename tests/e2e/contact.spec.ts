import { expect, test } from '@playwright/test'
import { db } from './helpers'

test.describe('Contact form', () => {
  test('validates client-side, then sends and stores the message', async ({ page }) => {
    await page.goto('/fr#contact')
    const form = page.locator('#contact form')
    await form.getByRole('button', { name: 'Envoyer' }).click()
    await expect(form.getByText('Ce champ est trop court.').first()).toBeVisible()
    await expect(form.getByLabel('Nom')).toHaveAttribute('aria-invalid', 'true')

    const subject = `E2E ${Date.now()}`
    await form.getByLabel('Nom').fill('Ada Lovelace')
    await form.getByLabel('Email').fill('ada@example.com')
    await form.getByLabel('Sujet').fill(subject)
    await form
      .getByLabel('Message')
      .fill('Bonjour, je souhaite discuter d’un projet de tableau de bord Power BI.')
    await page.waitForTimeout(2700) // human fill-time threshold (anti-bot)
    await form.getByRole('button', { name: 'Envoyer' }).click()

    await expect(page.getByRole('status').filter({ hasText: 'Merci' })).toBeVisible()
    await expect(form.getByRole('button', { name: /Message envoyé/ })).toBeVisible()

    const sql = db()
    const rows =
      await sql`select name, email, status, locale from contact_messages where subject = ${subject}`
    await sql.end()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      status: 'new',
      locale: 'fr',
    })
  })
})
