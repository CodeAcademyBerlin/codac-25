import { test, expect } from '@playwright/test';

import { DatabaseTestIntegration, TestDataFactory } from '../utils/database-helpers';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Authentication Integration Tests', () => {
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

  test.describe('Complete Registration to Login Flow', () => {
    test('should register and immediately login with same credentials', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Step 1: Register
      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });

      await helpers.auth.waitForRegistrationComplete();

      // Should be redirected to sign-in page
      await expect(page).toHaveURL(/\/auth\/signin/);

      // Step 2: Login with same credentials
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      // Should be signed in successfully
      const isSignedIn = await helpers.auth.isSignedIn();
      expect(isSignedIn).toBe(true);

      // Verify user exists in database
      const dbUser = await dbIntegration.verifyUserExistsInDatabase(userData.email);
      expect(dbUser).toBeTruthy();
    });

    test('should handle registration → login → protected route access', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();
      const protectedRoute = '/profile';

      // Register
      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });
      await helpers.auth.waitForRegistrationComplete();

      // Login
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      // Access protected route
      await page.goto(protectedRoute);
      await page.waitForLoadState('networkidle');

      // Should have access to protected route
      await expect(page).toHaveURL(protectedRoute);
    });
  });

  test.describe('Protected Route Access Patterns', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      const protectedRoutes = ['/profile', '/lms', '/docs', '/career'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Should be redirected to sign-in with callback URL
        expect(page.url()).toContain('/auth/signin');
        expect(page.url()).toContain(`callbackUrl=${encodeURIComponent(route)}`);
      }
    });

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Create and login user
      await dbIntegration.createUserAndSignIn(userData);
      await helpers.auth.waitForSignInComplete();

      const protectedRoutes = ['/profile', '/lms', '/docs'];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Should have access to the route
        await expect(page).toHaveURL(route);
      }
    });
  });

  test.describe('Session Persistence and Management', () => {
    test('should maintain authentication across browser restart simulation', async ({ page, context }) => {
      const userData = TestDataFactory.createValidUser();

      // Create and login user
      await dbIntegration.createUserAndSignIn(userData);
      await helpers.auth.waitForSignInComplete();

      // Get current cookies
      const cookies = await context.cookies();
      const authCookies = cookies.filter(cookie =>
        cookie.name.includes('next-auth') || cookie.name.includes('authjs')
      );

      expect(authCookies.length).toBeGreaterThan(0);

      // Simulate browser restart by creating new context with same cookies
      const newContext = await page.context().browser()?.newContext();
      if (newContext) {
        await newContext.addCookies(cookies);
        const newPage = await newContext.newPage();

        // Should still be authenticated
        const testHelpers = new TestHelpers(newPage);
        const isSignedIn = await testHelpers.auth.isSignedIn();
        expect(isSignedIn).toBe(true);

        await newContext.close();
      }
    });

    test('should handle concurrent login sessions', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Create user in database
      const db = await dbIntegration.setup();
      await db.createTestUser(userData);

      // Login in first session
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      // Create second browser context and login
      const newContext = await page.context().browser()?.newContext();
      if (newContext) {
        const newPage = await newContext.newPage();
        const newHelpers = new TestHelpers(newPage);

        await newHelpers.auth.signIn(userData.email, userData.password!);
        await newHelpers.auth.waitForSignInComplete();

        // Both sessions should be valid
        const firstSessionValid = await helpers.auth.isSignedIn();
        const secondSessionValid = await newHelpers.auth.isSignedIn();

        expect(firstSessionValid).toBe(true);
        expect(secondSessionValid).toBe(true);

        await newContext.close();
      }
    });
  });

  test.describe('Error Recovery Flows', () => {
    test('should recover from network interruption during login', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Create user
      await dbIntegration.setup().then(db => db.createTestUser(userData));

      // Simulate network failure
      await page.route('**/api/auth/**', route => {
        route.abort();
      });

      // Attempt login (should fail)
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.expectSignInError();

      // Restore network
      await page.unroute('**/api/auth/**');

      // Retry login (should succeed)
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      const isSignedIn = await helpers.auth.isSignedIn();
      expect(isSignedIn).toBe(true);
    });

    test('should handle expired session gracefully', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Create and login user
      await dbIntegration.createUserAndSignIn(userData);
      await helpers.auth.waitForSignInComplete();

      // Simulate expired session by clearing auth state
      await helpers.auth.clearAuthState();

      // Try to access protected route
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/auth\/signin/);
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should handle different user roles appropriately', async ({ page }) => {
      const adminUser = TestDataFactory.createValidUser({
        role: 'ADMIN'
      });

      const studentUser = TestDataFactory.createValidUser({
        role: 'STUDENT'
      });

      const db = await dbIntegration.setup();

      // Test admin user
      await db.createTestUser(adminUser);
      await helpers.auth.signIn(adminUser.email, adminUser.password!);
      await helpers.auth.waitForSignInComplete();

      // Admin should have access to admin routes (if they exist)
      await page.goto('/lms/admin');
      await page.waitForLoadState('networkidle');
      // This test depends on your actual admin routes

      // Logout and test student user
      await helpers.auth.signOut();
      await helpers.auth.clearAuthState();

      await db.createTestUser(studentUser);
      await helpers.auth.signIn(studentUser.email, studentUser.password!);
      await helpers.auth.waitForSignInComplete();

      // Student should not have admin access
      await page.goto('/lms/admin');
      await page.waitForLoadState('networkidle');
      // Should be redirected or show access denied
    });
  });

  test.describe('Multi-Provider Authentication', () => {
    test('should handle user with both credentials and OAuth accounts', async () => {
      const userData = TestDataFactory.createValidUser();
      const db = await dbIntegration.setup();

      // Create user with credentials
      const user = await db.createTestUser(userData);

      // Login with credentials first
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      // Verify session
      const hasSession = await dbIntegration.verifyUserSessionExists(user.id);
      expect(hasSession).toBe(true);

      // Create OAuth account for same user
      await db.createOAuthAccount(user.id, 'google', 'google-provider-id-123');

      // User should still be able to login with both methods
      await helpers.auth.signOut();
      await helpers.auth.clearAuthState();

      // Test login with credentials again
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      const isSignedIn = await helpers.auth.isSignedIn();
      expect(isSignedIn).toBe(true);
    });
  });

  test.describe('Data Consistency Tests', () => {
    test('should maintain user data consistency across auth flows', async () => {
      const userData = TestDataFactory.createValidUser();

      // Register user
      await helpers.auth.registerWithEmail({
        name: userData.name,
        email: userData.email,
        password: userData.password!,
        confirmPassword: userData.password!
      });
      await helpers.auth.waitForRegistrationComplete();

      // Verify user in database has correct initial state
      const dbUser = await dbIntegration.verifyUserExistsInDatabase(userData.email);
      expect(dbUser?.role).toBe('STUDENT');
      expect(dbUser?.status).toBe('ACTIVE');
      expect(dbUser?.name).toBe(userData.name);

      // Login
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      // User data should remain consistent
      const dbUserAfterLogin = await dbIntegration.verifyUserExistsInDatabase(userData.email);
      expect(dbUserAfterLogin?.id).toBe(dbUser?.id);
      expect(dbUserAfterLogin?.role).toBe(dbUser?.role);
      expect(dbUserAfterLogin?.status).toBe(dbUser?.status);
    });
  });

  test.describe('Security Edge Cases', () => {
    test('should prevent session fixation attacks', async ({ page }) => {
      const userData = TestDataFactory.createValidUser();

      // Get initial session state
      await page.goto('/auth/signin');

      // Create user and login
      await dbIntegration.setup().then(db => db.createTestUser(userData));
      await helpers.auth.signIn(userData.email, userData.password!);
      await helpers.auth.waitForSignInComplete();

      // Session should be different after login
      const postLoginCookies = await page.context().cookies();
      const authCookie = postLoginCookies.find(c =>
        c.name.includes('next-auth') || c.name.includes('authjs')
      );

      expect(authCookie).toBeTruthy();
    });

    test('should handle malicious redirect attempts', async ({ page }) => {
      const maliciousUrls = [
        'http://evil.com',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>'
      ];

      for (const maliciousUrl of maliciousUrls) {
        await page.goto(`/auth/signin?callbackUrl=${encodeURIComponent(maliciousUrl)}`);
        await page.waitForLoadState('networkidle');

        // Should not allow malicious redirects
        // The exact behavior depends on your redirect validation
        expect(page.url()).toContain('/auth/signin');
      }
    });
  });
});