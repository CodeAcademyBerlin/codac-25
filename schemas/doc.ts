import { z } from 'zod';

export const DocSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    parentId: z.string().optional(),
    content: z.any().optional(),
    isDeleted: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export const UpdateDocSchema = DocSchema.partial().extend({
    id: z.string().cuid(),
});

export const CreateDocSchema = DocSchema.pick({
    title: true,
    parentId: true,
    content: true,

}); 