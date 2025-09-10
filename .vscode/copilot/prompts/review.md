# PR / Code review prompt

Context:

- Files: {{fileList}} (list of changed files)
- Link to repo guide: .github/copilot-instructions.md

Checklist:

- Architecture: Is code placed in correct folder (app/, actions/, data/, lib/, components/)?
- Server actions: Zod validation, auth via lib/auth, tidy prisma selects, transactions when multi-step.
- RSC rules: Add `'use client'` only when interactive code present.
- Security: No raw SQL or uncontrolled user input in queries; permission checks via `lib/permissions.ts`.
- Performance: Avoid over-selecting in Prisma; ensure indexes likely exist for filters.
- Tests: Are unit/tests or Playwright e2e added for new behavior?
- CI: Will `pnpm build` and `pnpm ts:check` succeed?

Deliver:

- Short summary (2–4 lines) and per-file actionable comments.
