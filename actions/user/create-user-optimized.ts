'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { createUserSchema, type CreateUserInput } from '@/lib/validation/user';
import {
    createServerAction,
    type UserPrivate,
    commonSelects
} from '@/lib/server-action-utils';

// Using the utility function for cleaner server actions with built-in logging
export const createUserOptimized = createServerAction(
    createUserSchema,
    async (data: CreateUserInput): Promise<UserPrivate> => {
        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
            select: { id: true, email: true },
        });

        if (existingUser) {
            throw new Error('A user with this email already exists');
        }

        // Create user with proper types
        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
                status: data.status,
            },
            select: commonSelects.userPrivate,
        });

        // Revalidate relevant paths
        revalidatePath('/admin/users');
        revalidatePath('/users');

        return user;
    },
    'create', // action name for logging
    'user'    // resource name for logging
);

// Example usage in a component or API route:
/*
const result = await createUserOptimized({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'STUDENT',
  status: 'ACTIVE'
});

if (result.success) {
  console.log('User created:', result.data);
} else {
  console.error('Error:', result.error);
}
*/ 