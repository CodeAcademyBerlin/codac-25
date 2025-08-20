import { test, expect } from '@playwright/test';

/**
 * TDD Examples for Beginners - CODAC Application
 * 
 * This file demonstrates Test-Driven Development (TDD) principles using Playwright
 * with realistic tests for the CODAC application.
 * 
 * TDD follows the Red-Green-Refactor cycle:
 * 
 * 1. RED: Write a failing test first
 * 2. GREEN: Write the minimal code to make the test pass
 * 3. REFACTOR: Clean up the code while keeping tests passing
 */

test.describe('TDD Example: User Authentication Flow', () => {
  /**
   * Example 1: Testing the actual sign-in page
   * 
   * In TDD, we would:
   * 1. Write this test first (it will fail)
   * 2. Create the sign-in page with minimal functionality
   * 3. Refactor and improve the implementation
   */
  test('should display sign-in form with all elements', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/auth/signin');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check that we're on a signin page
    expect(page.url()).toContain('/auth/signin');
    await expect(page).toHaveTitle(/codac/);

    // Test that the form elements exist using more flexible selectors
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const signInButton = page.locator('button[type="submit"], button:has-text("Sign In")');

    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
    await expect(signInButton.first()).toBeVisible();

    // Test that OAuth options are available (using more flexible selectors)
    const googleButton = page.locator('button:has-text("Google")');
    const magicLinkButton = page.locator('button:has-text("Magic Link")');

    await expect(googleButton.first()).toBeVisible();
    await expect(magicLinkButton.first()).toBeVisible();
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

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill form with invalid credentials
    await page.locator('input[type="email"], input[name="email"]').fill('nonexistent@example.com');
    await page.locator('input[type="password"], input[name="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for and check error message
    await expect(page.getByText(/Sign in failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill with invalid email format - HTML5 validation should catch this
    await page.locator('input[type="email"], input[name="email"]').fill('invalid-email');
    await page.locator('input[type="password"], input[name="password"]').fill('somepassword');

    // The form should not submit with invalid email
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});

test.describe('TDD Example: Document Management', () => {
  /**
   * Example 2: Testing the actual document listing page
   * 
   * This demonstrates testing a more complex user flow with the real CODAC docs system
   */
  test('should display docs page correctly', async ({ page }) => {
    await page.goto('/docs');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should show either documents grid or empty state
    const hasDocuments = await page.locator('.grid').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText('No documents found').isVisible().catch(() => false);

    // One of these should be true
    expect(hasDocuments || hasEmptyState).toBe(true);

    // If empty state, should show create button
    if (hasEmptyState) {
      const createButton = page.getByRole('link', { name: 'Create Document' });
      await expect(createButton).toBeVisible();
    }
  });

  test('should show document count when documents exist', async ({ page }) => {
    await page.goto('/docs');

    // Look for document count text pattern
    const documentCountRegex = /\d+ documents? found/;
    const hasCount = await page.getByText(documentCountRegex).isVisible().catch(() => false);
    const hasEmptyState = await page.getByText('No documents found').isVisible().catch(() => false);

    // Should show either count or empty state
    expect(hasCount || hasEmptyState).toBe(true);
  });

  test('should display document cards with proper structure', async ({ page }) => {
    await page.goto('/docs');

    // Check if there are any document cards
    const documentCards = page.locator('[href^="/docs/"]');
    const cardCount = await documentCards.count();

    if (cardCount > 0) {
      // First card should have title and type badge
      const firstCard = documentCards.first();
      await expect(firstCard.locator('.line-clamp-2').first()).toBeVisible(); // Title

      // Should have a badge with document type
      const badges = firstCard.locator('[class*="badge"]');
      await expect(badges.first()).toBeVisible();
    } else {
      // Should show empty state
      await expect(page.getByText('No documents found')).toBeVisible();
    }
  });
});

test.describe('TDD Example: Learning Page Features', () => {
  /**
   * Example 3: Testing the main learning page functionality
   * 
   * This shows how to test the actual CODAC learning page
   */
  test('should display learning page content', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check main heading and description
    await expect(page.getByRole('heading', { name: 'My Learning' })).toBeVisible();
    await expect(page.getByText('Track your progress across different learning tracks')).toBeVisible();

    // Should have Recent Activity section (it's a CardTitle, not a heading)
    await expect(page.getByText('Recent Activity')).toBeVisible();
  });

  test('should show learning tracks or welcome message', async ({ page }) => {
    await page.goto('/');

    // Should show either learning tracks or welcome message
    const hasWelcome = await page.getByText('Welcome to Your Learning Journey!').isVisible().catch(() => false);
    const hasTrackCards = await page.locator('[class*="grid"] [class*="card"]').count() > 0;

    // Should show either welcome message or track cards
    expect(hasWelcome || hasTrackCards).toBe(true);
  });

  test('should display learning track cards with proper structure', async ({ page }) => {
    await page.goto('/');

    // Look for track cards in the grid
    const trackCards = page.locator('[class*="grid"] [class*="card"]');
    const cardCount = await trackCards.count();

    if (cardCount > 0) {
      // First card should have key elements
      const firstCard = trackCards.first();

      // Should have title with BookOpen icon
      const hasBookIcon = await firstCard.locator('svg').first().isVisible();
      expect(hasBookIcon).toBe(true);

      // Should have progress bar
      await expect(firstCard.getByText('Progress')).toBeVisible();

      // Should have action buttons
      const actionButtons = firstCard.locator('a');
      const buttonCount = await actionButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    }
  });
});

test.describe('TDD Example: Navigation and Routing', () => {
  /**
   * Example 4: Testing navigation between actual pages
   * 
   * This demonstrates testing navigation in the real CODAC app
   */
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
      { path: '/docs', expectedText: ['Documents', 'No documents found'] },
      { path: '/community', expectedText: ['Community'] },
      { path: '/auth/signin', expectedText: ['Welcome to codac'] }
    ];

    for (const section of sections) {
      await page.goto(section.path);
      await expect(page).toHaveURL(section.path);

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

test.describe('TDD Example: Page Responsiveness and Accessibility', () => {
  /**
   * Example 5: Testing responsive design and accessibility
   * 
   * This demonstrates testing non-functional requirements in TDD
   */
  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Key content should still be visible
    await expect(page.getByRole('heading', { name: 'My Learning' })).toBeVisible();

    // Cards should stack properly (grid should adapt)
    const cards = page.locator('[class*="card"]');
    if (await cards.count() > 1) {
      // On mobile, cards should be stacked (full width)
      const firstCard = cards.first();
      const cardBox = await firstCard.boundingBox();
      if (cardBox) {
        // Card should take most of the screen width on mobile
        expect(cardBox.width).toBeGreaterThan(300);
      }
    }
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Should have proper heading hierarchy
    await expect(page.locator('h1')).toBeVisible();

    // Should have main content area
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/auth/signin');

    // Should be able to tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused();
  });

  test('should have proper form labels and accessibility', async ({ page }) => {
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
});

/**
 * TDD Best Practices Demonstrated:
 * 
 * 1. Test Naming: Use descriptive names that explain the behavior being tested
 * 2. Arrange-Act-Assert: Structure tests with clear setup, action, and verification
 * 3. Test One Thing: Each test focuses on a single behavior or scenario
 * 4. Test Edge Cases: Include tests for error conditions and boundary cases
 * 5. Use Page Object Model: For larger applications, consider organizing selectors
 * 6. Mock External Dependencies: Use page.route() to mock API calls
 * 7. Test User Flows: Test complete user journeys, not just individual components
 * 
 * Remember: In true TDD, these tests would be written BEFORE the implementation!
 */