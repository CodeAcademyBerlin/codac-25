# Gemini Code Rules for CODAC Project (Context7 MCP Enhanced)

## Core Principles

- You are an expert in TypeScript, Node.js, Next.js 15 with the app router, React 19, shadcn/ui, Tailwind CSS, Auth.js, Prisma 6, and Plate.js editor
- Write clean, concise, and well-commented TypeScript code with a focus on functional and declarative programming patterns
- Prioritize code reuse, modularization, and maintainability over duplication
- Follow established patterns in the codebase for consistency while applying Context7 MCP principles for enhanced modularity
- Use the custom logger for all logging operations and implement proper validation using Zod schemas
- Follow security best practices, performance optimization techniques, and accessibility standards
- Implement proper error handling and user feedback mechanisms

## TypeScript Standards (Enhanced with Context7 MCP)

- Use TypeScript for all code; prefer `type` over `interface` for simplicity unless interface merging is required
- Write concise, technical TypeScript code with accurate examples following functional programming paradigms
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`, `canEdit`)
- Leverage Prisma's generated types for database operations and Zod for validation schemas
- Implement strict type checking with proper null/undefined handling using discriminated unions where appropriate
- Use const assertions for immutable data structures and utility types (Pick, Omit, Partial) for transformations
- Implement proper error typing with custom error types and use type guards for runtime type checking
- Leverage TypeScript's template literal types for string validation and use generic types for reusable components

## Next.js 15 Best Practices (Context7 MCP Enhanced)

- Favor React Server Components (RSC) by default; minimize `'use client'` directives to only when interactivity is required
- Use server actions for mutations instead of API route handlers to leverage Next.js integrated data fetching
- Optimize for performance and Web Vitals using Next.js 15 features like Turbopack and React 19 capabilities
- Implement proper loading states, error boundaries, and use Next.js built-in caching strategies appropriately
- Leverage the App Router's streaming capabilities and implement proper SEO with metadata API
- Follow the established routing patterns in `/app` directory and use proper data fetching patterns with server components
- Use dynamic imports for code splitting when beneficial and optimize bundle size with proper tree shaking

## UI and Styling with shadcn/ui and Tailwind CSS

- Use Shadcn UI components, Radix UI primitives, and Tailwind CSS for all components and styling
- Implement responsive design with Tailwind CSS using a mobile-first approach with consistent spacing and typography
- Follow the established design patterns in the editor components and use consistent color schemes
- Implement dark mode support using Tailwind's `dark:` prefix and ensure proper accessibility with semantic HTML
- Leverage existing UI component variants and use the `cn()` utility for conditional classes
- Follow established patterns for consistent component composition and state management

## Code Organization (Context7 MCP Enhanced Modular Architecture)

### Project Structure

```
/actions        - Server-side mutations (Create, Update, Delete operations)
/app            - Next.js App Router pages and API routes
/components     - Reusable UI components organized by feature
  /ui           - Base UI components (buttons, inputs, dialogs)
  /layout       - Layout components (PageContainer, PageHeader, Section, Grid)
  /editor       - Plate.js editor components and plugins
  /dashboard    - Dashboard-specific components
  /community    - Community feature components
/data           - Database queries and data fetching (Read operations)
/hooks          - Custom React hooks for shared logic
/lib            - Shared utility functions and configurations
  /db           - Database connection and Prisma client
  /validation   - Zod schemas for data validation
  /imaging      - Image processing utilities
  /auth         - Authentication utilities
  /editor       - Editor-related utilities
