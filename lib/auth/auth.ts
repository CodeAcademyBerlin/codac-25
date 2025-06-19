import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/db/prisma"


export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
    },
    session: {
        strategy: "database",
    },
    callbacks: {
        async signIn() {
            // Allow sign in
            return true
        },
        async session({ session, user }) {
            // Add user role and status to session
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { role: true, status: true, cohortId: true },
            })

            if (dbUser) {
                session.user.role = dbUser.role
                session.user.status = dbUser.status
                session.user.cohortId = dbUser.cohortId
            }

            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.status = user.status
            }
            return token
        },
    },
    events: {
        async createUser({ user }) {
            // Set default role and status for new users
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    role: "STUDENT",
                    status: "ACTIVE",
                },
            })
        },
    },
}) 