import type { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

export async function getCurrentUser() {
    const session = await auth()
    return session?.user
}

export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/auth/signin")
    }
    return user
}

export async function requireRole(role: UserRole) {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/auth/signin")
    }
    if (user.role !== role) {
        redirect("/")
    }
    return user
}

export async function requireAdmin() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/auth/signin")
    }
    if (user.role !== "ADMIN") {
        redirect("/")
    }
    return user
}

/**
 * Fetch user avatar separately since we exclude it from JWT to prevent large cookies
 */
export async function getUserAvatar(userId: string): Promise<string | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true },
        })
        return user?.avatar || null
    } catch (error) {
        console.error("Error fetching user avatar:", error)
        return null
    }
}

/**
 * Fetch full user profile including avatar
 */
export async function getUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                role: true,
                status: true,
                cohortId: true,
                githubUrl: true,
                linkedinUrl: true,
                portfolioUrl: true,
                currentJob: true,
                currentCompany: true,
                graduationDate: true,
                createdAt: true,
                updatedAt: true,
            },
        })
        return user
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return null
    }
}

export async function requireInstructor() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/auth/signin")
    }
    if (user.role !== "ADMIN" && user.role !== "ALUMNI") {
        redirect("/")
    }
    return user
}

export async function requireActiveUser() {
    const user = await requireAuth()
    if (user.status !== "ACTIVE") {
        redirect("/account-inactive")
    }
    return user
} 