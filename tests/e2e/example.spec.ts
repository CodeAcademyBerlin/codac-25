import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/codac/);
});

test('displays learning page content', async ({ page }) => {
  await page.goto('/');

  // Should show the main learning page heading
  await expect(page.getByRole('heading', { name: 'My Learning' })).toBeVisible();
  
  // Should show the description
  await expect(page.getByText('Track your progress across different learning tracks')).toBeVisible();
});

test('displays docs page', async ({ page }) => {
  await page.goto('/docs');

  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Should show either documents grid or empty state
  const hasDocsGrid = await page.locator('.grid').isVisible().catch(() => false);
  const hasEmptyState = await page.getByText('No documents found').isVisible().catch(() => false);
  
  expect(hasDocsGrid || hasEmptyState).toBe(true);
});

test('sign in page loads correctly', async ({ page }) => {
  await page.goto('/auth/signin');

  // Wait for page to fully load and handle any redirects
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Check that we're on a signin page (might have callbackUrl)
  expect(page.url()).toContain('/auth/signin');
  
  // Check the page title is correct
  await expect(page).toHaveTitle(/codac/);
  
  // Look for form elements using more specific selectors
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  const signInButton = page.locator('button[type="submit"], button:has-text("Sign In")');
  
  await expect(emailInput.first()).toBeVisible();
  await expect(passwordInput.first()).toBeVisible(); 
  await expect(signInButton.first()).toBeVisible();
});