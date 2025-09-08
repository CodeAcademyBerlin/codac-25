# CODAC Testing Guide

## 🎯 Test Status
- **Coverage**: Validation schemas, UI components, server actions, utilities
- **Test frameworks**: Vitest + React Testing Library (unit), Playwright (e2e)

## 📝 Testing Types (Next.js App Router)

### Unit Testing
Tests individual components, functions, and modules in isolation. Mock external dependencies and focus on single units of code.

### Integration Testing  
Tests how multiple components work together. Includes testing data fetching, user interactions, and component composition while mocking external services.

### End-to-End (E2E) Testing
Tests complete user workflows in a real browser environment. Validates the entire application stack from UI to database.

### Component Testing
- **Client Components**: Test interactivity, state changes, event handlers
- **Server Components**: Test rendering, data fetching logic, async operations  
- **Server Actions**: Test form submissions, data mutations, validation

*Note: Server Components run during build/request time, so they're tested differently than client-side components.*

## 🚀 Running Tests

```bash
# Unit tests
npm run test:unit           # Run all unit tests
npm run test:unit:watch     # Watch mode
npm run test:unit:coverage  # With coverage report

# E2E tests  
npm run test               # Run Playwright e2e tests
npm run test:ui            # Interactive test UI
```

## 📁 Test Organization

```
/tests/
  /e2e/                    - Playwright end-to-end tests
  /integration/            - Integration workflow tests
  /utils/                  - Test helpers and fixtures
  
Component tests:           - Co-located with source (*.test.tsx)
Server action tests:       - Co-located with actions (*.test.ts)  
Utility tests:             - Co-located with utils (*.test.ts)
```

## ✅ What's Tested

### Unit Tests
- **Validation Schemas** (`lib/validation/*.test.ts`) - Zod schemas for user, auth, documents
- **UI Components** (`components/ui/*.test.tsx`) - Input, Alert, Badge, Button with user interactions
- **Server Actions** (`actions/**/*.test.ts`) - CRUD operations with database mocking
- **Utilities** (`lib/**/*.test.ts`) - Helper functions, URL builders, error handlers

### Integration Tests
- **User workflows** (`tests/integration/`) - Complete form submissions, profile updates

### E2E Tests  
- **Auth flows** - Login, registration, permissions
- **Core features** - Document creation, user management
- **Accessibility** - WCAG compliance, keyboard navigation

## 🔧 Writing Tests

### Test File Conventions

#### Import Order (Standardized)
1. **Vitest imports** - Core testing framework functions
2. **Testing library imports** - React Testing Library, user-event
3. **Test utilities** - Custom render functions, test helpers  
4. **Source imports** - The actual code being tested

#### Describe Block Patterns
- **UI Components**: `'Button Component'`, `'Alert Components'` (plural for multiple)
- **Server Actions**: `'createUser Server Action'`, `'updateUser Server Action'`
- **Validation Schemas**: `'User Validation Schemas'`, `'Auth Validation Schemas'`
- **Utilities**: `'CN Utility Function'`, `'Get Base URL Function'`
- **Integration Tests**: `'User Profile Update Integration'`

### Component Test Pattern
```typescript
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import { render, screen } from '@/tests/utils/test-utils'

import { MyComponent } from './my-component'

describe('MyComponent Component', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

### Server Action Test Pattern
```typescript
import { describe, it, expect, vi } from 'vitest'
import { Prisma } from '@prisma/client'

import type { CreateUserInput } from '@/lib/validation/user'

import { createUser } from './create-user'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: { user: { create: vi.fn() } }
}))

describe('createUser Server Action', () => {
  it('should create user successfully', async () => {
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser)
    
    const result = await createUser(validData)
    expect(result.success).toBe(true)
  })
})
```

### Validation Schema Test Pattern
```typescript
import { describe, it, expect } from 'vitest'

import { userSchema, createUserSchema } from './user'

describe('User Validation Schemas', () => {
  describe('userSchema', () => {
    it('should validate complete user object', () => {
      const result = userSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })
  })
  
  describe('createUserSchema', () => {
    it('should require email and role', () => {
      const result = createUserSchema.safeParse(incompleteData)
      expect(result.success).toBe(false)
    })
  })
})
```

## 🛠️ Test Utilities

- **`@/tests/utils/test-utils`** - Custom render with providers
- **`@/tests/utils/fixtures`** - Mock data for tests
- **Global mocks** - Next.js router, logger, auth configured in `tests/setup.ts`

## 📋 Key Commands

```bash
# Run specific test file
npm run test:unit -- button.test.tsx

# Run tests matching pattern  
npm run test:unit -- --grep "validation"

# Debug failing test
npm run test:unit -- --reporter=verbose

# Generate coverage report
npm run test:unit:coverage
```

## 🎯 Testing Philosophy

- **Test behavior, not implementation** - Focus on user interactions and outcomes
- **Mock external dependencies** - Database, APIs, complex integrations
- **Keep tests simple and reliable** - Avoid overly complex test scenarios
- **Test critical paths** - Authentication, data operations, user workflows

The test suite provides comprehensive coverage while remaining maintainable and fast. All critical app functionality is tested with both unit and integration tests.