import { headers } from 'next/headers'
import { auth as nextAuth } from '@/lib/auth/auth'
import { auth as betterAuth } from '@/lib/auth/better-auth'

// Centralized session retrieval; prefers Better Auth
export async function getSession() {
  try {
    const session = await betterAuth.api.getSession({ headers: headers() })
    if (session) return session as any
  } catch {}
  // Fallback to NextAuth during migration
  return nextAuth()
}

export type SessionUser = Awaited<ReturnType<typeof getSession>> extends { user: infer U }
  ? U
  : null

