# CODAC — AI assistant working guide

Use these repo-specific rules and patterns; copy existing shapes over inventing new ones.

- Architecture

  - Next.js 15 App Router (RSC by default), TypeScript strict.
  - UI: Tailwind v4 + shadcn/ui + Radix. ORM: Prisma 6 (Postgres). Auth: NextAuth v5.
  - Writes = server actions in `actions/*`; reads = queries in `data/*`; shared utils in `lib/*`.

- Key boundaries (place code accordingly)

  - `app/`: routes/layouts (server-first). API subroutes only when server actions don’t fit. Auth pages in `app/auth/*`.
  - `actions/`: mutations (e.g., `actions/doc/update-doc.ts`, `actions/job/*`, `actions/lms/*`).
  - `data/`: queries (e.g., `data/docs.ts`, `data/dashboard.ts`).
  - `lib/`: `auth/*`, `db/prisma.ts`, `server-action-utils.ts`, `permissions.ts`, `logger.ts`.
  - `components/`: primitives in `components/ui/*`, features in `components/{editor,community,profile,...}`.

- Server action contract (follow this pattern)

  - Validate input with Zod (`schemas/*`). Authorize via `lib/auth/*` + `lib/permissions.ts`.
  - Use `lib/db/prisma.ts` with narrow `select`s; wrap multi-step writes in a transaction.
  - Handle errors via `lib/server-action-utils.ts`; return `ServerActionResult<T>`; revalidate paths.

- RSC and client code

  - Default to RSC; add `'use client'` only when interactive. Use `next/image`; `cn()` for classes.
  - No `console.*`; use `lib/logger.ts`. Prefer named exports and `type` aliases; path alias `@/*` is enabled.

- Auth and routing

  - Use `auth()` from `lib/auth/auth` on the server; `next-auth/react` hooks on the client.
  - `middleware.ts` defines public routes; update allowlist if adding public pages.

- Data model highlights (see `prisma/schema.prisma`)

  - LMS: Course → Project → Lesson (+ Assignment, Enrollment, LessonProgress).
  - Community: CommunityPost/Comment/Like/Tag. Docs: Document + versions/collaborators/favorites/suggestions.
  - Jobs: Job + JobApplication. Mentorship: Mentorship + MentorSession. Portfolio: ProjectProfile/Showcase/Skill/Experience.

- Editor & content

  - Plate.js v49 editor with local-first autosave; draft key `doc_draft_{documentId}`. See `dev-docs/AUTO_SAVE_STRATEGY.md`.
  - Import/export flows in `dev-docs/IMPORT_LMS_CONTENT.md` and `dev-docs/EXPORT_DOCS_TO_MARKDOWN.md`.

- Build, test, and DB

  - Dev `pnpm dev`; Build `pnpm build`; Lint `pnpm lint`; Types `pnpm ts:check`.
  - Prisma: `pnpm db:generate`, `pnpm db:push`, seed via `pnpm db:seed`, inspect with `pnpm db:studio`.
  - E2E: Playwright via `pnpm test` / `pnpm test:ui`.

- CI expectations

  - `.github/workflows/ci.yml` runs lint, TS check, build, and posts tips on large PRs. Keep PRs focused and typed.

- Integration specifics

  - Images allowed from `utfs.io` (see `next.config.ts`); server actions body limit 2 MB.
  - External: UploadThing (files), Resend (email), Vercel AI SDK + OpenAI. Reuse env names from `README.md`.

- Where to put new code (examples)

  - New job mutation: `actions/job/create-job.ts` mirroring `actions/job/update-job.ts` with Zod + role checks; revalidate list/detail.
  - New cohort query: `data/cohort/get-cohorts.ts` with minimal `select`; consume from RSC in `app/community/*`.

- Quick pre-commit gate
  - Run `pnpm lint && pnpm ts:check && pnpm build`. If Prisma changed: `pnpm db:generate` and verify with seed or Studio.

If any guideline here is unclear or a pattern seems missing, ask and we’ll extend this file.
