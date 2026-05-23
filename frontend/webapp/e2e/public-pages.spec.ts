import { expect, test } from '@playwright/test'

test.describe('Public pages', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Inicio de sesión' })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByLabel('Usuario')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
  })

  test('recover password page renders', async ({ page }) => {
    await page.goto('/recover-password')
    await expect(
      page.getByRole('heading', { name: 'Recuperar contraseña' }),
    ).toBeVisible()
  })
})
