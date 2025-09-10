# Test Implementation

Context:

- File to test: {{file}}
- Code to test: {{selection}}
- Test type: {{input:type|unit|integration|e2e|component}}

Requirements:

- Write comprehensive tests for the selected code
- Follow testing best practices (arrange-act-assert)
- Mock external dependencies appropriately
- Test both happy paths and error scenarios
- Ensure tests are deterministic and reliable

Unit/Integration tests:

- Use Vitest and React Testing Library
- Mock external dependencies and APIs
- Test component rendering and interactions
- Cover error states and edge cases

E2E tests:

- Use Playwright
- Focus on critical user journeys
- Test across multiple browsers if needed
- Isolate tests with proper beforeEach/afterEach

For server actions:

- Test validation logic
- Test authorization checks
- Mock Prisma client responses
- Test error handling paths

Example patterns:

- See `__tests__/components/ui/button.test.tsx` for component tests
- See `tests/auth-flow.spec.ts` for Playwright E2E tests
