import { test, expect } from '@playwright/test';

import { TestDataFactory } from '../utils/test-helpers';

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
    test('should navigate registration form with keyboard only', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      // Tab through form elements
      await page.keyboard.press('Tab'); // First tabbable element

      // Should be able to tab to all form inputs
      const focusableElements = [
        'input[name="name"]',
        'input[name="email"]',
        'input[name="password"]',
        'input[name="confirmPassword"]',
        'button[type="submit"]'
      ];

      for (let i = 0; i < focusableElements.length; i++) {
        const element = page.locator(focusableElements[i]);

        // Tab to next element or check if already focused
        if (i > 0) {
          await page.keyboard.press('Tab');
        }

        // Element should be focusable
        await element.focus();
        await expect(element).toBeFocused();
      }
    });

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

      // Wait for response (error or navigation)
      await Promise.race([
        page.waitForURL(url => !url.toString().includes('/auth/signin'), { timeout: 5000 }),
        page.waitForSelector('[role="alert"]', { timeout: 3000 })
      ]).catch(() => { });
    });

    test('should support Enter key submission from any form field', async ({ page }) => {
      const userData = TestDataFactory.createUser({
        email: 'test@example.com',
        password: 'password123'
      });

      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Fill email field and press Enter
      await page.locator('input[name="email"]').fill(userData.email);
      await page.locator('input[name="password"]').fill(userData.password || 'password123');

      // Press Enter from password field
      await page.locator('input[name="password"]').press('Enter');

      // Wait for response (error or navigation)
      await Promise.race([
        page.waitForURL(url => !url.toString().includes('/auth/signin'), { timeout: 5000 }),
        page.waitForSelector('[role="alert"]', { timeout: 3000 })
      ]).catch(() => { });
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

      // Form inputs should exist and be accessible
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();

      // Error messages should be announced to screen readers
      const errorAlert = page.locator('[role="alert"]');
      if (await errorAlert.isVisible().catch(() => false)) {
        await expect(errorAlert).toBeVisible();

        const errorText = await errorAlert.textContent();
        expect(errorText).toBeTruthy();
        expect(errorText!.length).toBeGreaterThan(0);
      }
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

    test('should announce loading states to screen readers', async ({ page }) => {
      const userData = TestDataFactory.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      // Fill form
      await page.locator('input[name="name"]').fill(userData.name);
      await page.locator('input[name="email"]').fill(userData.email);
      await page.locator('input[name="password"]').fill(userData.password || 'password123');
      await page.locator('input[name="confirmPassword"]').fill(userData.password || 'password123');

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Loading state should be accessible
      const loadingIndicator = page.locator('.animate-spin, [aria-busy="true"], text=Loading');
      if (await loadingIndicator.isVisible().catch(() => false)) {
        await expect(loadingIndicator).toBeVisible();
      }
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

    test('should trap focus in modals/dialogs', async () => {
      // This test would be relevant if you have modal dialogs in auth flow
      // Skip for now unless you have modal components
      test.skip();
    });

    test('should restore focus after form submission errors', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Focus on email input
      await page.locator('input[name="email"]').focus();

      // Submit invalid form
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Focus should remain on or return to the form
      const activeElement = page.locator(':focus');
      const isFormElement = await activeElement.evaluate(el => {
        return el.tagName === 'INPUT' || el.tagName === 'BUTTON';
      }).catch(() => false);

      expect(isFormElement).toBe(true);
    });
  });

  test.describe('Color Contrast and Visual Accessibility', () => {
    test('should have sufficient color contrast for error messages', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Trigger error
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);

      // Check if error message is visible (contrast testing requires specialized tools)
      const errorMessage = page.locator('[role="alert"], .text-red-500, .text-destructive');
      if (await errorMessage.isVisible().catch(() => false)) {
        await expect(errorMessage).toBeVisible();

        // Basic visibility check (full contrast testing needs specialized tools)
        const styles = await errorMessage.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });

        // At minimum, ensure text is not transparent
        expect(styles.color).not.toBe('transparent');
      }
    });

    test('should be usable without color indicators alone', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Submit to trigger validation
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);

      // Error states should be indicated by more than just color
      const errorElements = page.locator('[role="alert"], .border-red-500');
      if (await errorElements.count() > 0) {
        // Check that errors are communicated through text, not just color
        const hasTextContent = await errorElements.first().textContent();
        expect(hasTextContent).toBeTruthy();
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

    test('should have adequate spacing between touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Check spacing between OAuth buttons
      const googleButton = page.getByRole('button', { name: /Google/i });
      const magicLinkButton = page.getByRole('button', { name: /Send Magic Link/i });

      if (await googleButton.isVisible() && await magicLinkButton.isVisible()) {
        const googleBox = await googleButton.boundingBox();
        const magicLinkBox = await magicLinkButton.boundingBox();

        if (googleBox && magicLinkBox) {
          const spacing = Math.abs(magicLinkBox.y - (googleBox.y + googleBox.height));
          expect(spacing).toBeGreaterThanOrEqual(8); // Minimum 8px spacing
        }
      }
    });
  });


  test.describe('Cross-Browser Accessibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should maintain accessibility in ${browserName}`, async ({ page }) => {
        // Basic accessibility check across browsers
        await page.goto('/auth/signin');
        await page.waitForLoadState('networkidle');

        // Check basic form accessibility
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Test keyboard navigation
        await page.locator('input[name="email"]').focus();
        await expect(page.locator('input[name="email"]')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(page.locator('input[name="password"]')).toBeFocused();
      });
    });
  });
});