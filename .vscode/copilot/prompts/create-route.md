# Create Route or Page

Context:

- File: {{file}}
- Feature area: {{input:area|dashboard|community|lms|job|mentorship|auth}}
- Route type: {{input:type|page|api|layout}}

Requirements:

- Follow Next.js App Router patterns
- Use RSC by default for pages and layouts
- Place fetch logic in server components or data/ directory
- Add appropriate error and loading states
- Include accessibility features and proper semantic HTML

Implementation guide:

1. Plan the route structure (pages, layouts, loading, error)
2. Identify data requirements and permissions
3. Create route-specific components in components/ if needed
4. Implement server-side data fetching through data/ modules
5. Ensure responsive design with mobile-first approach

Code structure:

```tsx
// RSC page example
import { Metadata } from "next";
import { getItems } from "@/data/items";
import { PageHeader } from "@/components/ui/page-header";
import { ItemList } from "@/components/items/item-list";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Items | CODAC",
  description: "Manage your items",
};

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="space-y-6">
      <PageHeader title="Items" description="View and manage your items" />

      {items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Create your first item to get started"
          action={{
            label: "Create Item",
            href: "/items/new",
          }}
        />
      ) : (
        <ItemList items={items} />
      )}
    </div>
  );
}
```

API route pattern:

```tsx
// API route example (when server actions won't work)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Your logic here
    return NextResponse.json({ data: [] });
  } catch (error) {
    logger.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```
