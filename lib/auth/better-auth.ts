// Better Auth scaffolding (not yet wired). This file will host the Better Auth
// configuration and session helpers. Until migration flips, it exports no-ops
// to avoid affecting the current NextAuth setup.

export type BetterAuthSession = {
    user?: {
        id: string
        email: string | null
        name: string | null
        username?: string
        role?: string
        status?: string
        avatar?: string | null
        emailVerified?: Date | null
    }
} | null

export async function getBetterAuthSession(): Promise<BetterAuthSession> {
    return null
}

export async function betterAuthSignIn(): Promise<void> {
    return
}

export async function betterAuthSignOut(): Promise<void> {
    return
}

