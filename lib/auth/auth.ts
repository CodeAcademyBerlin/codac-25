import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole, UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/logger"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true,
  providers: [
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
            where: { email }
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
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            status: user.status,
            cohortId: user.cohortId,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
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
      // Add user data from token to session
      if (token) {
        session.user.id = token.sub as string
        session.user.role = (token.role || 'STUDENT') as UserRole
        session.user.status = (token.status || 'ACTIVE') as UserStatus
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
      }
      // For existing tokens, fetch from database if needed
      else if (token.sub && !token.role) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, status: true, cohortId: true },
          })

          if (dbUser) {
            token.role = dbUser.role
            token.status = dbUser.status
            token.cohortId = dbUser.cohortId
          } else {
            // Set defaults
            token.role = "STUDENT"
            token.status = "ACTIVE"
            token.cohortId = null
          }
        } catch (error) {
          logger.error("Error fetching user data in JWT callback", error instanceof Error ? error : new Error(String(error)))
          // Set defaults on error
          token.role = "STUDENT"
          token.status = "ACTIVE"
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
