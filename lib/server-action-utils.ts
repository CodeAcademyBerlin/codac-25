import { Prisma } from "@prisma/client";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth/auth";

// Generic server action result type
export type ServerActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | z.ZodError["errors"]; validationErrors?: z.ZodError["errors"] };

// Common Prisma error handling
export function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): string {
  switch (error.code) {
    case "P2002":
      return "A record with this information already exists";
    case "P2003":
      return "Invalid reference to related record";
    case "P2025":
      return "Record not found";
    case "P2014":
      return "Invalid data provided";
    case "P2001":
      return "Required record not found";
    default:
      logger.error("Unhandled Prisma error", error);
      return "Database error occurred";
  }
}

// Common validation error handling
export function handleValidationError(
  error: unknown
): string | z.ZodError["errors"] {
  if (error instanceof Error && error.name === "ZodError") {
    return (error as z.ZodError).errors;
  }
  return "Validation failed";
}

// Utility function to create type-safe server actions with logging
export function createServerAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (validatedInput: TInput) => Promise<TOutput>,
  actionName?: string,
  resourceName?: string
) {
  return async (input: TInput): Promise<ServerActionResult<TOutput>> => {
    const startTime = Date.now();

    try {
      // Log the start of the action
      if (actionName && resourceName) {
        logger.logServerAction(actionName, resourceName, {
          metadata: {
            inputKeys: Object.keys(input as Record<string, unknown>),
          },
        });
      }

      const validatedInput = schema.parse(input);
      const result = await handler(validatedInput);

      // Log successful completion
      if (actionName && resourceName) {
        logger.info(`Server action completed: ${actionName}`, {
          action: actionName,
          resource: resourceName,
          metadata: {
            duration: Date.now() - startTime,
            success: true,
          },
        });
      }

      return { success: true, data: result };
    } catch (error) {
      // Log the error
      if (actionName && resourceName && error instanceof Error) {
        logger.logServerActionError(actionName, resourceName, error, {
          metadata: {
            duration: Date.now() - startTime,
            inputKeys: Object.keys(input as Record<string, unknown>),
          },
        });
      } else {
        logger.error(
          "Server action error",
          error instanceof Error ? error : new Error(String(error))
        );
      }

      if (error instanceof Error && error.name === "ZodError") {
        logger.logValidationError(
          resourceName || "unknown",
          (error as z.ZodError).errors
        );
        return { success: false, error: handleValidationError(error) };
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return { success: false, error: handlePrismaError(error) };
      }

      return { success: false, error: "An unexpected error occurred" };
    }
  };
}

// Commonly used Prisma select and include patterns
export const commonSelects = {
  user: {
    id: true,
    name: true,
    email: true,
  },
  userPublic: {
    id: true,
    name: true,
    email: true,
    avatar: true,
    bio: true,
    role: true,
    status: true,
    cohort: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    graduationDate: true,
    linkedinUrl: true,
    githubUrl: true,
    portfolioUrl: true,
    currentJob: true,
    currentCompany: true,
    createdAt: true,
  },
  userPrivate: {
    id: true,
    name: true,
    email: true,
    avatar: true,
    bio: true,
    role: true,
    status: true,
    cohort: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    graduationDate: true,
    linkedinUrl: true,
    githubUrl: true,
    portfolioUrl: true,
    currentJob: true,
    currentCompany: true,
    createdAt: true,
    updatedAt: true,
  },
  author: {
    id: true,
    name: true,
    email: true,
  },
  document: {
    id: true,
    title: true,
    content: true,
    createdAt: true,
    updatedAt: true,
    isPublished: true,
    isArchived: true,
    parentId: true,
    type: true,
  },
} as const;

// Type helpers for users
export type UserPublic = Prisma.UserGetPayload<{
  select: typeof commonSelects.userPublic;
}>;

export type UserPrivate = Prisma.UserGetPayload<{
  select: typeof commonSelects.userPrivate;
}>;

export type UserWithCounts = Prisma.UserGetPayload<{
  select: typeof commonSelects.userPublic;
  include: {
    _count: {
      select: {
        documents: true;
        enrollments: true;
        posts: true;
        comments: true;
        achievements: true;
        favorites: true;
      };
    };
  };
}> & {
  specialty?: string;
};

// Type helper for document with author
export type DocumentWithAuthor = Prisma.DocumentGetPayload<{
  include: {
    author: {
      select: typeof commonSelects.author;
    };
  };
}>;

// Type helper for document with full relations
export type DocumentWithRelations = Prisma.DocumentGetPayload<{
  include: {
    author: {
      select: typeof commonSelects.author;
    };
    children: true;
    parent: true;
    favorites: true;
    comments: true;
    suggestions: true;
  };
}>;

// Permission checking logic is implemented in lib/permissions.ts
export async function checkPermission(
  userId: string,
  resource: string,
  action: string,
  resourceId?: string
): Promise<boolean> {
  try {
    // Basic permission check - can be extended with role-based logic
    if (!userId) {
      logger.warn("Permission check failed: No user ID provided", {
        action: "permission_check",
        resource,
        metadata: { action, resourceId },
      });
      return false;
    }

    // Log permission check
    logger.debug("Checking permission", {
      action: "permission_check",
      resource,
      userId,
      metadata: { action, resourceId },
    });

    // Here you would implement your actual permission logic
    // For example, checking user roles, resource ownership, etc.

    // Example implementation:
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (!user) return false;

    // For now, return true for authenticated users
    // This should be replaced with your actual permission logic
    return true;
  } catch (error) {
    logger.error(
      "Permission check failed",
      error instanceof Error ? error : new Error(String(error)),
      {
        userId,
        resource,
        metadata: { action, resourceId },
      }
    );
    return false;
  }
}

// Helper function to create consistent return types
export function createReturnType<T>(
  success: boolean,
  data: T | null,
  message?: string
): ServerActionResult<T> {
  if (success) {
    return { success: true, data: data as T };
  } else {
    return { success: false, error: message || 'An error occurred' };
  }
}

// Standardized server action handler following CODAC patterns
export async function handleServerAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  input: unknown,
  handler: (context: { parsed: TInput; user: any }) => Promise<{ ok: boolean; data: TOutput }>
): Promise<ServerActionResult<TOutput>> {
  try {
    // Parse and validate input
    const parsed = schema.parse(input);

    // Get current user from auth
    const session = await auth();
    const user = session?.user;

    // Execute the handler with context
    const result = await handler({ parsed, user });

    if (!result.ok) {
      return { success: false, error: 'Operation failed' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    logger.error('Server action error', error instanceof Error ? error : new Error(String(error)), {
      metadata: { input }
    });

    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data', validationErrors: error.errors };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'An unexpected error occurred' };
  }
}
