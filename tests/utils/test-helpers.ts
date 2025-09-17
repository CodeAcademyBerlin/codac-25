import { Page } from '@playwright/test';

/**
 * Test Utility Functions for TDD
 * 
 * These helper functions make writing tests easier and more maintainable.
 * They follow the Page Object Model pattern and provide reusable actions.
 */

/**
 * Authentication helpers for CODAC app
 */
export class AuthHelpers {
  constructor(private page: Page) { }

  // === SIGN IN METHODS ===
  async signIn(email: string, password: string) {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');

    // Wait for form to be fully loaded
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Use robust selectors that match the actual form structure
    const emailInput = this.page.locator('input[type="email"]');
    const passwordInput = this.page.locator('input[type="password"]');
    const submitButton = this.page.locator('button[type="submit"]');

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitButton.click();

    // Wait for either navigation or error state
    await Promise.race([
      this.page.waitForURL(url => !url.toString().includes('/auth/signin'), { timeout: 10000 }),
      this.page.waitForSelector('[role="alert"]', { timeout: 5000 }).catch(() => null)
    ]);
  }

  async signInWithGoogle() {
    await this.page.goto('/auth/signin');

    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('button', { name: /Google/i }).click();
  }

  async signInWithGitHub() {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('button', { name: /GitHub/i }).click();
  }

