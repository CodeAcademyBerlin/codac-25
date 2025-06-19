# Server Actions Documentation

This guide explains how to properly create and use server actions with TypeScript, Prisma, validation, and logging in this codebase.

Following security gudelines article [security nextjs server components actions](https://nextjs.org/blog/security-nextjs-server-components-actions)

## 🏗️ Architecture Overview

Our server actions follow a consistent pattern with:

- **Type Safety**: Full TypeScript integration with Prisma-generated types
- **Validation**: Zod schemas for input validation
- **Error Handling**: Consistent error handling with proper types
- **Logging**: Comprehensive logging for debugging and monitoring
- **Reusability**: Utility functions for common patterns

## 📁 Structure

```
actions/
├── doc/
│   ├── create-doc.ts           # Document creation
│   ├── update-doc.ts           # Document updates
│   ├── delete-doc.ts           # Document deletion
│   └── create-doc-optimized.ts # Example using utility
├── user/
│   ├── create-user.ts          # User creation
│   ├── get-users.ts            # User listing with filters
│   ├── update-user.ts          # User updates
│   ├── delete-user.ts          # User deletion
│   └── create-user-optimized.ts # Example using utility
└── README.md                   # This file
```

## 🔧 Basic Usage

### 1. Create Validation Schema

First, define your validation schema in `lib/validation/`:

```typescript
// lib/validation/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["STUDENT", "ALUMNI", "INSTRUCTOR", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### 2. Manual Server Action (Detailed Control)

```typescript
// actions/user/create-user.ts
"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { createUserSchema, type CreateUserInput } from "@/lib/validation/user";

export async function createUser(data: CreateUserInput) {
  const startTime = Date.now();

  try {
    // Log action start
    logger.logServerAction("create", "user", {
      metadata: { email: data.email },
    });

    // Validate input
    const validatedData = createUserSchema.parse(data);

    // Business logic
    const user = await prisma.user.create({
      data: validatedData,
      select: commonSelects.userPrivate,
    });

    // Log success
    logger.info("User created successfully", {
      action: "create",
      resource: "user",
      resourceId: user.id,
      metadata: { duration: Date.now() - startTime },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error) {
    // Log error
    logger.logServerActionError("create", "user", error, {
      metadata: { duration: Date.now() - startTime },
    });

    // Handle different error types
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, error: (error as any).errors };
    }

    return { success: false, error: "Failed to create user" };
  }
}
```

### 3. Utility-Based Server Action (Recommended)

```typescript
// actions/user/create-user-optimized.ts
"use server";

import { createServerAction } from "@/lib/server-action-utils";
import { createUserSchema } from "@/lib/validation/user";

export const createUserOptimized = createServerAction(
  createUserSchema,
  async (data) => {
    // Just the business logic - validation, logging,
    // and error handling are handled automatically
    const user = await prisma.user.create({
      data,
      select: commonSelects.userPrivate,
    });

    revalidatePath("/users");
    return user;
  },
  "create", // action name for logging
  "user" // resource name for logging
);
```

## 📝 Logging System

### Log Levels

- **DEBUG**: Development-only detailed information
- **INFO**: General information about operations
- **WARN**: Warning conditions that don't stop execution
- **ERROR**: Error conditions that stop execution

### Specialized Logging Methods

```typescript
import { logger } from "@/lib/logger";

// Server action logging (automatic with utility)
logger.logServerAction("create", "user", { userId: "abc123" });
logger.logServerActionError("create", "user", error, { userId: "abc123" });

// Database operation logging
logger.logDatabaseOperation("create", "users", "user-id", {
  email: "user@example.com",
});

// Validation error logging
logger.logValidationError("user", zodErrors, { userId: "abc123" });

// Permission denied logging
logger.logPermissionDenied("delete", "user", "current-user-id", {
  targetUserId: "target-id",
});

// Authentication events
logger.logAuthEvent("login", "user-id", { method: "email" });
```

### Log Output

**Development**: Pretty-printed with context

```
[2024-01-15T10:30:45.123Z] INFO: Server action: create
  Context: {
    "action": "create",
    "resource": "user",
    "metadata": {
      "email": "user@example.com"
    }
  }
```

**Production**: Structured JSON for log aggregation

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "message": "Server action: create",
  "context": {
    "action": "create",
    "resource": "user",
    "metadata": {
      "email": "user@example.com"
    }
  }
}
```

## 🎯 Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good
const validatedData = schema.parse(data);

// ❌ Bad
const user = await prisma.user.create({ data }); // No validation
```

### 2. Use Proper Types

```typescript
// ✅ Good - Using Prisma-generated types
type CreateUserResult = ServerActionResult<Prisma.UserGetPayload<{
  select: typeof commonSelects.userPrivate;
}>>;

// ❌ Bad - Using any
const createUser = async (data: any): Promise<any> => { ... }
```

### 3. Handle Errors Appropriately

```typescript
// ✅ Good - Specific error handling
if (error instanceof Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case 'P2002':
      return { success: false, error: 'Email already exists' };
    case 'P2025':
      return { success: false, error: 'User not found' };
  }
}

