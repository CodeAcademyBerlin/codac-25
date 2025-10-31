import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

test.describe('Auth', () => {
  test('Sign-in page renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`)
    await expect(page).toHaveTitle(/Authentication/i)
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('Session endpoint responds', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/auth/session`)
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    // unauthenticated is acceptable; just ensure it returns JSON
    expect(body === null || typeof body === 'object').toBeTruthy()
  })
})
