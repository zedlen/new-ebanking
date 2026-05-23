import { expect, test } from '@playwright/test'

test.describe('Route guards (unauthenticated)', () => {
  test('protected menu routes redirect to login', async ({ page }) => {
    await page.goto('/menu/cards')
    await expect(page).toHaveURL('/', { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: 'Inicio de sesión' })).toBeVisible()
  })

  test('affiliations route redirects to login', async ({ page }) => {
    await page.goto('/menu/affiliations')
    await expect(page).toHaveURL('/')
  })

  test('profile route redirects to login', async ({ page }) => {
    await page.goto('/menu/profile')
    await expect(page).toHaveURL('/')
  })
})
