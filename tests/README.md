# CODAC Testing Strategy

This document outlines the different types of tests used in the CODAC project and how to run them.

## Test Types

### 1. Unit Tests (Vitest + React Testing Library)

**Location**: Co-located with source files (`*.test.ts`, `*.test.tsx`)

**Purpose**: Test individual functions, components, and modules in isolation

#### 1.1 Pure Function Unit Tests

**Examples**: `lib/utils.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge classes correctly', () => {
    expect(cn('px-2 py-1', 'text-sm')).toBe('px-2 py-1 text-sm')
  })
  
  it('should handle conditional classes', () => {
    expect(cn('px-2', true && 'py-1')).toBe('px-2 py-1')
    expect(cn('px-2', false && 'py-1')).toBe('px-2')
  })
})
```

**Best Practices**:
- Test edge cases and error conditions
- Use descriptive test names that explain the expected behavior
- Test one behavior per test case
- No mocking needed for pure functions

#### 1.2 React Component Unit Tests

**Examples**: `components/ui/button.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@/tests/utils/test-utils'
import { Button } from './button'

describe('Button Component', () => {
  it('should render all button variants', () => {
    const variants = ['default', 'destructive', 'outline'] as const
    variants.forEach((variant) => {
      render(<Button variant={variant}>{variant}</Button>)
      const button = screen.getByRole('button', { name: variant })
      expect(button).toHaveClass(/* expected classes */)
    })
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

**Testing Approach**:
- **Render Testing**: Verify component renders correctly with different props
- **Behavior Testing**: Test user interactions (clicks, form submissions, etc.)
- **Accessibility Testing**: Ensure proper ARIA attributes and keyboard navigation
- **Conditional Rendering**: Test different states and prop combinations
- **Event Handling**: Verify callbacks are triggered correctly

**What to Test in Components**:
✅ **DO Test**:
- Props handling and rendering variations
- User interactions and event callbacks  
- Conditional rendering logic
- Accessibility attributes
- Error states and loading states
- Component state changes

❌ **DON'T Test**:
- Implementation details (internal state, methods)
- Third-party library functionality
- CSS styling (unless critical to behavior)
- Complex business logic (test in server actions instead)

#### 1.3 Server Action Unit Tests

**Examples**: `actions/user/create-user.test.ts`
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import { mockUserPrivate } from '@/tests/utils/fixtures'

// Mock database module
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { createUser } from './create-user'
import { prisma } from '@/lib/db'

const mockPrisma = vi.mocked(prisma)

describe('createUser Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create user successfully', async () => {
    // Arrange
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue(mockUserPrivate)
    
    // Act
    const result = await createUser(validUserData)
    
    // Assert
    expect(result.success).toBe(true)
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: validUserData,
      select: expect.any(Object),
    })
  })

  it('should handle validation errors', async () => {
    const result = await createUser({ email: 'invalid' })
    
    expect(result.success).toBe(false)
    expect(Array.isArray(result.error)).toBe(true)
  })
})
```

**Testing Patterns for Server Actions**:
- **Happy Path**: Test successful operation with valid input
- **Validation Errors**: Test Zod schema validation failures
- **Database Errors**: Test Prisma error handling (unique constraints, etc.)
- **Authentication/Authorization**: Test permission checking
- **Edge Cases**: Test boundary conditions and error states

#### 1.4 Integration Tests

**Purpose**: Test how multiple units work together while still mocking external dependencies

**Examples**:
```typescript
// Form submission integration test
describe('User Registration Flow', () => {
  it('should submit form and show success message', async () => {
    const user = userEvent.setup()
    
    // Mock the server action
    vi.mock('@/actions/user/create-user', () => ({
      createUser: vi.fn().mockResolvedValue({ success: true, data: mockUser })
    }))
    
    render(<UserRegistrationForm />)
    
    // Fill out form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/name/i), 'Test User')
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    // Verify success state
    expect(await screen.findByText(/registration successful/i)).toBeInTheDocument()
  })
})
```

**Integration Test Scenarios**:
- Form submission with validation
- Component state management with context
- Multi-step workflows (wizards, onboarding)
- Data fetching and display components
- Error handling across component boundaries

#### Key Testing Libraries

**React Testing Library Methods**:
- `render()` - Render components for testing
- `screen.getByRole()` - Find elements by accessibility role
- `screen.getByLabelText()` - Find form inputs by label
- `screen.queryBy*()` - Find elements that may not exist
- `waitFor()` - Wait for async operations
- `fireEvent` vs `userEvent` - Prefer userEvent for realistic interactions

**Vitest Utilities**:
- `vi.fn()` - Create mock functions
- `vi.mock()` - Mock entire modules
- `vi.clearAllMocks()` - Reset mocks between tests
- `expect.objectContaining()` - Partial object matching
- `expect.toHaveBeenCalledWith()` - Verify function calls

