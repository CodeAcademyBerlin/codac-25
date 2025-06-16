'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { createDocSchema, type CreateDocInput } from '@/lib/validation/doc';
import {
    createServerAction,
    type DocumentWithAuthor,
    commonSelects
} from '@/lib/server-action-utils';

// Using the utility function for cleaner server actions
export const createDocOptimized = createServerAction(
    createDocSchema,
    async (data: CreateDocInput): Promise<DocumentWithAuthor> => {
        // TODO: Replace with actual user ID from auth context
        const TEMP_USER_ID = 'demo-user';

        // Ensure demo user exists (temporary solution)
        await prisma.user.upsert({
            where: { id: TEMP_USER_ID },
            update: {},
            create: {
                id: TEMP_USER_ID,
                email: 'demo@example.com',
                name: 'Demo User',
                role: 'STUDENT',
                status: 'ACTIVE',
            },
        });

        // Create document with proper types
        const document = await prisma.document.create({
            data: {
                title: data.title,
                content: data.content || [{ type: 'p', children: [{ text: '' }] }],
                parentId: data.parentId,
                type: data.type || 'GENERAL',
                authorId: TEMP_USER_ID,
                isPublished: false,
                isArchived: false,
            },
            include: {
                author: {
                    select: commonSelects.author,
                },
            },
        });

        // Revalidate relevant paths
        revalidatePath('/docs');
        if (document.parentId) {
            revalidatePath(`/docs/${document.parentId}`);
        }

        return document;
    }
);

// Example usage in a component:
/*
const result = await createDocOptimized({
  title: 'My New Document',
  content: null,
  parentId: undefined,
  type: 'GENERAL'
});

if (result.success) {
  console.log('Document created:', result.data);
} else {
  console.error('Error:', result.error);
}
*/ 