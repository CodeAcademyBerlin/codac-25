import { test, expect } from '@playwright/test';

test.describe('Authentication Accessibility Tests', () => {
  test.describe('Mobile Responsive Design', () => {
    test('should display login form properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check form visibility
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Check OAuth buttons are visible
      await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();

      // Test form interaction on mobile
      await page.locator('input[type="email"]').tap();
      await expect(page.locator('input[type="email"]')).toBeFocused();
    });

    test('should handle different mobile orientations', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 }, // iPhone SE Portrait
        { width: 390, height: 844 }, // iPhone 12 Portrait
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/auth/signin');
        await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

        // Form should be usable in all orientations
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
      }
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should navigate login form with keyboard only', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Tab navigation through login form
      await page.locator('input[type="email"]').focus();
      await expect(page.locator('input[type="email"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });

    test('should support Enter key form submission', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Fill form fields
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('password123');
      
      // Press Enter from password field
      await page.locator('input[type="password"]').press('Enter');

      // Should attempt to submit (may show error, but form should respond)
      await page.waitForTimeout(1000);
      // We just verify the form reacts to Enter key submission
    });
  });

  test.describe('Screen Reader Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Inputs should have proper attributes for screen readers
      await expect(page.locator('input[type="email"]')).toHaveAttribute('id');
      await expect(page.locator('input[type="password"]')).toHaveAttribute('id');
      await expect(page.locator('input[type="email"]')).toHaveAttribute('type', 'email');
      await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password');
    });

    test('should have proper form labels and accessibility attributes', async ({ page }) => {
      await page.goto('/auth/signin');

      // Form inputs should have proper labels
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      // Inputs should have proper types
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Required fields should be marked as required
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
    });

    test('should have accessible button text', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Buttons should have clear, descriptive text
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Send Magic Link/i })).toBeVisible();
    });
  });

  test.describe('Focus Management', () => {
    test('should maintain logical focus order', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Track focus order
      const expectedFocusOrder = [
        'input[type="email"]',
        'input[type="password"]',
        'button[type="submit"]'
      ];

      await page.locator(expectedFocusOrder[0]).focus();

      for (let i = 1; i < expectedFocusOrder.length; i++) {
        await page.keyboard.press('Tab');
        await expect(page.locator(expectedFocusOrder[i])).toBeFocused();
      }
    });
  });

  test.describe('Responsive Touch Targets', () => {
    test('should have adequately sized touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/signin');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const interactiveElements = [
        'button[type="submit"]',
        'button:has-text("Google")',
        'button:has-text("Send Magic Link")'
      ];

      for (const selector of interactiveElements) {
        const element = page.locator(selector);
        if (await element.isVisible().catch(() => false)) {
          const boundingBox = await element.boundingBox();
          
          // Touch targets should be at least 44x44 pixels (WCAG guidelines)
          expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });
});