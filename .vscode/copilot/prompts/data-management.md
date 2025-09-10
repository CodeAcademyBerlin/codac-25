# Data Management

- Use Prisma ORM for all DB operations
- Use types from Prisma for safety
- Use centralized Prisma client from `lib/db/prisma.ts`
- Mutations in /actions, queries in /data
- Use `commonSelects` for consistency
- Handle errors and use transactions for complex ops
- Use select for performance
- Follow server action patterns with validation
- Cache reads where appropriate
- Use DB constraints and validation
- Handle relationships and soft deletes
- Index performance-critical queries
