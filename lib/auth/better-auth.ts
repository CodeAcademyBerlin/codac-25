import bcrypt from 'bcryptjs'

import { auth as nextAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// Lazy native Better Auth initialization. We dynamically import the library so
// builds don’t fail if the package or environment isn’t fully configured yet.
let nativeAuth: any | null = null

async function getNativeAuth() {
  if (nativeAuth) return nativeAuth
  try {
    // Dynamically import to avoid build-time hard dependency
    const betterAuthPath = ['better-auth'].join('/')
    const mod: any = await import(/* @vite-ignore */ betterAuthPath)

    if (mod && typeof mod.createAuth === 'function') {
      // Try to dynamically import providers; any failures will simply skip that provider
      const providers: any[] = []

      // Credentials provider (always useful locally)
      try {
        const credsPath = ['better-auth', 'providers', 'credentials'].join('/')
        const credsMod: any = await import(/* @vite-ignore */ credsPath)
        if (credsMod?.credentials) {
          providers.push(
            credsMod.credentials({
              async authorize({ email, password }: { email?: string; password?: string }) {
                if (!email || !password) return null
                const user = await prisma.user.findUnique({
                  where: { email },
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    password: true,
                    role: true,
                    status: true,
                    cohortId: true,
                    avatar: true,
                    emailVerified: true,
                  },
                })
                if (!user?.password) return null
                const isValid = await bcrypt.compare(password, user.password)
                if (!isValid) return null
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  username: user.username,
                  role: user.role,
                  status: user.status,
                  cohortId: user.cohortId,
                  avatar: user.avatar,
                  emailVerified: user.emailVerified,
                }
              },
            })
          )
        }
      } catch { }

      // Google OAuth
      try {
        const googlePath = ['better-auth', 'providers', 'google'].join('/')
        const googleMod: any = await import(/* @vite-ignore */ googlePath)
        const clientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
        const clientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET
        if (googleMod?.google && clientId && clientSecret) {
          providers.push(
            googleMod.google({
              clientId,
              clientSecret,
            })
          )
        }
      } catch { }

      // GitHub OAuth
      try {
        const githubPath = ['better-auth', 'providers', 'github'].join('/')
        const githubMod: any = await import(/* @vite-ignore */ githubPath)
        const clientId = process.env.AUTH_GITHUB_ID
        const clientSecret = process.env.AUTH_GITHUB_SECRET
        if (githubMod?.github && clientId && clientSecret) {
          providers.push(
            githubMod.github({
              clientId,
              clientSecret,
              allowDangerousEmailAccountLinking: true,
              scopes: ['read:user', 'user:email', 'repo'],
            })
          )
        }
      } catch { }

      // Resend (email/magic link)
      try {
        const resendPath = ['better-auth', 'providers', 'resend'].join('/')
        const resendMod: any = await import(/* @vite-ignore */ resendPath)
        const resendKey = process.env.AUTH_RESEND_KEY
        const from = process.env.EMAIL_FROM || 'onboarding@resend.dev'
        if (resendMod?.resend && resendKey) {
          providers.push(
            resendMod.resend({
              apiKey: resendKey,
              from,
            })
          )
        }
      } catch { }

      nativeAuth = mod.createAuth({
        secret: process.env.AUTH_SECRET,
        providers,
      })

      return nativeAuth
    }
  } catch {
    // Swallow errors and use proxy below
  }
  return null
}

export const auth = {
  handler: async (request: Request) => {
    const ba = await getNativeAuth()
    if (ba?.handler) {
      return ba.handler(request)
    }
    // Ensure JSON response for session endpoint so clients don’t fail parsing
    try {
      const url = new URL(request.url)
      if (url.pathname.endsWith('/api/auth/session') || url.pathname.endsWith('/session')) {
        return new Response('null', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch { }
    return new Response(
      JSON.stringify({ error: 'Better Auth not initialized' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  },
  api: {
    getSession: async (args?: any) => {
      const ba = await getNativeAuth()
      if (ba?.api?.getSession) {
        try {
          return await ba.api.getSession(args)
        } catch { }
      }
      return nextAuth()
    },
  },
} as const

export type BetterAuth = typeof auth

