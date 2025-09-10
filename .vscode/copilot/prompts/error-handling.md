# Error Handling

- Use `ServerActionResult<T>` for errors
- Use `lib/server-action-utils.ts` for error handling
- Show user-friendly errors (Sonner)
- Handle Prisma errors with `handlePrismaError()`
- Log with `lib/logger.ts`
- Use Zod for validation errors
- Wrap ops in try-catch, log context, return consistent format
- Use error boundaries for React
- Handle upload errors gracefully
- Retry transient failures
- Provide loading states
- Log with severity and context
