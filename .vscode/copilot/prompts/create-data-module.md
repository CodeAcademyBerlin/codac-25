# Create Data Module

Context:

- Entity type: {{input:entity|user|doc|job|course|community}}
- Operation: {{input:operation|get-list|get-detail|search|aggregate}}
- File location: data/{{entity}}/{{operation}}.ts

Requirements:

- Create optimized data fetching logic for read operations
- Use prisma client from lib/db/prisma.ts
- Implement proper filtering, pagination, and sorting
- Add narrow selects to fetch only required fields
- Include proper TypeScript typing
- Handle empty results and error cases

Template:

```ts
// data/[entity]/[operation].ts
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

/**
 * Options for fetching entities
 */
export interface GetEntitiesOptions {
  limit?: number;
  offset?: number;
  orderBy?: "asc" | "desc";
  orderField?: "createdAt" | "title" | "updatedAt";
  filter?: {
    status?: string;
    category?: string;
    authorId?: string;
  };
}

/**
 * Fetches a list of entities with pagination, sorting, and filtering
 */
export const getEntities = cache(async (options: GetEntitiesOptions = {}) => {
  const {
    limit = 10,
    offset = 0,
    orderBy = "desc",
    orderField = "createdAt",
    filter = {},
  } = options;

  try {
    // Build where clause based on filters
    const where = {
      ...(filter.status && { status: filter.status }),
      ...(filter.category && { category: filter.category }),
      ...(filter.authorId && { authorId: filter.authorId }),
      isArchived: false, // Common pattern for soft-delete
    };

    // Fetch items with count
    const [items, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          // Select only required fields
        },
        orderBy: {
          [orderField]: orderBy,
        },
        skip: offset,
        take: limit,
      }),
      prisma.entity.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        pageSize: limit,
        offset,
      },
    };
  } catch (error) {
    logger.error("Error fetching entities", { error, options });
    throw new Error("Failed to fetch entities");
  }
});

/**
 * Fetches a single entity by ID
 */
export const getEntityById = cache(async (id: string) => {
  try {
    const entity = await prisma.entity.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        // Select only required fields
      },
    });

    if (!entity) {
      return null;
    }

    return entity;
  } catch (error) {
    logger.error("Error fetching entity by ID", { error, id });
    throw new Error("Failed to fetch entity");
  }
});
```

Example for course queries:

```ts
// data/course/get-courses.ts
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

export interface GetCoursesOptions {
  limit?: number;
  offset?: number;
  category?: string;
  isPublished?: boolean;
  searchQuery?: string;
}

/**
 * Fetches courses with filtering, pagination, and optional search
 */
export const getCourses = cache(async (options: GetCoursesOptions = {}) => {
  const {
    limit = 10,
    offset = 0,
    category,
    isPublished = true,
    searchQuery,
  } = options;

  try {
    // Build the where clause
    const where = {
      ...(category && { category }),
      isPublished,
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
        ],
      }),
    };

    // Fetch courses with count
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          category: true,
          duration: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              enrollments: true,
            },
          },
        },
        orderBy: { order: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return {
      courses,
      pagination: {
        total,
        pageSize: limit,
        offset,
      },
    };
  } catch (error) {
    logger.error("Error fetching courses", { error, options });
    throw new Error("Failed to fetch courses");
  }
});
```
