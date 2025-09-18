import type { UserRole } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getToken } from "next-auth/jwt";

import { prisma } from "@/lib/db/prisma";

/**
 * Server-side auth utility for pages that need database access
 * This should be used in Server Components, not in middleware
 */
export async function getServerAuth() {
    const headersList = await headers();
    const token = await getToken({
        req: {
            headers: headersList,
        } as any,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    });

    if (!token) {
        return null;
    }

    // Fetch fresh user data from database
    try {
        const user = await prisma.user.findUnique({
            where: { id: token.sub! },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                cohortId: true,
                emailVerified: true,
            }
        });

        return user;
    } catch (error) {
        console.error("Error fetching user in getServerAuth:", error);
        return null;
    }
}

/**
 * Require authentication and return user data
 */
export async function requireServerAuth() {
    const user = await getServerAuth();
    if (!user) {
        redirect("/auth/signin");
    }
    return user;
}

/**
 * Require specific role
 */
export async function requireServerRole(role: UserRole) {
    const user = await requireServerAuth();
    if (user.role !== role) {
        redirect("/");
    }
    return user;
}

/**
 * Require one of multiple roles
 */
export async function requireServerAnyRole(roles: UserRole[]) {
    const user = await requireServerAuth();
    if (!roles.includes(user.role)) {
        redirect("/");
    }
    return user;
}

/**
 * Require admin role
 */
export async function requireServerAdmin() {
    return requireServerRole("ADMIN");
}

/**
 * Require active user status
 */
export async function requireServerActiveUser() {
    const user = await requireServerAuth();
    if (user.status !== "ACTIVE") {
        redirect("/account-inactive");
    }
    return user;
}
