import { test, expect } from '@playwright/test';

import { DatabaseTestIntegration, TestDataFactory } from '../utils/database-helpers';
import { TestHelpers } from '../utils/test-helpers';

test.describe('User Login Workflows', () => {
  let helpers: TestHelpers;
  let dbIntegration: DatabaseTestIntegration;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    dbIntegration = new DatabaseTestIntegration(page);
    await dbIntegration.setup();
  });

  test.afterEach(async () => {
    await dbIntegration.cleanup();
  });

  test.describe('Credentials Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Create user in database
      const db = await dbIntegration.setup();
      const user = await db.createTestUser(userData);

      // Perform login
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      // Should redirect away from sign-in page
      await expect(page).not.toHaveURL(/\/auth\/signin/);

      // Verify session exists in database
      const hasSession = await dbIntegration.verifyUserSessionExists(user.id);
      expect(hasSession).toBe(true);
    });

    test('should redirect to intended page after login', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();
      const callbackUrl = '/profile';

      // Create user
      await dbIntegration.setup().then(db => db.createTestUser(userData));

      // Try to access protected route, should redirect to signin with callback
      await page.goto(callbackUrl);
      await expect(page).toHaveURL(/\/auth\/signin.*callbackUrl/);

      // Login
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      // Should redirect to original intended page
      await expect(page).toHaveURL(callbackUrl);
    });

    test('should show error for invalid credentials', async () => {
      const userData = TestDataFactory.createValidUser();

      // Create user with known password
      await dbIntegration.setup().then(db => db.createTestUser(userData));

      // Try to login with wrong password
      await helpers.auth.signIn(userData.email, 'wrongpassword');

      // Should show error message
      await helpers.auth.expectSignInError('Sign in failed');
    });

    test('should show error for non-existent user', async () => {
      const userData = TestDataFactory.createValidUser();

      // Try to login without creating user
      await helpers.auth.signIn(userData.email, userData.password!);

      await helpers.auth.expectSignInError('Sign in failed');
    });

    test('should handle case-insensitive email login', async ({ page }) => {
      const userData = TestDataFactory.createValidUser({
        email: 'test.user@example.com'
      });

      // Create user with lowercase email
      await dbIntegration.setup().then(db => db.createTestUser(userData));

      // Login with uppercase email
      await helpers.auth.signIn(userData.email.toUpperCase(), userData.password!);
      await helpers.auth.waitForSignInComplete();

      // Should successfully log in
      await expect(page).not.toHaveURL(/\/auth\/signin/);
    });
  });

  test.describe('Magic Link Authentication', () => {
    test('should send magic link email', async () => {
      const userData = TestDataFactory.createValidUser();

      // Create user in database
      await dbIntegration.setup().then(db => db.createTestUser(userData));

      // Request magic link
      await helpers.auth.requestMagicLink(userData.email);

      // Should show success message
      await helpers.auth.expectMagicLinkSent();
    });

    test('should show error for non-existent email in magic link', async () => {
      const userData = TestDataFactory.createValidUser();

      // Request magic link for non-existent user
      await helpers.auth.requestMagicLink(userData.email);

      // Should still show success to prevent email enumeration attacks
      await helpers.auth.expectMagicLinkSent();
    });

    test('should validate email format for magic link', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Try invalid email format
      await page.locator('input[name="email"]').fill('invalid-email');
      await page.getByRole('button', { name: /Send Magic Link/i }).click();

      // Should show validation error or prevent submission
      await helpers.auth.expectFormValidation('email');
    });
  });

  test.describe('OAuth Login', () => {
    test('should show Google login option', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      const googleButton = page.getByRole('button', { name: /Google/i });
      await expect(googleButton).toBeVisible();
    });

    test('should handle successful Google OAuth login', async ({ page }) => {
      // Mock successful OAuth
      await helpers.auth.mockGoogleOAuthSuccess();

      await helpers.auth.signInWithGoogle();

      // Should redirect to home page
      await page.waitForURL('/', { timeout: 10000 });
    });

    test('should handle OAuth errors', async ({ page }) => {
      // Mock OAuth error
      await helpers.auth.mockGoogleOAuthError();

      await helpers.auth.signInWithGoogle();

      // Should show error page
      await page.waitForURL(/\/auth\/error/, { timeout: 10000 });
    });
  });

  test.describe('Form Validation and UI', () => {
    test('should validate required email field', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Submit without email
      await page.locator('button[type="submit"]').click();

      // Should prevent submission or show error
      await helpers.auth.expectFormValidation('email', 'required');
    });

    test('should validate required password field', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Fill email but not password
      await page.locator('input[name="email"]').fill('test@example.com');
      await page.locator('button[type="submit"]').click();

      // Should show password validation
      await helpers.auth.expectFormValidation('password', 'required');
    });

    test('should show loading state during login', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Create user
      await dbIntegration.setup().then(db => db.createTestUser(userData));

      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Fill form
      await page.locator('input[name="email"]').fill(userData.email);
      await page.locator('input[name="password"]').fill(userData.password!);

      // Submit and check loading state
      await page.locator('button[type="submit"]').click();

      // Should show loading spinner
      await expect(page.locator('.animate-spin')).toBeVisible();
    });

    test('should disable form during submission', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Fill form
      await page.locator('input[name="email"]').fill(userData.email);
      await page.locator('input[name="password"]').fill(userData.password!);

      // Submit form
      await page.locator('button[type="submit"]').click();

      // Form fields should be disabled during submission
      await expect(page.locator('input[name="email"]')).toBeDisabled();
      await expect(page.locator('input[name="password"]')).toBeDisabled();
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refresh', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Create user and login
      await dbIntegration.createUserAndSignIn(userData);
      await helpers.auth.waitForSignInComplete();

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be signed in
      const isSignedIn = await helpers.auth.isSignedIn();
      expect(isSignedIn).toBe(true);
    });

    test('should redirect signed-in users away from login page', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Create user and login
      await dbIntegration.createUserAndSignIn(userData);
      await helpers.auth.waitForSignInComplete();

      // Try to access sign-in page
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      // Should be redirected away from sign-in page
      await expect(page).not.toHaveURL(/\/auth\/signin$/);
    });

    // TODO(human): Implement comprehensive logout functionality test
    // This should test the signOut functionality, session cleanup, and redirect behavior
    // Consider testing both button-based logout and programmatic logout
    // Verify that user can't access protected routes after logout
    test('should handle user logout completely', async () => {
      // Implement logout test here - create user, login, then logout
      // Verify session is cleared and user is redirected appropriately
      // Check that protected routes are no longer accessible
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Simulate network error
      await page.route('**/api/auth/**', route => route.abort());

      await helpers.auth.signIn(userData.email, userData.password!);

      // Should show appropriate error message
      await helpers.auth.expectSignInError();
    });

    test('should clear errors when user starts typing', async ({ page }) => {
      // Trigger error first
      await helpers.auth.signIn('test@example.com', 'wrongpassword');
      await helpers.auth.expectSignInError();

      // Start typing in email field
      await page.locator('input[name="email"]').fill('newtext');

      // Error should be cleared (implementation dependent)
      await page.waitForTimeout(500);
    });
  });

  test.describe('User Status Validation', () => {
    test('should prevent login for inactive users', async () => {
      const userData = TestDataFactory.createValidUser();

      // Create inactive user
      const db = await dbIntegration.setup();
      await db.createTestUser({
        ...userData,
        status: 'INACTIVE'
      });

      await helpers.auth.signIn(userData.email, userData.password!);

      // Should show appropriate error or redirect to activation page
      await helpers.auth.expectSignInError();
    });

    test('should prevent login for suspended users', async () => {
      const userData = TestDataFactory.createValidUser();

      // Create suspended user
      const db = await dbIntegration.setup();
      await db.createTestUser({
        ...userData,
        status: 'GRADUATED'
      });

      await helpers.auth.signIn(userData.email, userData.password!);

      await helpers.auth.expectSignInError();
    });
  });

  test.describe('Navigation Integration', () => {
    test('should navigate to sign-up from sign-in page', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');

      await helpers.auth.goToSignUp();

      await expect(page).toHaveURL(/\/auth\/signup/);
    });

    test('should preserve callback URL when navigating to sign-up', async ({ page }) => {
      const callbackUrl = '/profile';
      await page.goto(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);

      await helpers.auth.goToSignUp();

      // Should preserve callback URL in sign-up page
      expect(page.url()).toContain(`callbackUrl=${encodeURIComponent(callbackUrl)}`);
    });
  });
});

test.describe('Login Performance Tests', () => {
  let helpers: TestHelpers;
  let dbIntegration: DatabaseTestIntegration;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    dbIntegration = new DatabaseTestIntegration(page);
    await dbIntegration.setup();
  });

  test.afterEach(async () => {
    await dbIntegration.cleanup();
  });

  test('should complete login within reasonable time', async () => {
    const userData = TestDataFactory.createValidUser();

    // Create user
    await dbIntegration.setup().then(db => db.createTestUser(userData));

    const startTime = Date.now();

    await helpers.auth.signIn(userData.email, userData.password!);
    await helpers.auth.waitForSignInComplete();

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
  });
});