# Performance Optimization

Context:

- File: {{file}}
- Component/function: {{selection}}
- Performance concern: {{input:concern|rendering|data-fetching|bundle-size|memory-usage}}

Analysis steps:

1. Identify performance bottlenecks
2. Measure current baseline performance
3. Apply appropriate optimizations
4. Verify improvement with metrics

Optimization techniques:

- RSC: Move non-interactive content to Server Components
- Rendering: Use appropriate React hooks (useMemo, useCallback)
- Data fetching: Implement request deduplication and caching
- Bundle size: Analyze and reduce imported dependencies
- Database: Optimize Prisma queries with specific selects

For Prisma queries:

- Use narrow selects to fetch only required fields
- Add appropriate indexes for frequently filtered fields
- Use transactions for multi-step operations
- Avoid N+1 query problems with include statements

For UI components:

- Implement proper component memoization
- Use image optimization with next/image
- Implement virtualization for long lists
- Use suspense boundaries strategically
