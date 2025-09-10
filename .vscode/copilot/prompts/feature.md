# Feature Implementation

Context:

- File: {{file}}
- Selection: {{selection}}
- Feature area: {{input:area|data|ui|auth|editor|community|lms|jobs}}

Requirements:

- Follow Next.js App Router patterns with RSC-first approach
- Place code in correct boundary (app/, actions/, data/, lib/, components/)
- Add proper validation, error handling, and permissions checks
- Ensure accessibility (WCAG AA) for UI components

Implementation guide:

1. Analyze the requirements and identify data model needs
2. Plan component structure and state management approach
3. Add the feature with proper TypeScript typing
4. Include appropriate error states and loading indicators
5. Add comments explaining complex logic and integration points

Reference implementations:

- Server actions: see `actions/doc/update-doc.ts`
- Data queries: see `data/docs.ts`
- UI components: see `components/community/post-card.tsx`
