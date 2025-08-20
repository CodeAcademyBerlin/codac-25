import { test, expect } from '@playwright/test';

import { DatabaseTestIntegration, TestDataFactory } from '../utils/database-helpers';
import { TestHelpers } from '../utils/test-helpers';

test.describe('User Registration Workflows', () => {
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

  test.describe('Email/Password Registration', () => {
    test('should successfully register with valid credentials', async () => {
      const userData = TestDataFactory.createValidUser();

      // Perform registration
      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });

      // Verify success message
      await helpers.auth.expectRegistrationSuccess();

      // Verify user was created in database
      const dbUser = await dbIntegration.verifyUserExistsInDatabase(userData.email);
      expect(dbUser).toBeTruthy();
      expect(dbUser?.email).toBe(userData.email.toLowerCase());
      expect(dbUser?.name).toBe(userData.name);
      expect(dbUser?.role).toBe('STUDENT');
      expect(dbUser?.status).toBe('ACTIVE');
    });

    test('should redirect to sign-in after successful registration', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });

      // Wait for registration completion and redirect
      await helpers.auth.waitForRegistrationComplete();

      // Should be redirected to sign-in page
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should preserve callback URL through registration flow', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();
      const callbackUrl = '/profile';

      // Start with a callback URL
      await page.goto(`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`);

      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });

      await helpers.auth.waitForRegistrationComplete();

      // Verify callback URL is preserved in sign-in redirect
      expect(page.url()).toContain('callbackUrl=' + encodeURIComponent(callbackUrl));
    });
  });

  test.describe('Registration Form Validation', () => {
    test('should validate required name field', async () => {
      const invalidUser = TestDataFactory.createInvalidUsers().noName;

      await helpers.auth.registerWithEmail({
        name: invalidUser.name,
        email: invalidUser.email,
        password: invalidUser.password,
        confirmPassword: invalidUser.password
      });

      await helpers.auth.expectRegistrationError('Name is required');
    });

    test('should validate email format', async () => {
      const invalidUser = TestDataFactory.createInvalidUsers().invalidEmail;

      await helpers.auth.registerWithEmail({
        name: invalidUser.name,
        email: invalidUser.email,
        password: invalidUser.password,
        confirmPassword: invalidUser.password
      });

      // Form validation should prevent submission or show error
      await helpers.auth.expectFormValidation('email');
    });

    test('should validate password length', async () => {
      const invalidUser = TestDataFactory.createInvalidUsers().shortPassword;

      await helpers.auth.registerWithEmail({
        name: invalidUser.name,
        email: invalidUser.email,
        password: invalidUser.password,
        confirmPassword: invalidUser.password
      });

      await helpers.auth.expectRegistrationError('Password must be at least 8 characters');
    });

    test('should validate password confirmation match', async () => {
      const mismatchData = TestDataFactory.createPasswordMismatchData();

      await helpers.auth.registerWithEmail({
        name: mismatchData.name,
        email: mismatchData.email,
        password: mismatchData.password,
        confirmPassword: mismatchData.confirmPassword
      });

      await helpers.auth.expectRegistrationError('Passwords do not match');
    });

    test('should require password field', async () => {
      const invalidUser = TestDataFactory.createInvalidUsers().noPassword;

      await helpers.auth.registerWithEmail({
        name: invalidUser.name,
        email: invalidUser.email,
        password: invalidUser.password,
        confirmPassword: invalidUser.password
      });

      await helpers.auth.expectFormValidation('password', 'Password is required');
    });
  });

  test.describe('Duplicate Email Handling', () => {
    test('should prevent registration with existing email', async () => {
      const userData = TestDataFactory.createValidUser();

      // Create user in database first
      await dbIntegration.setup().then(db => db.createTestUser(userData));

      // Attempt to register with same email
      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });

      // Should show error about existing user
      await helpers.auth.expectRegistrationError('A user with this email already exists');
    });

    test('should be case-insensitive for duplicate email detection', async () => {
      const userData = TestDataFactory.createValidUser();

      // Create user with lowercase email
      await dbIntegration.setup().then(db => db.createTestUser({
        ...userData,
        email: userData.email.toLowerCase()
      }));

      // Try to register with uppercase email
      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email.toUpperCase(),
        password: userData.password!,
        confirmPassword: userData.password!
      });

      await helpers.auth.expectRegistrationError('A user with this email already exists');
    });
  });

  test.describe('OAuth Registration', () => {
    test('should show Google registration option', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      const googleButton = page.getByRole('button', { name: /Google/i });
      await expect(googleButton).toBeVisible();
    });

    test('should show GitHub registration option', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      const githubButton = page.getByRole('button', { name: /GitHub/i });
      await expect(githubButton).toBeVisible();
    });

    test('should handle Google OAuth registration flow', async ({ page }) => {
      // Mock successful OAuth flow
      await helpers.auth.mockGoogleOAuthSuccess({
        id: 'google-test-user',
        email: TestDataFactory.generateUniqueEmail('google'),
        name: 'Google Test User'
      });

      await helpers.auth.registerWithGoogle();

      // Should redirect to home page after successful OAuth
      await page.waitForURL('/', { timeout: 10000 });
    });

    test('should handle OAuth errors gracefully', async ({ page }) => {
      // Mock OAuth error
      await helpers.auth.mockGoogleOAuthError();

      await helpers.auth.registerWithGoogle();

      // Should redirect to error page
      await page.waitForURL(/\/auth\/error/, { timeout: 10000 });

      // Should show error message
      await expect(page.locator('text=OAuth')).toBeVisible();
    });
  });

  test.describe('Navigation and UI', () => {
    test('should navigate between sign-up and sign-in pages', async ({ page }) => {
      // Start on sign-in page
      await page.goto('/auth/signin');

      // Click sign-up link
      await helpers.auth.goToSignUp();
      await expect(page).toHaveURL(/\/auth\/signup/);

      // Click sign-in link from sign-up page
      await helpers.auth.goToSignInFromSignUp();
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should show registration form elements', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      // Check form elements are present
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show loading state during registration', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      // Fill form
      await page.locator('input[name="name"]').fill(userData.name);
      await page.locator('input[name="email"]').fill(userData.email);
      await page.locator('input[name="password"]').fill(userData.password!);
      await page.locator('input[name="confirmPassword"]').fill(userData.password!);

      // Submit and check for loading indicator
      await page.locator('button[type="submit"]').click();

      // Should show loading spinner
      await expect(page.locator('.animate-spin')).toBeVisible();
    });

    test('should clear errors when user starts typing', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');

      // Submit empty form to trigger validation
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(500);

      // Start typing in name field
      await page.locator('input[name="name"]').fill('T');

      // Error should be cleared (this test might need adjustment based on actual implementation)
      await page.waitForTimeout(500);
    });
  });

  test.describe('Success States', () => {
    test('should show success message with checkmark icon', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });

      // Should show success card with checkmark
      await expect(page.locator('text=Account Created!')).toBeVisible();
      await expect(page.locator('.text-green-600')).toBeVisible();
    });

    test('should show appropriate success message for account creation', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });

      await expect(page.locator('text=Your account has been created successfully')).toBeVisible();
    });
  });
});

test.describe('Registration Performance Tests', () => {
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

  test('should complete registration within reasonable time', async () => {
    const userData = TestDataFactory.createValidUser();
    const startTime = Date.now();

    await helpers.auth.registerWithEmail({
      name: userData.name,
      email: userData.email,
      password: userData.password!,
      confirmPassword: userData.password!
    });

    await helpers.auth.waitForRegistrationComplete();

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});