# Claude Code Rules for CODAC Project

## General Principles

- You are an expert in TypeScript, Node.js, Next.js with the app router, React, shadcn/ui, Tailwind, Auth.js and Prisma.
- Write clean, concise and well-commented TypeScript code
- Favor functional and declarative programming patterns over object-oriented approaches
- Prioritize code reuse and modularization over duplication
- Follow the established patterns in the codebase for consistency
- Use the custom logger for all logging operations
- Implement proper validation using Zod schemas
- Use the established server action patterns for data mutations
- Implement proper error handling and user feedback
- Follow security best practices for data handling
- Use performance optimization techniques (memoization, lazy loading)
- Implement proper testing strategies for components and functions
- Use semantic HTML and proper accessibility practices
- Follow the established patterns for state management
- Implement proper documentation for complex functions
- Use consistent naming conventions across the project
- Prioritize user experience and performance in all implementations

## TypeScript Standards

- Use TypeScript for all code; prefer `type` over `interface`
- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Leverage Prisma's generated types for database operations
- Use proper generic types for reusable components and functions
- Implement strict type checking with proper null/undefined handling
- Use discriminated unions for complex state management
- Implement proper typing for server actions and API responses
- Use const assertions for immutable data structures
- Implement proper typing for React component props and state
- Use utility types (Pick, Omit, Partial) for type transformations
- Implement proper error typing with custom error types
- Use type guards for runtime type checking
- Leverage TypeScript's template literal types for string validation

## Next.js Best Practices

- Favor React Server Components (RSC) where possible
- Minimize `'use client'` directives - only use for interactivity
- Optimize for performance and Web Vitals
- Use server actions for mutations instead of API route handlers
- Use `next/image` for optimized image loading and processing
- Implement proper loading states and error boundaries
- Use Next.js built-in caching strategies appropriately
- Leverage the App Router's streaming capabilities
- Implement proper SEO with metadata API
- Use Next.js built-in optimizations (fonts, images, scripts)
- Follow the established routing patterns in `/app` directory
- Use proper data fetching patterns with server components
- Implement progressive enhancement where appropriate
- Use dynamic imports for code splitting when beneficial
- Optimize bundle size with proper tree shaking

## UI and Styling

- Use Shadcn UI, Radix UI and Tailwind CSS for all components and styling
- Make use of the existing components in `/components/ui/` directory
- Implement responsive design with Tailwind CSS using a mobile-first approach
- Configure the Tailwind CSS theme in the `tailwind.config.ts` file
- Follow the established design patterns in the editor components
- Use consistent color schemes: brand colors for primary actions, muted colors for secondary elements
- Apply proper spacing using Tailwind's spacing scale (p-4, m-2, etc.)
- Implement dark mode support using Tailwind's dark: prefix
- Use semantic HTML elements and proper ARIA labels for accessibility
- Ensure consistent typography using Tailwind's font utilities
- Leverage existing UI component variants (button variants, card variants, etc.)
- Follow the established pattern of using `cn()` utility for conditional classes

## Code Organization

- Structure files logically, grouping related components, helpers, types and static content
- Prefer named exports for components over default exports
- Favor small, single-purpose components over large, monolithic ones
- Separate concerns between presentational and container components
- Use consistent file naming: kebab-case for files, PascalCase for components

### Project Structure

```
/actions - Server-side mutations (Create, Update, Delete operations)
/app - Next.js App Router pages and API routes
/components - Reusable UI components organized by feature
  /ui - Base UI components (buttons, inputs, dialogs)
  /layout - Layout components (PageContainer, PageHeader, Section, Grid)
  /editor - Plate.js editor components and plugins
  /dashboard - Dashboard-specific components
  /community - Community feature components
/data - Database queries and data fetching (Read operations)
/hooks - Custom React hooks for shared logic
/lib - Shared utility functions and configurations
  /db - Database connection and Prisma client
  /validation - Zod schemas for data validation
  /imaging - Image processing utilities
/public - Static assets (images, icons)
/schemas - Additional validation schemas
/types - TypeScript type definitions and DTOs
/prisma - Database schema and migrations
```

### Component Organization

- Group related components in feature-specific directories
- Keep component files focused on a single responsibility
- Use index files for clean imports when appropriate
- Separate complex components into smaller, composed parts
- Co-locate related files (component, styles, tests) when beneficial

## Error Handling

