import { UserRole, UserStatus } from "@prisma/client"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"

// Lightweight auth configuration for Edge Runtime
// This version excludes Prisma adapter and database operations
export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Google,
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
            async authorize(_credentials) {
                // This will be handled by API routes instead of middleware
                // Return null to force API route handling
                return null;
            }
        })
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
            return true
        },
        async session({ session, token }) {
            // Add user data from token to session
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
            }
            // For existing tokens, we'll fetch from database in API routes
            // This prevents database operations in Edge Runtime
            return token
        },
    },
});