/public         - Static assets (images, icons)
/schemas        - Additional validation schemas
/types          - TypeScript type definitions and DTOs
/prisma         - Database schema and migrations
```

### Component Organization (Context7 MCP Principles)

- Group related components in feature-specific directories with clear separation of concerns
- Keep component files focused on a single responsibility and co-locate related files when beneficial
- Use index files for clean imports and separate complex components into smaller, composed parts
- Follow the established pattern of using `PageContainer`, `PageHeader`, `Section`, and `Grid` for consistent layouts
- Implement proper component composition patterns with props drilling minimized through context where appropriate

## Error Handling (Context7 MCP Enhanced)

- Implement robust error handling using the established `ServerActionResult<T>` pattern with consistent error response formats
- Use the centralized error handling utilities in `lib/server-action-utils.ts` and provide clear user-friendly error messages
- Handle Prisma errors consistently using `handlePrismaError()` function and implement proper validation error handling
- Follow the established error handling pattern in server actions with structured error logging
- Use error boundaries for React component error handling and handle upload errors gracefully
- Implement retry logic for transient failures and provide loading states during async operations
- Log errors with appropriate severity levels and include contextual information

## Data Management (Context7 MCP Enhanced)

- Interact with the database exclusively using Prisma ORM client with generated types for type safety
- Implement data operations in separate layers: `/actions` for mutations, `/data` for queries
- Use the `commonSelects` patterns for consistent data selection and apply proper error handling
- Implement transaction support for complex operations and use Prisma's `select` for performance optimization
- Follow established patterns for server actions with validation and implement proper caching strategies
- Handle relationship management carefully and implement soft deletes where appropriate
- Use proper indexing for performance-critical queries and database-level constraints

## Security Guidelines (Context7 MCP Enhanced)

- Validate all user inputs using Zod schemas consistently with proper sanitization
- Implement proper authentication and authorization patterns using Auth.js with session management
- Sanitize user-generated content before storage and display with proper rate limiting
- Use environment variables for sensitive configuration and implement proper logging without exposing data
- Follow secure coding practices for database operations and implement proper input validation
- Use Content Security Policy (CSP) headers and implement proper error handling without information leakage
- Follow established patterns for user data privacy and implement proper backup procedures

## Performance Optimization (Context7 MCP Enhanced)

- Use React Server Components by default and implement proper loading states with skeleton screens
- Use Next.js Image component for all image assets and implement proper caching strategies
- Implement proper memoization with React.memo, useMemo, useCallback and use debouncing patterns
- Optimize database queries with proper Prisma selections and implement pagination for large datasets
- Use streaming for better perceived performance and minimize bundle size with tree shaking
- Implement proper lazy loading and use established patterns for optimistic updates
- Handle large lists with virtualization when necessary and implement proper preloading

## Layout System (Context7 MCP Standardized)

- Use the unified layout components from `/components/layout/` for consistent page structure:
  - `PageContainer` for standardized page wrappers with responsive sizing
  - `PageHeader` for unified page headers with consistent typography
  - `Section` for standardized content sections with proper spacing
  - `Grid` for responsive grid system with consistent breakpoints
- Apply consistent spacing patterns and follow responsive design with mobile-first approach
- Maintain consistent typography hierarchy across all pages with standardized container sizes

## Commands and Tools (Context7 MCP Verified)

### Lint and Type Check
- Always run `pnpm lint` and `pnpm ts:check` before committing changes
- Fix all linting and TypeScript errors with `pnpm lint:fix` for auto-fixable issues

### Build and Test
- Run `pnpm build` to ensure production builds work correctly
- Run `pnpm test` to execute all Playwright tests with `pnpm test:ui` for interactive debugging

### Database Operations
- Use `pnpm db:generate` after schema changes and `pnpm db:push` to sync development database
- Use appropriate seed commands for test data management

## Context7 MCP Specialized Patterns

### Server Action Pattern
```typescript
// Use the createServerAction utility for consistent server actions
export const createDocument = createServerAction(
  createDocSchema,
  async (data) => {
    // Implementation with proper validation, permission checks, and error handling
    // Return strongly typed results using Prisma generated types
  },
  'create',
  'document'
);
```

### Component Composition Pattern
```tsx
// Use compound components with consistent prop interfaces
<PageContainer size="lg" padding="md">
  <PageHeader 
    title="Page Title" 
    description="Page description"
    size="md"
  />
  <Section spacing="md">
    <SectionHeader 
      title="Section Title" 
      description="Section description"
    />
    <Grid cols="3" gap="md">
      {/* Content */}
    </Grid>
  </Section>
</PageContainer>
```

### Error Handling Pattern
```typescript
// Use centralized error handling with proper logging context
try {
  // Operation
} catch (error) {
  logger.logServerActionError('actionName', 'resourceName', error, {
    metadata: { /* contextual data */ }
  });
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return { success: false, error: handlePrismaError(error) };
  }
  
  return { success: false, error: 'An unexpected error occurred' };
}
```

### Permission Checking Pattern
```typescript
// Use centralized permission checking
const hasPermission = await checkDocumentPermission(
  userId, 
  documentId, 
  'write'
);

if (!hasPermission) {
  logger.logPermissionDenied('update', 'document', userId, {
    resourceId: documentId
  });
  return { success: false, error: 'Permission denied' };
}
```

## Gemini Agent Specific Instructions

1. Always analyze the existing codebase patterns before implementing new features
2. Use the established utility functions and helpers rather than reinventing functionality
3. Follow the file naming conventions: kebab-case for files, PascalCase for components
4. Prefer named exports over default exports for better tree-shaking
5. Use the custom logger for all logging operations with appropriate context
6. Implement comprehensive error handling with user-friendly messages
7. Ensure all components are properly typed with TypeScript
8. Use the established validation patterns with Zod schemas
9. Follow the responsive design principles implemented in the layout components
10. Implement proper accessibility attributes and semantic HTML
11. Leverage Gemini's code generation capabilities for repetitive tasks while maintaining consistency
12. Use Gemini's analytical capabilities to identify potential performance bottlenecks and optimization opportunities