// ❌ Bad - Generic error handling
catch (error) {
  return { success: false, error: 'Something went wrong' };
}
```

### 4. Use Common Selects

```typescript
// ✅ Good - Reusable selects
const user = await prisma.user.create({
  data: validatedData,
  select: commonSelects.userPrivate,
});

// ❌ Bad - Inline selects
const user = await prisma.user.create({
  data: validatedData,
  select: { id: true, name: true, email: true, ... }, // Repeated everywhere
});
```

### 5. Revalidate Paths

```typescript
// ✅ Good - Revalidate relevant paths
revalidatePath("/users");
revalidatePath(`/users/${user.id}`);

// ❌ Bad - No revalidation (stale data in UI)
return { success: true, data: user };
```

## 🛡️ Security Considerations

### 1. Authorization Checks

```typescript
// Check permissions before operations
const hasPermission = await checkDocumentPermission(
  documentId,
  currentUserId,
  "write"
);

if (!hasPermission) {
  logger.logPermissionDenied("update", "document", currentUserId, {
    resourceId: documentId,
  });
  return { success: false, error: "Unauthorized" };
}
```

### 2. Soft Deletes for Critical Data

```typescript
// Prefer soft deletes for users with related data
if (hasRelatedData) {
  await prisma.user.update({
    where: { id },
    data: { status: "INACTIVE" },
  });
  return { success: false, error: "User deactivated due to related data" };
}
```

### 3. Validate Sensitive Operations

```typescript
// Prevent accidental admin deletion
if (existingUser.role === "ADMIN") {
  return {
    success: false,
    error: "Cannot delete admin users. Change role first.",
  };
}
```

## 🔄 Migration Guide

If you have existing server actions, here's how to migrate them:

### 1. Add Validation Schema

```typescript
// Before
export async function createUser(data: any) {
  const user = await prisma.user.create({ data });
  return user;
}

// After
export async function createUser(data: CreateUserInput) {
  const validatedData = createUserSchema.parse(data);
  const user = await prisma.user.create({
    data: validatedData,
    select: commonSelects.userPrivate,
  });
  return { success: true, data: user };
}
```

### 2. Add Error Handling

```typescript
// Before
export async function createUser(data: CreateUserInput) {
  const user = await prisma.user.create({ data });
  return user;
}

// After
export async function createUser(data: CreateUserInput) {
  try {
    const validatedData = createUserSchema.parse(data);
    const user = await prisma.user.create({ data: validatedData });
    return { success: true, data: user };
  } catch (error) {
    logger.error("Failed to create user", error);
    return { success: false, error: "Failed to create user" };
  }
}
```

### 3. Add Logging

```typescript
// Before
export async function createUser(data: CreateUserInput) {
  try {
    const user = await prisma.user.create({ data });
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to create user" };
  }
}

// After - Full logging
export async function createUser(data: CreateUserInput) {
  const startTime = Date.now();
  try {
    logger.logServerAction("create", "user");
    const user = await prisma.user.create({ data });
    logger.info("User created", {
      resourceId: user.id,
      duration: Date.now() - startTime,
    });
    return { success: true, data: user };
  } catch (error) {
    logger.logServerActionError("create", "user", error);
    return { success: false, error: "Failed to create user" };
  }
}
```

## 📚 Examples

Check out the existing actions for complete examples:

- **Basic Document Actions**: `actions/doc/create-doc.ts`
- **Advanced User Actions**: `actions/user/create-user.ts`
- **Optimized Actions**: `actions/user/create-user-optimized.ts`
- **Complex Queries**: `actions/user/get-users.ts`

## 🐛 Debugging

### Check Logs

1. **Development**: Logs appear in your terminal
2. **Production**: Use log aggregation tools (DataDog, LogRocket, etc.)

### Common Issues

1. **Validation Errors**: Check the validation schema matches your input
2. **Permission Errors**: Ensure proper authorization checks
3. **Database Errors**: Check Prisma error codes in logs

### Testing Server Actions

```typescript
// Test file example
import { createUser } from "@/actions/user/create-user";

describe("createUser", () => {
  it("should create a user successfully", async () => {
    const result = await createUser({
      email: "test@example.com",
      name: "Test User",
      role: "STUDENT",
      status: "ACTIVE",
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe("test@example.com");
  });

  it("should handle validation errors", async () => {
    const result = await createUser({
      email: "invalid-email",
      // missing required fields
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```
