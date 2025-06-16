import { z } from 'zod';

// Import the shared type
export type { ServerActionResult } from '@/lib/server-action-utils';

// Base document validation schema
export const docSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    content: z.any().optional(),
    parentId: z.string().cuid().optional(),
    isPublished: z.boolean().default(false),
    isArchived: z.boolean().default(false),
    coverImage: z.string().url().optional(),
    icon: z.string().optional(),
    type: z.enum(['GENERAL', 'COURSE_MATERIAL', 'ASSIGNMENT', 'RESOURCE']).default('GENERAL'),
});

// Create document schema - only required fields for creation
export const createDocSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    content: z.any().optional(),
    parentId: z.string().cuid().optional().or(z.literal('').transform(() => undefined)),
    type: z.enum(['GENERAL', 'COURSE_MATERIAL', 'ASSIGNMENT', 'RESOURCE']),
});

// Update document schema - all fields optional except id
export const updateDocSchema = docSchema.partial().extend({
    id: z.string().cuid('Invalid document ID'),
});

// Delete document schema
export const deleteDocSchema = z.object({
    id: z.string().cuid('Invalid document ID'),
});

// Bulk operations schemas
export const bulkDeleteDocSchema = z.object({
    ids: z.array(z.string().cuid()).min(1, 'At least one document ID is required'),
});

export const moveDocSchema = z.object({
    id: z.string().cuid('Invalid document ID'),
    newParentId: z.string().cuid().optional(),
});

// Inferred types for type safety
export type CreateDocInput = z.infer<typeof createDocSchema>;
export type UpdateDocInput = z.infer<typeof updateDocSchema>;
export type DeleteDocInput = z.infer<typeof deleteDocSchema>;
export type BulkDeleteDocInput = z.infer<typeof bulkDeleteDocSchema>;
export type MoveDocInput = z.infer<typeof moveDocSchema>;


