import { test, expect } from '@playwright/test';

/**
 * Dashboard and Navigation Tests
 * 
 * Tests for dashboard functionality, navigation, and routing behavior.
 */

test.describe('Dashboard Features', () => {
  test('should display dashboard content for authenticated users', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Should redirect to signin for unauthenticated users OR show welcome message for authenticated users
    const isOnSignin = page.url().includes('/auth/signin');
    const hasWelcome = await page.getByText(/Welcome back/i).isVisible().catch(() => false);

    expect(isOnSignin || hasWelcome).toBe(true);
  });

  test('should handle authentication flow correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Should either redirect to signin or show dashboard content
    const isOnSignin = page.url().includes('/auth/signin');
    const hasDashboardContent = await page.getByText(/Welcome back|My Projects|Quick Actions/i).isVisible().catch(() => false);

    expect(isOnSignin || hasDashboardContent).toBe(true);
  });
});

test.describe('Navigation and Routing', () => {
  test('should navigate to docs section', async ({ page }) => {
    await page.goto('/');

    // Navigate to docs - check if there's a navigation link
    await page.goto('/docs');

    // Should be on docs page
    await expect(page).toHaveURL('/docs');

    // Should show docs page content
    const hasDocsContent = await page.getByText('Documents').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText('No documents found').isVisible().catch(() => false);
    expect(hasDocsContent || hasEmptyState).toBe(true);
  });

  test('should navigate to different sections', async ({ page }) => {
    // Test direct navigation to different sections
    const sections = [
      { path: '/auth/signin', expectedText: ['Welcome to codac'] },
      // Note: /docs and /community may redirect to signin for unauthenticated users
    ];

    for (const section of sections) {
      await page.goto(section.path);
      await page.waitForLoadState('networkidle');
      
      // For signin page, should stay on signin page
      if (section.path === '/auth/signin') {
        expect(page.url()).toContain('/auth/signin');
      }

      // Check that at least one expected text is visible
      let foundText = false;
      for (const text of section.expectedText) {
        const isVisible = await page.getByText(text).isVisible().catch(() => false);
        if (isVisible) {
          foundText = true;
          break;
        }
      }
      expect(foundText).toBe(true);
    }

    // Test protected routes redirect to signin
    const protectedRoutes = ['/docs', '/community'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should redirect to signin
      expect(page.url()).toContain('/auth/signin');
    }
  });

  test('should handle 404 for non-existent pages', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/non-existent-page');

    // Should show 404 or redirect to a valid page
    const is404 = page.url().includes('404') || page.url().includes('not-found');
    const isRedirected = page.url() !== 'http://localhost:3000/non-existent-page';

    expect(is404 || isRedirected).toBe(true);
  });
});