**Commands**:
```bash
pnpm test:unit           # Run all unit tests
pnpm test:unit:watch     # Run tests in watch mode
pnpm test:unit:coverage  # Run tests with coverage report
pnpm test:unit:ui        # Interactive test UI
pnpm test:unit -- button # Run specific test files
```

### 2. End-to-End Tests (Playwright)

**Location**: `tests/e2e/` directory

**Purpose**: Test complete user workflows and application behavior in a real browser

**Examples**:
- `tests/e2e/auth-login.spec.ts` - User authentication flow
- `tests/e2e/main-page-accessibility.spec.ts` - Accessibility compliance
- `tests/e2e/mobile-padding.spec.ts` - Responsive design validation

**Key Features**:
- Cross-browser testing (Chromium, Firefox, WebKit)
- Real browser automation with Playwright
- Accessibility testing with @axe-core/playwright
- Database integration with test helpers
- Screenshot and video capture on failures

**Commands**:
```bash
pnpm test              # Run all e2e tests
pnpm test:ui           # Interactive test UI
pnpm test:headed       # Run with browser UI visible
pnpm test:debug        # Debug mode with step-by-step execution
pnpm test:a11y         # Run accessibility tests only
```

## Test Organization

### Directory Structure
```
/tests
  /e2e/              - Playwright end-to-end tests
  /utils/            - Test utilities and helpers
    /test-utils.tsx  - Custom React Testing Library render
    /fixtures.ts     - Test data fixtures
    /database-helpers.ts - Database test utilities
    /test-helpers.ts     - General test helpers
  /setup.ts          - Global test configuration
  README.md          - This documentation
```

### Test File Patterns
- **Unit Tests**: `*.test.ts`, `*.test.tsx` (co-located with source)
- **E2E Tests**: `*.spec.ts` in `/tests/e2e/` directory
- **Test Utilities**: Helper files in `/tests/utils/`

## Mocking Strategy

### Unit Tests

#### Database Mocking (Prisma)
```typescript
// Mock the entire database module
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    // Add other models as needed
  },
}))

// Use in tests
const mockPrisma = vi.mocked(prisma)
mockPrisma.user.create.mockResolvedValue(mockUserData)
```

#### Component Dependencies
```typescript
// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

// Mock custom hooks
vi.mock('@/hooks/use-user', () => ({
  useUser: vi.fn(() => ({
    user: mockUser,
    isLoading: false,
    error: null,
  })),
}))

// Mock server actions
vi.mock('@/actions/user/create-user', () => ({
  createUser: vi.fn(),
}))
```

#### Context and Provider Mocking
```typescript
// Mock React Context
const MockUserProvider = ({ children }: { children: React.ReactNode }) => {
  const mockValue = {
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
  }
  return <UserContext.Provider value={mockValue}>{children}</UserContext.Provider>
}

// Use in component tests
render(
  <MockUserProvider>
    <ComponentUnderTest />
  </MockUserProvider>
)
```

#### Global Mocks (in tests/setup.ts)
- **Next.js Router**: Navigation and routing functions
- **Next.js Cache**: `revalidatePath`, `revalidateTag`
- **Logger**: Prevent console noise during tests
- **Environment Variables**: Consistent test environment

### Integration Tests

#### Partial Mocking
```typescript
// Mock only external dependencies, keep internal logic
vi.mock('@/lib/external-api', () => ({
  fetchUserData: vi.fn(),
  sendNotification: vi.fn(),
}))

// Don't mock internal business logic
// Keep: @/actions, @/lib/validation, @/components
```

#### State Management Mocking
```typescript
// Mock initial state for complex forms
const mockFormState = {
  step: 1,
  data: { email: '', name: '' },
  errors: {},
  isSubmitting: false,
}

// Test state transitions
render(<MultiStepForm initialState={mockFormState} />)
```

### E2E Tests  
- **Database**: Real test database with seeded data
- **Authentication**: Test user accounts and sessions  
- **External APIs**: May use real or mock endpoints based on test requirements
- **File Uploads**: Mock file system operations

## Test Data Management

### Unit Tests
- Use fixtures from `tests/utils/fixtures.ts`
- Create mock data specific to each test
- Avoid database dependencies

### E2E Tests
- Use database helpers for setup/teardown
- Seed test data before test runs
- Clean up after tests to maintain isolation

## Running Tests in CI/CD

Tests are automatically run in the CI/CD pipeline:
1. **Unit Tests**: Run on every commit (fast feedback)
2. **E2E Tests**: Run on pull requests and main branch
3. **Coverage**: Reported for unit tests
4. **Accessibility**: Validated in e2e test suite

## Component Testing Patterns

