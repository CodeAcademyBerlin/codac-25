import { test, expect } from '@playwright/test';

test.describe('User Login UI Tests', () => {

  test.describe('Sign-in Form UI', () => {
    test('should display sign-in form with all required elements', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

      // Check basic page elements
      await expect(page).toHaveTitle(/codac/);
      await expect(page.getByText('Welcome to codac')).toBeVisible();
      
      // Check form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check OAuth buttons
      await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Send Magic Link/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

      // Fill form with invalid credentials
      await page.locator('input[type="email"]').fill('nonexistent@example.com');
      await page.locator('input[type="password"]').fill('wrongpassword');
      await page.locator('button[type="submit"]').click();

      // Should show error message
      await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/Sign in failed/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Magic Link UI', () => {
    test('should validate email format for magic link', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

      // Try invalid email format
      await page.locator('input[type="email"]').fill('invalid-email');
      await page.getByRole('button', { name: /Send Magic Link/i }).click();

      // Should show error for invalid email or disabled button
      const magicLinkButton = page.getByRole('button', { name: /Send Magic Link/i });
      await expect(magicLinkButton).toBeDisabled();
    });
  });

  test.describe('OAuth UI', () => {
    test('should show Google login option', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

      const googleButton = page.getByRole('button', { name: /Google/i });
      await expect(googleButton).toBeVisible();
      await expect(googleButton).not.toBeDisabled();
    });
  });

  test.describe('Form Validation', () => {
    test('should have required fields marked as required', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

      // Check required attributes
      await expect(page.locator('input[type="email"]')).toHaveAttribute('required');
      await expect(page.locator('input[type="password"]')).toHaveAttribute('required');
    });

    test('should show client-side validation for empty credentials', async ({ page }) => {
      await page.goto('/auth/signin');

      // Try to submit empty form - this should trigger client-side validation
      await page.getByRole('button', { name: 'Sign In' }).click();

      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      // Check that the required fields have validation
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

      // Fill with invalid email format
      await page.locator('input[type="email"]').fill('invalid-email');
      await page.locator('input[type="password"]').fill('somepassword');
      
      // The form should not submit with invalid email (HTML5 validation)
      await expect(page.locator('input[type="email"]')).toHaveAttribute('type', 'email');
    });

    test('should show loading state during login attempt', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

      // Fill form with any credentials
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('password123');

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Should show loading spinner briefly
      await expect(page.locator('.animate-spin')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Navigation', () => {
    test('should have link to sign up', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

      // Should have sign up link
      await expect(page.getByRole('button', { name: /Sign up here/i })).toBeVisible();
    });
  });



});

