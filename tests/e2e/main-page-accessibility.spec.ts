import { test, expect } from '@playwright/test';

test.describe('Main Page Accessibility Tests', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check if we're on dashboard or signin page
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/signin')) {
      // On signin page, check for signin-specific heading structure
      const welcomeText = await page.getByText('Welcome to codac').isVisible().catch(() => false);
      expect(welcomeText).toBe(true);
    } else {
      // On dashboard page, should have h1 element
      await expect(page.locator('h1')).toBeVisible();
      const h1Text = await page.locator('h1').textContent();
      
      // Should have proper heading text for authenticated state
      const hasValidHeading = h1Text && (
        h1Text.includes('Welcome back') || 
        h1Text.includes('Admin User') ||
        h1Text.includes('codac')
      );
      expect(hasValidHeading).toBe(true);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Should be able to tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Check that focus moves to an interactive element
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    
    expect(interactiveTags.includes(tagName)).toBe(true);
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check for main content area
    await expect(page.locator('main')).toBeVisible();

    // Check heading structure based on current page
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/signin')) {
      // On signin page, should have semantic structure even if not h1
      await expect(page.getByText('Welcome to codac')).toBeVisible();
    } else {
      // On dashboard page, should have exactly one h1
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('should have proper main content area structure', async ({ page }) => {
    await page.goto('/');

    // Should have proper heading hierarchy
    await expect(page.locator('h1')).toBeVisible();

    // Should have main content area
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });

  test('should provide text alternatives for images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // All images should have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      
      // Alt text should exist (can be empty for decorative images)
      expect(altText).not.toBeNull();
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Test focus indicators on buttons
    const buttons = page.locator('button, a[href]');
    const elementCount = await buttons.count();

    if (elementCount > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();
      
      // Check that element has visible focus indicator
      const styles = await firstButton.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow
        };
      });
      
      // Should have some form of focus indication
      const hasFocusIndicator = (
        styles.outline !== 'none' ||
        styles.outlineWidth !== '0px' ||
        styles.boxShadow.includes('ring') ||
        styles.boxShadow.includes('focus')
      );
      
      expect(hasFocusIndicator).toBe(true);
    }
  });
});

test.describe('Main Page Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 }
  ];

  viewports.forEach(viewport => {
    test(`should display properly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check that main content is visible
      await expect(page.locator('h1')).toBeVisible();
      
      // Interactive elements should be properly sized on mobile
      const buttons = page.locator('button, a[href]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0 && viewport.width < 768) {
        const firstButton = buttons.first();
        if (await firstButton.isVisible()) {
          const boundingBox = await firstButton.boundingBox();
          
          // Touch targets should be at least 44x44 pixels on mobile
          expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });
});