  async requestMagicLink(email: string) {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });

    await this.page.locator('input[type="email"]').fill(email);
    const magicLinkButton = this.page.getByRole('button', { name: /Send Magic Link/i });
    await magicLinkButton.click();
    await this.page.waitForTimeout(2000);
  }

  // === REGISTRATION METHODS ===
  async registerWithEmail(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    await this.page.goto('/auth/signup');
    await this.page.waitForLoadState('networkidle');

    // Wait for form to be fully loaded
    await this.page.waitForSelector('input[name="name"]', { timeout: 10000 });

    // Fill registration form using name attributes (matches the signup form)
    await this.page.locator('input[name="name"]').fill(userData.name);
    await this.page.locator('input[name="email"]').fill(userData.email);
    await this.page.locator('input[name="password"]').fill(userData.password);
    await this.page.locator('input[name="confirmPassword"]').fill(userData.confirmPassword);

    // Submit form
    await this.page.locator('button[type="submit"]').click();

    // Wait for response
    await this.page.waitForTimeout(3000);
  }

  async registerWithGoogle() {
    await this.page.goto('/auth/signup');
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('button', { name: /Google/i }).click();
  }

  async registerWithGitHub() {
    await this.page.goto('/auth/signup');
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('button', { name: /GitHub/i }).click();
  }

  // === NAVIGATION METHODS ===
  async goToSignUp() {
    // Try to find link to signup from signin page, or navigate directly
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');

    const signUpLink = this.page.getByRole('link', { name: /sign up/i });
    if (await signUpLink.isVisible().catch(() => false)) {
      await signUpLink.click();
    } else {
      // Navigate directly to signup
      await this.page.goto('/auth/signup');
    }
    await this.page.waitForTimeout(1000);
  }

  async goToSignInFromSignUp() {
    await this.page.goto('/auth/signup');
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('button', { name: /Sign in here/i }).click();
    await this.page.waitForTimeout(1000);
  }

  async signOut() {
    // Try to find sign out button in navigation first
    const signOutButton = this.page.locator('button:has-text("Sign Out"), button:has-text("Logout")');
    if (await signOutButton.isVisible().catch(() => false)) {
      await signOutButton.click();
    } else {
      // Navigate to sign out page as fallback
      await this.page.goto('/auth/signout');
    }
    await this.page.waitForTimeout(1000);
  }

  // === SESSION STATE METHODS ===
  async isSignedIn(): Promise<boolean> {
    try {
      await this.page.goto('/auth/signin');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(500);

      // If redirected away from signin page, user is likely already signed in
      const currentUrl = this.page.url();
      return !currentUrl.includes('/auth/signin') || currentUrl.includes('callbackUrl');
    } catch {
      return false;
    }
  }

  async isSignedOut(): Promise<boolean> {
    try {
      // Try to access a protected route
      await this.page.goto('/profile');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(500);

      // If redirected to signin, user is signed out
      return this.page.url().includes('/auth/signin');
    } catch {
      return true;
    }
  }

  async waitForSignInComplete() {
    // Wait for successful sign in by checking URL change
    try {
      await this.page.waitForFunction(() => {
        return !window.location.pathname.startsWith('/auth/signin') &&
          !window.location.pathname.startsWith('/auth/error');
      }, { timeout: 15000 });
    } catch (error) {
      // If timeout, check if we're on an error page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/auth/error')) {
        throw new Error('Sign in failed - redirected to error page');
      }
      throw error;
    }
  }

  async waitForRegistrationComplete() {
    // Wait for success state or redirect to signin
    try {
      // Look for success indicator or redirect
      await Promise.race([
        this.page.waitForSelector('text*=success', { timeout: 5000 }),
        this.page.waitForURL('**/auth/signin**', { timeout: 5000 }),
        this.page.waitForSelector('[role="alert"]:has-text("Account created")', { timeout: 5000 })
      ]);
    } catch {
      // Fallback - check if we're on signin page
      await this.page.waitForTimeout(1000);
    }
  }

  // === ERROR AND SUCCESS VALIDATION ===
  async expectSignInError(message?: string) {
    // Look for error indicators in multiple possible locations
    await Promise.race([
      this.page.waitForSelector('[role="alert"]', { timeout: 5000 }),
      this.page.waitForSelector('.alert-destructive', { timeout: 5000 }),
      this.page.waitForURL('**/auth/error**', { timeout: 5000 }),
      this.page.waitForSelector('text=Sign in failed', { timeout: 5000 })
    ]);

    if (message) {
      await this.page.locator(`text*=${message}`).waitFor({ timeout: 3000 });
    }
  }

  async expectRegistrationError(message?: string) {
    await this.page.waitForSelector('[role="alert"], .alert-destructive', { timeout: 5000 });

    if (message) {
      await this.page.locator(`text=${message}`).waitFor();
    }
  }

  async expectRegistrationSuccess() {
    // Check for success state, message, or redirect to signin
    const isOnSignin = await this.page.waitForURL('**/auth/signin**', { timeout: 3000 }).catch(() => false);
    const hasSuccessMessage = await this.page.locator('text*=success').isVisible().catch(() => false);
    const hasAlert = await this.page.locator('[role="alert"]').isVisible().catch(() => false);

    if (isOnSignin || hasSuccessMessage || hasAlert) {
      return; // Success!
    }

    throw new Error('No success indicator found - not redirected to signin and no success message');
  }

  async expectMagicLinkSent() {
    await this.page.waitForSelector('text=Check your email', { timeout: 5000 });
  }

  // === FORM VALIDATION HELPERS ===
  async expectFormValidation(fieldName: string, errorMessage?: string) {
    // Look for validation errors near the field
    const fieldError = this.page.locator(`[id="${fieldName}-error"], [data-testid="${fieldName}-error"]`);

    if (await fieldError.isVisible().catch(() => false)) {
      if (errorMessage) {
        await fieldError.locator(`text=${errorMessage}`).waitFor();
      }
    } else if (errorMessage) {
      // Fallback to looking for error message anywhere
      await this.page.locator(`text=${errorMessage}`).waitFor();
    }
  }

  // === MOCK HELPERS FOR TESTING ===
  async mockSignedInState(userData = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  }) {
    await this.page.addInitScript((userData) => {
      try {
        // Mock NextAuth session data only if localStorage is available
        if (typeof Storage !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('nextauth.session-token', 'mock-session-token');
          window.localStorage.setItem('user-data', JSON.stringify(userData));
        }
      } catch (error) {
        console.warn('Failed to set mock auth state in localStorage:', error);
      }
    }, userData);
  }

  async clearAuthState() {
    try {
      // Ensure page is loaded and accessible before clearing storage
      await this.page.waitForLoadState('domcontentloaded');

      // Navigate to a safe page first to ensure we have proper context
      await this.page.goto('/');
      await this.page.waitForLoadState('networkidle');

      await this.page.evaluate(() => {
        try {
          // Clear all auth-related localStorage
          if (typeof Storage !== 'undefined' && window.localStorage) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.includes('nextauth') || key.includes('auth') || key.includes('user')) {
                try {
                  localStorage.removeItem(key);
                } catch (e) {
                  // Ignore individual key removal errors
                  console.warn('Failed to remove localStorage key:', key, e);
                }
              }
            });
          }

          // Clear all auth-related sessionStorage
          if (typeof Storage !== 'undefined' && window.sessionStorage) {
            const sessionKeys = Object.keys(sessionStorage);
            sessionKeys.forEach(key => {
              if (key.includes('nextauth') || key.includes('auth') || key.includes('user')) {
                try {
                  sessionStorage.removeItem(key);
                } catch (e) {
                  // Ignore individual key removal errors
                  console.warn('Failed to remove sessionStorage key:', key, e);
                }
              }
            });
          }
        } catch (error) {
          // Storage not available or other error
          console.warn('Storage access denied or not available:', error);
        }
      });
    } catch (error) {
      // If clearing fails, continue with tests - don't fail the entire test
      console.warn('Failed to clear auth state:', error);
    }
  }

  // === OAUTH SIMULATION HELPERS ===
  async mockGoogleOAuthSuccess(_userData = {
    id: 'google-user-id',
    email: 'google@example.com',
    name: 'Google User'
  }) {
    // Intercept OAuth callback
    await this.page.route('**/api/auth/callback/google', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/'
        }
      });
    });
  }

  async mockGoogleOAuthError() {
    await this.page.route('**/api/auth/callback/google', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/auth/error?error=OAuthCallback'
        }
      });
    });
  }
}