- Implement robust error handling using the established `ServerActionResult<T>` pattern
- Use the centralized error handling utilities in `lib/server-action-utils.ts`
- Provide clear and user-friendly error messages using toast notifications (Sonner)
- Handle Prisma errors consistently using `handlePrismaError()` function
- Use structured error logging with the custom logger from `lib/logger.ts`
- Implement proper validation error handling with Zod schemas
- Follow the established error handling pattern in server actions:
  - Wrap operations in try-catch blocks
  - Log errors with contextual information
  - Return consistent error response format
  - Handle specific error types (Prisma, Zod, custom)
- Use error boundaries for React component error handling
- Handle upload errors gracefully with appropriate fallbacks
- Implement retry logic for transient failures (network, database)
- Provide loading states during async operations
- Log errors with appropriate severity levels (error, warn, info)
- Include error context like userId, resourceId, and operation metadata

## Data Management

- Interact with the database exclusively using Prisma ORM client
- Leverage Prisma's generated types for type safety
- Use the centralized Prisma client from `lib/db/prisma.ts`
- Implement data operations in separate layers:
  - `/actions` for mutations (Create, Update, Delete)
  - `/data` for queries (Read operations)
- Use the `commonSelects` patterns for consistent data selection
- Apply proper error handling for database operations
- Implement transaction support for complex operations
- Use Prisma's `select` for performance optimization
- Follow the established patterns for server actions with validation
- Implement proper caching strategies for read operations
- Use database-level constraints and validation
- Handle relationship management carefully (foreign keys, cascades)
- Implement soft deletes where appropriate using `isArchived` fields
- Use proper indexing for performance-critical queries

## Security Guidelines

- Validate all user inputs using Zod schemas consistently
- Use proper authentication and authorization patterns
- Implement proper CSRF protection for all forms
- Use the established permission checking patterns
- Sanitize user-generated content before storage and display
- Implement proper rate limiting for API endpoints
- Use secure file upload validation and processing
- Follow established patterns for sensitive data handling
- Implement proper session management and token handling
- Use environment variables for all sensitive configuration
- Implement proper logging without exposing sensitive data
- Use proper data encryption for sensitive information
- Follow secure coding practices for database operations
- Implement proper input validation and output encoding
- Use Content Security Policy (CSP) headers appropriately
- Implement proper error handling without information leakage
- Use secure communication protocols (HTTPS) consistently
- Follow established patterns for user data privacy
- Implement proper backup and recovery procedures
- Use security headers and proper CORS configuration

## Performance Optimization

- Use React Server Components by default, client components only when necessary
- Implement proper loading states and skeleton screens
- Use Next.js Image component for all image assets
- Implement proper caching strategies for data fetching
- Use dynamic imports for code splitting large components
- Implement proper memoization with React.memo, useMemo, useCallback
- Use the established debouncing patterns from `hooks/use-debounce.ts`
- Optimize database queries with proper Prisma selections
- Implement proper pagination for large data sets
- Use streaming for better perceived performance
- Minimize bundle size with proper tree shaking
- Implement proper lazy loading for non-critical content
- Use established patterns for optimistic updates
- Handle large lists with virtualization when necessary
- Implement proper preloading for critical resources
- Use efficient state management patterns
- Minimize re-renders with proper dependency arrays
- Implement proper error boundaries to prevent cascading failures
- Use Web Vitals monitoring and optimization techniques
- Follow established patterns for auto-save functionality

## Layout System

- Use the unified layout components from `/components/layout/`:
  - `PageContainer` for consistent page wrappers with standardized padding and sizing
  - `PageHeader` for unified page headers with consistent typography and spacing
  - `Section` for standardized content sections with proper spacing
  - `Grid` for responsive grid system with consistent breakpoints
  - `StatsGrid` for statistics card layouts
  - `EmptyState` for reusable empty state components
- Apply consistent spacing patterns: `gap-6` for sections, `mb-8` for headers
- Use standardized container sizes: `sm`, `md`, `lg`, `xl`, `full`
- Follow responsive design patterns with mobile-first approach
- Maintain consistent typography hierarchy across all pages

## Commands and Tools

### Lint and Type Check
- Always run `npm run lint` and `npm run ts:check` before committing changes
- Fix all linting and TypeScript errors
- Use `npm run lint:fix` for auto-fixable issues

### Build and Test
- Run `pnpm build` to ensure production builds work
- Run `pnpm test` to execute all Playwright tests
- Use `pnpm test:ui` for interactive test debugging
- Test critical user flows after major changes
- Verify responsive design on different screen sizes

### Database Operations
- Use `npm run db:generate` after schema changes
- Use `npm run db:push` to sync development database
- Use appropriate seed commands for test data