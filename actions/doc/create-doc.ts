'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { CreateDocSchema } from '@/schemas/doc';

type CreateDocInput = z.infer<typeof CreateDocSchema>;

export async function createDoc(data: CreateDocInput) {
    try {
        const validatedData = CreateDocSchema.parse(data);

        // ⚠️  TODO: Provide full document data (content, author) once auth flow is connected.
        const doc = await (prisma as any).document.create({
            data: {
                title: validatedData.title,
                parentId: validatedData.parentId,
            },
        });
        // Ensure any server components that rely on the list of documents are revalidated
        revalidatePath('/');
        return { success: true, data: doc };
    } catch (error) {
        console.error('Error creating document:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors };
        }
        return { success: false, error: 'Failed to create document' };
    }
}