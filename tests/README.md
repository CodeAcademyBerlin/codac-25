# Testing Setup Documentation

This document explains the enhanced testing setup for the CODAC project, including Prisma mocking, database helpers, and testing best practices.

## Overview

The testing infrastructure is built around:
- **Vitest** for unit and integration testing
- **Playwright** for end-to-end testing
- **vitest-mock-extended** for deep Prisma client mocking
- **@testing-library/react** for component testing

## File Structure

```
tests/
├── e2e/                    # Playwright end-to-end tests
├── integration/            # Integration tests
├── utils/                  # Testing utilities and helpers
│   ├── prisma-mock.ts      # Prisma client mocking setup
│   ├── database-helpers.ts # Database operation helpers
│   ├── fixtures.ts         # Test data fixtures and factories
│   ├── test-helpers.ts     # Playwright helpers (for e2e)
│   └── test-examples.ts    # Example test patterns
├── setup.ts               # Global test setup
└── README.md              # This file
```

## Key Features

### 1. Prisma Client Mocking

The testing setup provides a fully mocked Prisma client using `vitest-mock-extended`:

```typescript
import { mockPrisma, resetPrismaMock } from '@/tests/utils/prisma-mock'

// Automatic reset in beforeEach hooks
// Full type safety with DeepMockProxy
```

### 2. Database Helpers

Comprehensive helpers for common database operations:

```typescript
import { DatabaseHelpers } from '@/tests/utils/database-helpers'

const userHelpers = DatabaseHelpers.mockUserOperations()
userHelpers.mockCreateUser({ name: 'John', email: 'john@test.com' })
```

### 3. Test Fixtures

Factory functions for creating consistent test data:

```typescript
import { createMockUser, createMockDocument } from '@/tests/utils/fixtures'

const user = createMockUser({ role: 'ADMIN' })
const doc = createMockDocument({ authorId: user.id })
```

## Writing Tests

### Unit Tests

For testing individual functions or components:

```typescript
import { describe, test, expect, beforeEach } from 'vitest'
import { mockPrisma } from '@/tests/utils/prisma-mock'
import { DatabaseHelpers } from '@/tests/utils/database-helpers'

describe('User Service', () => {
  beforeEach(() => {
    DatabaseHelpers.resetMocks()
    DatabaseHelpers.setupCommonMocks()
  })

  test('should create user', async () => {
    const userHelpers = DatabaseHelpers.mockUserOperations()
    const expectedUser = userHelpers.mockCreateUser()
    
    // Call your service function
    // Assert results
  })
})
```

### Integration Tests

For testing complete workflows:

```typescript
import { describe, test, expect } from 'vitest'
import { mockPrisma } from '@/tests/utils/prisma-mock'
import { createMockUser } from '@/tests/utils/fixtures'

describe('User Profile Update', () => {
  test('should update user with validation', async () => {
    // Set up complete mock chain
    const user = createMockUser()
    mockPrisma.user.findUnique.mockResolvedValue(user)
    mockPrisma.user.update.mockResolvedValue({ ...user, name: 'Updated' })
    
    // Test the complete flow
    const result = await updateUserProfile(user.id, { name: 'Updated' })
    
    // Assert database calls and results
    expect(mockPrisma.user.findUnique).toHaveBeenCalled()
    expect(mockPrisma.user.update).toHaveBeenCalled()
    expect(result.success).toBe(true)
  })
})
```

### Component Tests

For testing React components:

```typescript
import { render, screen } from '@testing-library/react'
import { createMockUser } from '@/tests/utils/fixtures'
import { DatabaseHelpers } from '@/tests/utils/database-helpers'

describe('UserProfile Component', () => {
  test('should display user information', () => {
    const user = createMockUser({ name: 'John Doe' })
    const userHelpers = DatabaseHelpers.mockUserOperations()
    userHelpers.mockFindUserById(user.id, user)
    
    render(<UserProfile userId={user.id} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

## Testing Patterns

### Server Action Testing

When testing server actions, the enhanced setup automatically mocks common utilities:

```typescript
// Server action utils are automatically mocked
// Database operations use the Prisma mock
// Logger calls are mocked to avoid console noise
```

### Error Testing

Test error scenarios using the database helpers:

```typescript
const userHelpers = DatabaseHelpers.mockUserOperations()
userHelpers.mockUserError('create', new Error('Database connection failed'))

// Test your error handling
```

### Transaction Testing

Mock database transactions:

```typescript
const transactionHelpers = DatabaseHelpers.mockTransaction()
transactionHelpers.mockTransactionSuccess(expectedResult)
```

## Configuration

### Vitest Configuration

The enhanced `vitest.config.mjs` includes:
- Optimized test isolation
- Coverage reporting
- Mock management
- Performance optimizations

### Environment Variables

Tests run with mocked external dependencies:
- Database operations → Prisma mock
- Authentication → Mock auth
- Logger → Silent mock
- Next.js navigation → Mock router

## Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests in describe blocks
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock Management
- Always reset mocks in beforeEach
- Use specific mocks for each test
- Avoid shared state between tests

### 3. Data Management
- Use factory functions for test data
- Create realistic but minimal test data
- Avoid hardcoded IDs when possible

### 4. Error Testing
- Test both happy path and error scenarios
- Mock specific error types
- Verify error handling and logging

## Running Tests

```bash
# Unit tests
pnpm test:unit

# Unit tests with coverage
pnpm test:unit:coverage

# Watch mode
pnpm test:unit:watch

# UI mode
pnpm test:unit:ui

# End-to-end tests
pnpm test

# Specific test file
pnpm test:unit user.test.ts
```

## Migration from Old Setup

The enhanced setup is backward compatible but provides these improvements:

1. **Better Prisma Mocking**: Full type safety and deep mocking
2. **Database Helpers**: Reduce boilerplate in tests
3. **Enhanced Fixtures**: Factory functions with overrides
4. **Improved Performance**: Better test isolation and parallel execution
5. **Comprehensive Mocking**: All external dependencies properly mocked

## Troubleshooting

### Common Issues

1. **Mock not working**: Check that imports match the mock paths
2. **Type errors**: Ensure `vitest-mock-extended` is properly typed
3. **Test isolation**: Use `DatabaseHelpers.resetMocks()` in beforeEach
4. **Performance**: Check for async operations not being awaited

### Debugging

- Use `vi.mocked()` to access mock methods
- Check mock call history with `.mock.calls`
- Use `--reporter=verbose` for detailed test output
- Enable coverage to see test coverage

## Examples

See `tests/utils/test-examples.ts` for comprehensive examples of all testing patterns.