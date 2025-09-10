# Refactor prompt (minimal, safe)

Context:
- File: {{file}}
- Selection: {{selection}}
- Repo guide: .github/copilot-instructions.md
- Key repo patterns:
  - Next.js App Router (RSC by default)
  - Server actions in `actions/*` and queries in `data/*`
  - Use Zod schemas from `schemas/*` and `lib/server-action-utils.ts` for ServerActionResult<T>
  - DB access via `lib/db/prisma.ts` with narrow selects
  - No console; use `lib/logger.ts`

Goal:
- Make a minimal, behavior-preserving refactor for the selection or file.
- Keep API/contract surface identical unless explicitly asked to change.
- Prefer moving shared logic into `lib/*` or `components/*` when appropriate.

Deliverables:
1. The changed code (only the edited file(s)).
2. A 2–3 line justification for the change.
3. Any follow-up tasks (tests, revalidations, permissions updates).

Example server action template to mirror when refactoring writes:
```ts
// Example (do not add if not needed)
import { z } from "zod"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { handleServerAction } from "@/lib/server-action-utils"

const schema = z.object({ id: z.string(), title: z.string().min(3) })

export default async function action(input: unknown) {
  return handleServerAction(schema, input, async ({ parsed, user }) => {
    // authorization: use [permissions.ts](http://_vscodecontentref_/0)
    if (!user) throw new Error("unauthenticated")
    const updated = await prisma.doc.update({
      where: { id: parsed.id },
      data: { title: parsed.title },
      select: { id: true, title: true },
    })
    // revalidate as needed: revalidatePath(`/docs/${updated.id}`)
    return { ok: true, data: updated }
  })
}
```