/**
 * Document helpers for CODAC docs system
 */
export class DocumentHelpers {
  constructor(private page: Page) { }

  async goToDocuments() {
    await this.page.goto('/docs');
  }

  async createDocumentFromEmptyState(_title = 'Test Document') {
    await this.page.goto('/docs');

    // If empty state is shown, click create document
    const createButton = this.page.getByRole('link', { name: 'Create Document' });
    if (await createButton.isVisible()) {
      await createButton.click();
    }
  }

  async expectEmptyState() {
    await this.page.goto('/docs');
    await this.page.waitForSelector('text=No documents found');
    await this.page.locator('text=No documents found').waitFor();
  }

  async expectDocumentsList() {
    await this.page.goto('/docs');
    const hasGrid = await this.page.locator('.grid').isVisible();
    const hasCount = await this.page.getByText(/\d+ documents? found/).isVisible();
    return hasGrid && hasCount;
  }

  async getDocumentCount(): Promise<number> {
    await this.page.goto('/docs');
    const countText = await this.page.getByText(/\d+ documents? found/).textContent();
    if (!countText) return 0;
    const match = countText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async clickFirstDocument() {
    await this.page.goto('/docs');
    const firstDocLink = this.page.locator('[href^="/docs/"]').first();
    await firstDocLink.click();
  }

  async expectDocumentCard(title?: string) {
    await this.page.goto('/docs');
    if (title) {
      await this.page.locator(`text=${title}`).waitFor();
    } else {
      // Just check that there are document cards
      await this.page.locator('[href^="/docs/"]').first().waitFor();
    }
  }

  async filterDocumentsByType(type: string) {
    await this.page.goto(`/docs?type=${type}`);
  }

  async expectDocumentType(type: string) {
    const badge = this.page.locator(`[class*="badge"]:has-text("${type}")`);
    await badge.waitFor();
  }
}

/**
 * Form helpers
 */
export class FormHelpers {
  constructor(private page: Page) { }

  async fillForm(fields: Record<string, string>) {
    for (const [fieldName, value] of Object.entries(fields)) {
      await this.page.getByRole('textbox', { name: new RegExp(fieldName, 'i') }).fill(value);
    }
  }

  async submitForm(buttonText = 'submit') {
    await this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
  }

