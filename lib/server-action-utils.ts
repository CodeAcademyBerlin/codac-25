import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Generic server action result type
export type ServerActionResult<T = unknown> =
    | { success: true; data: T }
    | { success: false; error: string | z.ZodError['errors'] };

// Common Prisma error handling
export function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
        case 'P2002':
            return 'A record with this information already exists';
        case 'P2003':
            return 'Invalid reference to related record';
        case 'P2025':
            return 'Record not found';
        case 'P2014':
            return 'Invalid data provided';
        case 'P2001':
            return 'Required record not found';
        default:
            logger.error('Unhandled Prisma error', error);
            return 'Database error occurred';
    }
}

// Common validation error handling
export function handleValidationError(error: unknown): string | z.ZodError['errors'] {
    if (error instanceof Error && error.name === 'ZodError') {
        return (error as any).errors;
    }
    return 'Validation failed';
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
                    metadata: { inputKeys: Object.keys(input as any) }
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
                        success: true
                    }
                });
            }

            return { success: true, data: result };
        } catch (error) {
            // Log the error
            if (actionName && resourceName && error instanceof Error) {
                logger.logServerActionError(actionName, resourceName, error, {
                    metadata: {
                        duration: Date.now() - startTime,
                        inputKeys: Object.keys(input as any)
                    }
                });
            } else {
                logger.error('Server action error', error instanceof Error ? error : new Error(String(error)));
            }

            if (error instanceof Error && error.name === 'ZodError') {
                logger.logValidationError(resourceName || 'unknown', (error as any).errors);
                return { success: false, error: handleValidationError(error) };
            }

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return { success: false, error: handlePrismaError(error) };
            }

            return { success: false, error: 'An unexpected error occurred' };
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
        cohort: true,
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
        cohort: true,
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
            };
        };
    };
}>;

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

// Utility for checking permissions (placeholder for auth integration)
export async function checkDocumentPermission(
    documentId: string,
    userId: string,
    permission: 'read' | 'write' | 'delete' = 'read'
): Promise<boolean> {
    // TODO: Implement actual permission checking logic
    // This is a placeholder that should be replaced with your auth logic

    try {
        const document = await (await import('@/lib/db')).prisma.document.findUnique({
            where: { id: documentId },
            select: {
                authorId: true,
                isArchived: true,
                collaborators: {
                    where: { userId },
                    select: { permission: true },
                },
            },
        });

        if (!document || document.isArchived) {
            return false;
        }

        // Owner has all permissions
        if (document.authorId === userId) {
            return true;
        }

        // Check collaborator permissions
        const collaborator = document.collaborators[0];
        if (collaborator) {
            switch (permission) {
                case 'read':
                    return ['READ', 'WRITE', 'ADMIN'].includes(collaborator.permission);
                case 'write':
                    return ['WRITE', 'ADMIN'].includes(collaborator.permission);
                case 'delete':
                    return collaborator.permission === 'ADMIN';
                default:
                    return false;
            }
        }

        return false;
    } catch (error) {
        console.error('Error checking document permission:', error);
        return false;
    }
} 