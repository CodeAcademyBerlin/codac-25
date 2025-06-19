import type { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/auth"

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

export async function requireRole(allowedRoles: UserRole[]) {
    const user = await requireAuth()
    if (!allowedRoles.includes(user.role)) {
        redirect("/unauthorized")
    }
    return user
}

export async function requireAdmin() {
    return requireRole(["ADMIN"])
}

export async function requireInstructor() {
    return requireRole(["ADMIN", "ALUMNI"])
}

export async function requireActiveUser() {
    const user = await requireAuth()
    if (user.status !== "ACTIVE") {
        redirect("/account-inactive")
    }
    return user
} 