### 1. Form Component Testing
```typescript
describe('UserRegistrationForm', () => {
  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<UserRegistrationForm />)
    
    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    // Verify validation errors
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })

  it('should submit valid form data', async () => {
    const mockSubmit = vi.fn()
    const user = userEvent.setup()
    
    render(<UserRegistrationForm onSubmit={mockSubmit} />)
    
    // Fill out form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/name/i), 'Test User')
    await user.click(screen.getByRole('button', { name: /register/i }))
    
    // Verify submission
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User'
    })
  })
})
```

### 2. Loading and Error State Testing
```typescript
describe('UserProfile', () => {
  it('should show loading state', () => {
    vi.mock('@/hooks/use-user', () => ({
      useUser: () => ({ user: null, isLoading: true, error: null })
    }))
    
    render(<UserProfile />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should show error state', () => {
    vi.mock('@/hooks/use-user', () => ({
      useUser: () => ({ user: null, isLoading: false, error: 'Failed to load' })
    }))
    
    render(<UserProfile />)
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })
})
```

### 3. Modal and Dialog Testing
```typescript
describe('DeleteUserModal', () => {
  it('should close when cancel is clicked', async () => {
    const user = userEvent.setup()
    const mockClose = vi.fn()
    
    render(<DeleteUserModal isOpen={true} onClose={mockClose} />)
    
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockClose).toHaveBeenCalled()
  })

  it('should confirm deletion', async () => {
    const user = userEvent.setup()
    const mockDelete = vi.fn()
    
    render(<DeleteUserModal isOpen={true} onConfirm={mockDelete} />)
    
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(mockDelete).toHaveBeenCalled()
  })
})
```

## Integration Testing Scenarios

### 1. Multi-Component Workflows
```typescript
describe('Project Creation Workflow', () => {
  it('should create project and navigate to dashboard', async () => {
    const user = userEvent.setup()
    
    // Mock server actions
    vi.mock('@/actions/projects/create-project', () => ({
      createProject: vi.fn().mockResolvedValue({ 
        success: true, 
        data: { id: 'project-1', name: 'Test Project' }
      })
    }))
    
    // Mock navigation
    const mockPush = vi.fn()
    vi.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush })
    }))
    
    render(<ProjectCreationPage />)
    
    // Fill form
    await user.type(screen.getByLabelText(/project name/i), 'Test Project')
    await user.type(screen.getByLabelText(/description/i), 'A test project')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /create project/i }))
    
    // Verify success message and navigation
    expect(await screen.findByText(/project created successfully/i)).toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
})
```

### 2. Context Provider Integration
```typescript
describe('Theme Context Integration', () => {
  it('should toggle theme across components', async () => {
    const user = userEvent.setup()
    
    render(
      <ThemeProvider>
        <div>
          <ThemeToggleButton />
          <ThemedComponent />
        </div>
      </ThemeProvider>
    )
    
    // Verify initial theme
    expect(screen.getByTestId('themed-component')).toHaveClass('light-theme')
    
    // Toggle theme
    await user.click(screen.getByRole('button', { name: /toggle theme/i }))
    
    // Verify theme changed
    expect(screen.getByTestId('themed-component')).toHaveClass('dark-theme')
  })
})
```

### 3. Error Boundary Testing
```typescript
describe('Error Boundary Integration', () => {
  it('should catch and display component errors', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }
    
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    consoleSpy.mockRestore()
  })
})
```

## Best Practices

### Unit Tests
- **Single Responsibility**: Test one behavior per test case
- **Descriptive Names**: Test names should explain the expected behavior
- **AAA Pattern**: Arrange, Act, Assert for clear structure
- **Mock External Dependencies**: Keep tests isolated and fast
- **Test Edge Cases**: Include error conditions and boundary values

### Component Tests
- **User-Centric**: Test from the user's perspective using roles and labels
- **Avoid Implementation Details**: Don't test internal state or methods
- **Async Handling**: Properly wait for async operations with `waitFor`
- **Accessibility**: Include accessibility attributes in tests
- **Realistic Interactions**: Use `userEvent` over `fireEvent`

### Integration Tests  
- **Realistic Scenarios**: Test actual user workflows
- **Partial Mocking**: Mock external APIs but keep business logic
- **State Management**: Test how components work together
- **Error Handling**: Verify error boundaries and recovery
- **Performance**: Consider using `act()` for React updates

### E2E Tests
- **Critical Paths**: Focus on key user journeys
- **Page Objects**: Use page object model for maintainability
- **Visual Testing**: Include accessibility and responsive checks
- **Data Management**: Properly seed and clean test data
- **Reliability**: Make tests deterministic and robust

### General
- **TDD Approach**: Write tests before implementing features
- **Clean Test Code**: Maintain test code quality like production code
- **Living Documentation**: Tests should document expected behavior
- **Fast Feedback**: Keep unit tests fast for development workflow