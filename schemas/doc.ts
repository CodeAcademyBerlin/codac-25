import { z } from 'zod';

export const DocSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    content: z.any().optional(),
    parentId: z.string().optional(),
    isPublished: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    coverImage: z.string().url().optional(),
    icon: z.string().optional(),
});

export const UpdateDocSchema = DocSchema.partial().extend({
    id: z.string().cuid(),
});

export const CreateDocSchema = DocSchema.pick({
    title: true,
    parentId: true,
}); 