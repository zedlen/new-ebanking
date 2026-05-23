import { expect, test } from '@playwright/test'

const username = process.env.E2E_USERNAME
const password = process.env.E2E_PASSWORD

test.describe('Authenticated smoke (staging)', () => {
  test.skip(
    !username || !password,
    'Set E2E_USERNAME and E2E_PASSWORD to run against a live API',
  )

  test('login reaches accounts and then logout', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Usuario').fill(username!)
    await page.getByLabel('Contraseña').fill(password!)
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()

    await expect(page).toHaveURL(/\/menu\/[^/]+\/accounts/, { timeout: 30_000 })
    await expect(page.getByRole('link', { name: 'Mis cuentas' })).toBeVisible()

    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Inicio de sesión' })).toBeVisible()
  })

})
