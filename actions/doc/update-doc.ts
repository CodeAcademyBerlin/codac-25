'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { UpdateDocSchema } from '@/schemas/doc';

type UpdateDocInput = z.infer<typeof UpdateDocSchema>;

export async function updateDoc(data: UpdateDocInput) {
    try {
        const { id, ...validatedData } = UpdateDocSchema.parse(data);

        // ⚠️  TODO: Add authorization check to ensure user can update this document
        const doc = await (prisma as any).document.update({
            where: { id },
            data: {
                ...validatedData,
            },
        });

        // Revalidate paths to reflect the update
        revalidatePath('/');
        if (doc.parentId) {
            revalidatePath(`/docs/${doc.parentId}`);
        }
        revalidatePath(`/docs/${doc.id}`);

        return { success: true, data: doc };
    } catch (error) {
        console.error('Error updating document:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors };
        }
        return { success: false, error: 'Failed to update document' };
    }
}
