# Create Server Action

Context:

- Feature: {{input:feature|doc|user|job|course|community}}
- Operation: {{input:operation|create|update|delete|move}}
- File location: actions/{{feature}}/{{operation}}-{{feature}}.ts

Requirements:

- Follow server action patterns from actions/ directory
- Validate inputs with Zod schemas
- Add proper authorization checks
- Use prisma client from lib/db/prisma.ts
- Return standardized ServerActionResult<T> shape
- Add proper logging with lib/logger.ts
- Revalidate appropriate paths after mutation

Template:

```ts
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db/prisma";
import { handleServerAction } from "@/lib/server-action-utils";
import { checkPermission } from "@/lib/permissions";

// Define input schema with Zod
const schema = z.object({
  // Add your schema fields here
  id: z.string().optional(), // Optional for create
  title: z.string().min(3).max(100),
  content: z.string().optional(),
});

// Define types based on schema
type Input = z.infer<typeof schema>;
type Result = {
  // Define your result type
  id: string;
  title: string;
};

/**
 * Server action to perform operation on entity
 */
export async function actionName(input: unknown) {
  return handleServerAction(schema, input, async ({ parsed, user }) => {
    // Check authentication
    if (!user) {
      throw new Error("Unauthorized");
    }

    try {
      // For update/delete operations, check permissions
      if (parsed.id) {
        const existing = await prisma.entity.findUnique({
          where: { id: parsed.id },
          select: { id: true, authorId: true },
        });

        if (!existing) {
          throw new Error("Item not found");
        }

        // Check permission (use lib/permissions.ts)
        const canModify = checkPermission({
          userId: user.id,
          resourceOwnerId: existing.authorId,
          requiredRole: "ADMIN", // Or other required role
          operation: "update", // Or other operation
        });

        if (!canModify) {
          throw new Error("Permission denied");
        }
      }

      // Perform database operation
      let result;

      if (parsed.id) {
        // Update operation
        result = await prisma.entity.update({
          where: { id: parsed.id },
          data: {
            title: parsed.title,
            content: parsed.content,
            // Other fields as needed
          },
          select: {
            id: true,
            title: true,
            // Select only needed fields
          },
        });
      } else {
        // Create operation
        result = await prisma.entity.create({
          data: {
            title: parsed.title,
            content: parsed.content,
            authorId: user.id,
            // Other fields as needed
          },
          select: {
            id: true,
            title: true,
            // Select only needed fields
          },
        });
      }

      // Revalidate appropriate paths
      revalidatePath("/entities");
      if (parsed.id) {
        revalidatePath(`/entities/${parsed.id}`);
      }

      logger.info("Entity operation successful", { id: result.id });

      return { ok: true, data: result };
    } catch (error) {
      logger.error("Entity operation failed", { error, input: parsed });
      throw error;
    }
  });
}
```

Example for Course Creation:

```ts
// In actions/course/create-course.ts
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db/prisma";
import { handleServerAction } from "@/lib/server-action-utils";

const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  category: z.enum([
    "WEB_DEVELOPMENT",
    "DATA_SCIENCE",
    "UX_UI_DESIGN",
    "DIGITAL_MARKETING",
    "CAREER_DEVELOPMENT",
    "SOFT_SKILLS",
  ]),
  thumbnail: z.string().optional(),
  order: z.number().default(0),
});

export async function createCourse(input: unknown) {
  return handleServerAction(
    createCourseSchema,
    input,
    async ({ parsed, user }) => {
      if (!user || (user.role !== "ADMIN" && user.role !== "MENTOR")) {
        throw new Error(
          "Unauthorized: Only admins and mentors can create courses"
        );
      }

      try {
        const course = await prisma.course.create({
          data: {
            title: parsed.title,
            description: parsed.description,
            category: parsed.category,
            thumbnail: parsed.thumbnail,
            order: parsed.order,
            isPublished: false, // Default to unpublished
          },
          select: {
            id: true,
            title: true,
            category: true,
            isPublished: true,
          },
        });

        // Revalidate paths
        revalidatePath("/lms");
        revalidatePath("/lms/courses");

        logger.info("Course created successfully", { courseId: course.id });

        return { ok: true, data: course };
      } catch (error) {
        logger.error("Course creation failed", { error, input: parsed });
        throw error;
      }
    }
  );
}
```
