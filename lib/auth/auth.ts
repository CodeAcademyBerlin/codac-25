import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole, UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"

import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/logger"

// Module augmentations are handled in types/next-auth.d.ts

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google,
    // Use Resend instead of Nodemailer for Edge Runtime compatibility
    Resend({
      from: process.env.EMAIL_FROM || "auth@example.com",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email"
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password"
        }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const email = credentials.email as string
          const password = credentials.password as string

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              // Exclude image to prevent large JWT cookies
              password: true,
              role: true,
              status: true,
              cohortId: true,
              emailVerified: true,
            }
          })

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // Return user object with all required fields
          // Note: Exclude image/avatar to prevent large JWT cookies
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            cohortId: user.cohortId,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          logger.error("Error during authentication", error instanceof Error ? error : new Error(String(error)));
          return null;
        }
      }
    }
    )
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn() {
      // Allow sign in
      return true
    },
    async session({ session, token }) {
      // Add user data from token to session with proper typing
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as UserRole
        session.user.status = token.status as UserStatus
        session.user.cohortId = token.cohortId as string | null
      }

      return session
    },
    async jwt({ token, user }) {
      // For credentials provider, user data is already complete
      if (user) {
        token.role = user.role
        token.status = user.status
        token.cohortId = user.cohortId
        // Explicitly exclude avatar from JWT to prevent large cookies
        // Avatar will be fetched from database when needed
      }
      // For existing tokens, fetch from database if needed
      else if (token.sub && !token.role) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, status: true, cohortId: true },
          })

          if (dbUser) {
            token.role = dbUser.role as UserRole
            token.status = dbUser.status as UserStatus
            token.cohortId = dbUser.cohortId
          } else {
            // Set defaults
            token.role = "STUDENT" as UserRole
            token.status = "ACTIVE" as UserStatus
            token.cohortId = null
          }
        } catch (error) {
          logger.error("Error fetching user data in JWT callback", error instanceof Error ? error : new Error(String(error)))
          // Set defaults on error
          token.role = "STUDENT" as UserRole
          token.status = "ACTIVE" as UserStatus
          token.cohortId = null
        }
      }

      return token
    },
  },
  events: {
    async createUser({ user }) {
      try {
        // Set default role and status for new users
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "STUDENT",
            status: "ACTIVE",
          },
        })
      } catch (error) {
        logger.error("Error updating user in createUser event", error instanceof Error ? error : new Error(String(error)))
      }
    },
  },
});
