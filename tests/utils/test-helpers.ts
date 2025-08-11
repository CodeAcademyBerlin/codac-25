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
  constructor(private page: Page) {}

  async signIn(email: string, password: string) {
    await this.page.goto('/auth/signin');
    await this.page.getByLabelText('Email').fill(email);
    await this.page.getByLabelText('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async signInWithGoogle() {
    await this.page.goto('/auth/signin');
    await this.page.getByRole('button', { name: /Google/i }).click();
  }

  async requestMagicLink(email: string) {
    await this.page.goto('/auth/signin');
    await this.page.getByLabelText('Email').fill(email);
    await this.page.getByRole('button', { name: /Send Magic Link/i }).click();
  }

  async goToSignUp() {
    await this.page.goto('/auth/signin');
    await this.page.getByRole('button', { name: /Sign up here/i }).click();
  }

  async signOut() {
    // Navigate to sign out page (based on actual app structure)
    await this.page.goto('/auth/signout');
  }

  // Check if user appears to be signed in by checking for redirect from sign-in page
  async isSignedIn(): Promise<boolean> {
    await this.page.goto('/auth/signin');
    // If redirected away from signin page, user is likely already signed in
    return !this.page.url().includes('/auth/signin');
  }

  // Mock authentication state for testing purposes
  async mockSignedInState(userId = 'test-user-id') {
    await this.page.addInitScript((userId) => {
      // Mock NextAuth session
      window.localStorage.setItem('nextauth.session-token', 'mock-session-token');
      window.localStorage.setItem('user-id', userId);
    }, userId);
  }

  async expectSignInError(message: string) {
    await this.page.waitForSelector('[role="alert"]');
    await this.page.locator('[role="alert"]').waitFor();
  }
}

/**
 * Document helpers for CODAC docs system
 */
export class DocumentHelpers {
  constructor(private page: Page) {}

  async goToDocuments() {
    await this.page.goto('/docs');
  }

  async createDocumentFromEmptyState(title = 'Test Document') {
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
  constructor(private page: Page) {}

  async fillForm(fields: Record<string, string>) {
    for (const [fieldName, value] of Object.entries(fields)) {
      await this.page.getByRole('textbox', { name: new RegExp(fieldName, 'i') }).fill(value);
    }
  }

  async submitForm(buttonText = 'submit') {
    await this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
  }

  async expectValidationError(fieldName: string, errorMessage: string) {
    // This would need to be adapted based on how validation errors are displayed
    const errorElement = this.page.locator(`[data-testid="${fieldName}-error"]`);
    await this.page.waitForSelector(`[data-testid="${fieldName}-error"]`);
    // Or use a more general approach:
    // await expect(this.page.getByText(new RegExp(errorMessage, 'i'))).toBeVisible();
  }
}

/**
 * Navigation helpers
 */
export class NavigationHelpers {
  constructor(private page: Page) {}

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
  constructor(private page: Page) {}

  async mockAPIResponse(endpoint: string, response: any, status = 200) {
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

  async mockSlowAPI(endpoint: string, response: any, delayMs = 2000) {
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
  static createUser(overrides: Partial<{ email: string; name: string; id: string }> = {}) {
    return {
      id: 'test-user-' + Math.random().toString(36).substr(2, 9),
      email: 'test@example.com',
      name: 'Test User',
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
  constructor(private page: Page) {}

  async expectToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
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