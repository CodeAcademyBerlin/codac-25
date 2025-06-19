import type { DefaultSession, DefaultUser } from "next-auth"
import type { UserRole, UserStatus } from "@prisma/client"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: UserRole
            status: UserStatus
            cohortId?: string | null
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        role: UserRole
        status: UserStatus
        cohortId?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole
        status: UserStatus
        cohortId?: string | null
    }
} 