# Testing Guide for CODAC

This guide covers testing practices, TDD methodology, and how to run tests in the CODAC project.

## Table of Contents

1. [Overview](#overview)
2. [Test-Driven Development (TDD)](#test-driven-development-tdd)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Structure](#test-structure)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

We use **Playwright** for end-to-end (E2E) testing in this project. Our testing approach emphasizes:

- **Test-Driven Development (TDD)** - Write tests before implementation
- **User-focused testing** - Test actual user interactions and workflows
- **Comprehensive coverage** - Test happy paths, edge cases, and error scenarios
- **Maintainable tests** - Use page object patterns and helper functions

## Test-Driven Development (TDD)

TDD follows a simple three-step cycle:

### 🔴 RED: Write a failing test first

```typescript
test('should display user profile', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible();
});
```

### 🟢 GREEN: Write minimal code to make the test pass

```typescript
// Create minimal profile page component
export default function ProfilePage() {
  return <h1>User Profile</h1>;
}
```

### 🔵 REFACTOR: Improve the code while keeping tests green

```typescript
// Enhanced profile page with better structure
export default function ProfilePage() {
  return (
    <div className="profile-container">
      <h1 className="text-2xl font-bold">User Profile</h1>
      {/* Add more features iteratively */}
    </div>
  );
}
```

### Benefits of TDD

- ✅ Better test coverage (close to 100%)
- ✅ Fewer bugs and regressions
- ✅ Cleaner, more focused code
- ✅ Better API design
- ✅ Living documentation through tests
- ✅ Confidence when refactoring

## Running Tests

### Prerequisites

1. Ensure the development server is running:
   ```bash
   pnpm dev
   ```

2. Install Playwright browsers (one-time setup):
   ```bash
   pnpm exec playwright install
   ```

### Test Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests in headless mode |
| `pnpm test:ui` | Run tests with Playwright UI (interactive) |
| `pnpm test:headed` | Run tests with browser visible |
| `pnpm test:debug` | Debug tests step by step |
| `pnpm test:report` | View HTML test report |
| `pnpm test:codegen` | Generate tests by recording browser interactions |

### Running Specific Tests

```bash
# Run specific test file
pnpm test tests/e2e/auth.spec.ts

# Run tests matching a pattern
pnpm test --grep "should sign in"

# Run tests in a specific browser
pnpm test --project=chromium

# Run tests in debug mode for specific file
pnpm test:debug tests/e2e/tdd-examples.spec.ts
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange: Set up the test
    await page.goto('/some-page');
    
    // Act: Perform the action
    await page.getByRole('button', { name: 'Click me' }).click();
    
    // Assert: Verify the result
    await expect(page.getByText('Success!')).toBeVisible();
  });
});
```

### Using Test Helpers

We provide helper functions to make testing easier:

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test('should create document after login', async ({ page }) => {
  const helpers = new TestHelpers(page);
  
  // Use authentication helpers
  await helpers.auth.signIn('user@example.com', 'password');
  
  // Use document helpers
  await helpers.documents.createDocument('My Test Document');
  
  // Use assertion helpers
  await helpers.assertions.expectURL(/\/docs\/[a-zA-Z0-9-]+/);
});
```

### TDD Examples

Check out our comprehensive TDD examples in:
- `tests/e2e/tdd-examples.spec.ts` - E2E TDD examples
- `tests/unit/tdd-unit-examples.spec.ts` - Unit test TDD examples

These files demonstrate:
- User authentication flows
- Document creation and management
- Form validation
- Navigation testing
- Search functionality
- Error handling
- Edge cases

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── example.spec.ts     # Basic example tests
│   ├── tdd-examples.spec.ts # Comprehensive TDD examples
│   └── auth.spec.ts        # Authentication tests (you can create)
├── unit/                   # Unit tests
│   └── tdd-unit-examples.spec.ts # Unit test TDD examples
└── utils/                  # Test utilities
    └── test-helpers.ts     # Helper functions and page objects
```

### File Naming Conventions

- End-to-end tests: `*.spec.ts`
- Unit tests: `*.spec.ts` or `*.test.ts`
- Helper files: `*-helpers.ts` or `*-utils.ts`
- Test data: `*-fixtures.ts` or `*-data.ts`

## Best Practices

### 1. Test Naming

Use descriptive names that explain the behavior:

```typescript
// ✅ Good - describes the expected behavior
test('should display validation error when email is invalid', async ({ page }) => {
  // ...
});

// ❌ Bad - vague and unhelpful
test('email test', async ({ page }) => {
  // ...
});
```

### 2. Test Independence

Each test should be independent and able to run alone:

```typescript
// ✅ Good - test sets up its own data
test('should display user documents', async ({ page }) => {
  const helpers = new TestHelpers(page);
  await helpers.auth.mockSignedInState();
  await helpers.mocks.mockAPIResponse('/api/docs', mockDocuments);
  // ... rest of test
});
```

### 3. Use Page Object Model

Organize complex interactions into helper functions:

```typescript
// In test-helpers.ts
export class AuthHelpers {
  async signInUser(email: string, password: string) {
    await this.page.goto('/auth/signin');
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}
```

### 4. Test User Journeys

Test complete user workflows, not just individual components:

```typescript
test('complete document creation workflow', async ({ page }) => {
  const helpers = new TestHelpers(page);
  
  // 1. Sign in
  await helpers.auth.signIn('user@example.com', 'password');
  
  // 2. Navigate to documents
  await helpers.navigation.navigateToSection('documents');
  
  // 3. Create new document
  await helpers.documents.createDocument('My Article', 'Content here');
  
  // 4. Verify document was created
  await expect(page.getByRole('heading', { name: 'My Article' })).toBeVisible();
  
  // 5. Verify it appears in document list
  await helpers.navigation.navigateToSection('documents');
  await expect(page.getByText('My Article')).toBeVisible();
});
```

### 5. Mock External Dependencies

Use mocking for external APIs and services:

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  const helpers = new TestHelpers(page);
  
  // Mock API error response
  await helpers.mocks.mockAPIError('/api/docs', 500, 'Server Error');
  
  await page.goto('/docs');
  
  // Verify error handling
  await expect(page.getByText('Failed to load documents')).toBeVisible();
});
```

### 6. Test Error Scenarios

Don't just test the happy path:

```typescript
test.describe('Error Handling', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    // Test authentication failure
  });
  
  test('should handle network errors', async ({ page }) => {
    // Test network failure scenarios
  });
  
  test('should validate required fields', async ({ page }) => {
    // Test form validation
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Tests timing out

```bash
# Increase timeout in playwright.config.ts
export default defineConfig({
  timeout: 30000, // 30 seconds
  // ...
});
```

#### 2. Element not found

```typescript
// Wait for element to appear
await page.waitForSelector('[data-testid="submit-button"]');

// Or use more specific selectors
await page.getByRole('button', { name: 'Submit' }).click();
```

#### 3. Flaky tests

```typescript
// Add explicit waits
await page.waitForLoadState('networkidle');

// Use retry assertions
await expect(page.getByText('Success')).toBeVisible({ timeout: 10000 });
```

#### 4. Database state issues

```typescript
// Clean up after tests
test.afterEach(async () => {
  // Clean up test data
  await cleanupTestData();
});
```

### Debug Tips

1. **Use `test:debug` command** to step through tests
2. **Add `await page.pause()`** to pause test execution
3. **Use `page.screenshot()`** to capture visual state
4. **Check browser console** for JavaScript errors
5. **Use Playwright trace viewer** for detailed debugging

### Getting Help

- Check the [Playwright Documentation](https://playwright.dev)
- Look at existing test examples in `tests/e2e/tdd-examples.spec.ts`
- Use `pnpm test:codegen` to generate tests by recording interactions
- Ask team members for help with complex testing scenarios

---

## Quick Start

1. **Write a failing test first** (TDD Red phase)
2. **Run the test** to confirm it fails: `pnpm test`
3. **Write minimal code** to make it pass (TDD Green phase)
4. **Run tests again** to confirm they pass
5. **Refactor** your code while keeping tests green (TDD Refactor phase)
6. **Repeat** the cycle for the next feature

Remember: **Tests are documentation**. Write them clearly so future developers (including yourself) can understand what the code should do.

Happy testing! 🧪✨