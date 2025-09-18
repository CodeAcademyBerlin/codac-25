'use server'

import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'

export async function getAvailableUsers() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error('Authentication required')
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
            },
            orderBy: {
                name: 'asc',
            },
            take: 50, // Increased limit to show more users
        })

        return users
    } catch (error) {
        console.error('Error fetching users:', error)
        throw new Error('Failed to fetch users')
    }
}
