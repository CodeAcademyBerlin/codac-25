import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Main Page Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for h1 element
    await expect(page.locator('h1')).toBeVisible();
    const h1Text = await page.locator('h1').textContent();
    expect(h1Text).toContain('My Learning');

    // Check heading hierarchy (h1 -> h2 -> h3, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let prevLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.charAt(1));
      
      if (prevLevel > 0) {
        // Next heading level should not skip more than one level
        expect(currentLevel - prevLevel).toBeLessThanOrEqual(1);
      }
      
      prevLevel = currentLevel;
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Track buttons should have proper accessible names
    const trackButtons = page.getByRole('link', { name: /Continue Learning|Start Track/i });
    const buttonCount = await trackButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = trackButtons.nth(i);
      await expect(button).toBeVisible();
      
      const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
      expect(accessibleName).toBeTruthy();
      expect(accessibleName!.length).toBeGreaterThan(0);
    }
  });

  test('should have adequate color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test color contrast using axe-core
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to tab through all interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Move to next focusable element
      if (i < interactiveElements.length - 1) {
        await page.keyboard.press('Tab');
      }
    }
  });

  test('should have accessible card components', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Track cards should be accessible
    const trackCards = page.locator('[class*="card"]').filter({ has: page.locator('h3, [class*="title"]') });
    const cardCount = await trackCards.count();

    for (let i = 0; i < cardCount; i++) {
      const card = trackCards.nth(i);
      
      // Card should have a title
      const title = card.locator('h3, [class*="title"]').first();
      await expect(title).toBeVisible();
      
      // Card should have meaningful content
      const content = await card.textContent();
      expect(content).toBeTruthy();
      expect(content!.trim().length).toBeGreaterThan(10);
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test focus indicators on interactive elements
    const focusableElements = page.locator('button, a[href], input, select, textarea');
    const elementCount = await focusableElements.count();

    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = focusableElements.nth(i);
      await element.focus();
      
      // Check that element has visible focus indicator
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
          borderColor: computed.borderColor
        };
      });
      
      // Should have some form of focus indication
      const hasFocusIndicator = (
        styles.outline !== 'none' ||
        styles.outlineWidth !== '0px' ||
        styles.boxShadow.includes('ring') ||
        styles.borderColor !== 'rgba(0, 0, 0, 0)'
      );
      
      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for main content area
    await expect(page.locator('main')).toBeVisible();

    // Check for proper heading structure
    await expect(page.locator('h1')).toHaveCount(1);

    // Interactive elements should be buttons or links
    const interactiveElements = page.locator('[onclick], [role="button"]:not(button)');
    const count = await interactiveElements.count();
    
    // Should prefer semantic button/link elements over generic divs with click handlers
    expect(count).toBe(0);
  });

  test('should provide text alternatives for images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

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

  test('should work with mobile screen readers', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run axe with mobile-specific rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'mobile'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for live regions that would announce dynamic changes
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    const liveRegionCount = await liveRegions.count();

    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        const role = await region.getAttribute('role');
        
        // Should have proper live region configuration
        expect(ariaLive === 'polite' || ariaLive === 'assertive' || role === 'status' || role === 'alert').toBe(true);
      }
    }
  });
});

test.describe('Main Page Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(viewport => {
    test(`should be accessible on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Run accessibility scan for each viewport
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);

      // Check that content is still accessible at this viewport
      await expect(page.locator('h1')).toBeVisible();
      
      // Interactive elements should still be properly sized
      const buttons = page.locator('button, a[href]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          
          // Touch targets should be at least 44x44 pixels on mobile
          if (viewport.width < 768) {
            expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
            expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  });
});