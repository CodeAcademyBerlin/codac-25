# Planner Mode

Context:

- Files: {{fileList}}
- Feature request: {{input:request}}

## Planning Process

First, I'll analyze the request and existing code, then ask 4-6 clarifying questions:

1. What specific problem does this solve?
2. Which components/routes will be affected?
3. Are there data model changes needed?
4. What authorization/permissions apply?
5. Are there existing patterns to follow?
6. What test coverage is expected?

After your answers, I'll create a comprehensive plan with:

- Files to modify/create
- Data model changes
- Component structure
- Authorization approach
- Tests to add
- Migration/backwards compatibility needs

I'll wait for your approval before implementing each phase, and provide updates on completion of each step.

Reference:

- Server action pattern: `actions/doc/update-doc.ts`
- Data query pattern: `data/docs.ts`
- Component pattern: `components/community/post-card.tsx`
- Test pattern: `__tests__/components/ui/button.test.tsx`