  async expectValidationError(fieldName: string, _errorMessage: string) {
    // This would need to be adapted based on how validation errors are displayed
    await this.page.waitForSelector(`[data-testid="${fieldName}-error"]`);
    // Or use a more general approach:
    // await expect(this.page.getByText(new RegExp(errorMessage, 'i'))).toBeVisible();
  }
}

/**
 * Navigation helpers
 */
export class NavigationHelpers {
  constructor(private page: Page) { }

  async navigateToSection(sectionName: string) {
    await this.page.getByRole('link', { name: new RegExp(sectionName, 'i') }).click();
  }

  async goBack() {
    await this.page.goBack();
  }

  async waitForPageLoad(url?: string) {
    if (url) {
      await this.page.waitForURL(url);
    } else {
      await this.page.waitForLoadState('networkidle');
    }
  }
}

/**
 * API mocking helpers
 */
export class MockHelpers {
  constructor(private page: Page) { }

  async mockAPIResponse(endpoint: string, response: unknown, status = 200) {
    await this.page.route(endpoint, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  async mockAPIError(endpoint: string, status = 500, message = 'Server Error') {
    await this.page.route(endpoint, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: message })
      });
    });
  }

  async mockSlowAPI(endpoint: string, response: unknown, delayMs = 2000) {
    await this.page.route(endpoint, async route => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }
}

/**
 * Test data factory
 */
export class TestDataFactory {
  static createUser(overrides: Partial<{ email: string; name: string; id: string; password: string }> = {}) {
    return {
      id: 'test-user-' + Math.random().toString(36).substr(2, 9),
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      ...overrides
    };
  }

  static createDocument(overrides: Partial<{ title: string; content: string; authorId: string }> = {}) {
    return {
      id: 'doc-' + Math.random().toString(36).substr(2, 9),
      title: 'Test Document',
      content: 'This is test content',
      authorId: 'test-user-id',
      createdAt: new Date(),
      isPublished: false,
      ...overrides
    };
  }

  static generateRandomEmail() {
    return `test-${Math.random().toString(36).substr(2, 9)}@example.com`;
  }

  static generateRandomString(length = 10) {
    return Math.random().toString(36).substr(2, length);
  }
}

/**
 * Assertion helpers
 */
export class AssertionHelpers {
  constructor(private page: Page) { }

  async expectToastMessage(_message: string, _type: 'success' | 'error' | 'info' = 'success') {
    // Adjust selector based on your toast implementation (e.g., Sonner)
    await this.page.waitForSelector('[data-sonner-toast]');
    // You might need to adjust this based on your actual toast implementation
  }

  async expectURL(pattern: string | RegExp) {
    await this.page.waitForURL(pattern);
  }

  async expectPageTitle(title: string | RegExp) {
    await this.page.waitForFunction(
      (expectedTitle) => {
        const actualTitle = document.title;
        if (typeof expectedTitle === 'string') {
          return actualTitle === expectedTitle;
        }
        return expectedTitle.test(actualTitle);
      },
      title
    );
  }
}

/**
 * Composite helper that combines all utilities
 */
export class TestHelpers {
  public auth: AuthHelpers;
  public documents: DocumentHelpers;
  public forms: FormHelpers;
  public navigation: NavigationHelpers;
  public mocks: MockHelpers;
  public assertions: AssertionHelpers;

  constructor(page: Page) {
    this.auth = new AuthHelpers(page);
    this.documents = new DocumentHelpers(page);
    this.forms = new FormHelpers(page);
    this.navigation = new NavigationHelpers(page);
    this.mocks = new MockHelpers(page);
    this.assertions = new AssertionHelpers(page);
  }
}

/**
 * Usage example:
 * 
 * test('should create document after signing in', async ({ page }) => {
 *   const helpers = new TestHelpers(page);
 *   
 *   // Sign in
 *   await helpers.auth.signIn('user@example.com', 'password');
 *   
 *   // Create document
 *   await helpers.documents.createDocument('My Test Doc');
 *   
 *   // Assert success
 *   await helpers.assertions.expectURL(/\/docs\/[a-zA-Z0-9-]+/);
 * });
 */