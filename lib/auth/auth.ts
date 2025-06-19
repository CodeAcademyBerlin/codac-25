import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"

import { prisma } from "@/lib/db/prisma"


export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
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
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const email = credentials.email as string
                const password = credentials.password as string

                try {
                    // Find user by email
                    const user = await prisma.user.findUnique({
                        where: {
                            email: email.toLowerCase()
                        }
                    })

                    if (!user || !user.password) {
                        return null
                    }

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(
                        password,
                        user.password
                    )

                    if (!isPasswordValid) {
                        return null
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
                    }
                } catch (error) {
                    console.error("Error during authentication:", error)
                    return null
                }
            }
        }),
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
                session.user.role = token.role as any
                session.user.status = token.status as any
                session.user.cohortId = token.cohortId as string | null
            }

            return session
        },
        async jwt({ token, user, account, trigger }) {
            console.log("JWT callback triggered:", {
                provider: account?.provider,
                hasUser: !!user,
                trigger,
                tokenSub: token.sub
            })

            // For credentials provider, user data is already complete
            if (user && account?.provider === "credentials") {
                console.log("Setting token data from credentials user")
                token.role = user.role
                token.status = user.status
                token.cohortId = user.cohortId
            }
            // For all other cases, always fetch from database
            else if (token.sub) {
                console.log("Fetching user data from database for provider:", account?.provider || "unknown")
                try {
                    // Add a small delay for OAuth providers to ensure user is created
                    if (account?.provider !== "credentials" && user) {
                        await new Promise(resolve => setTimeout(resolve, 100))
                    }

                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.sub },
                        select: { role: true, status: true, cohortId: true },
                    })

                    console.log("Database user found:", !!dbUser, dbUser)

                    if (dbUser) {
                        token.role = dbUser.role
                        token.status = dbUser.status
                        token.cohortId = dbUser.cohortId
                    } else {
                        console.log("No database user found, setting defaults")
                        token.role = "STUDENT"
                        token.status = "ACTIVE"
                        token.cohortId = null
                    }
                } catch (error) {
                    console.error("Error fetching user data in JWT callback:", error)
                    // Set defaults on error
                    token.role = "STUDENT"
                    token.status = "ACTIVE"
                    token.cohortId = null
                }
            }

            console.log("JWT callback result:", { role: token.role, status: token.status, cohortId: token.cohortId })
            return token
        },
    },
    events: {
        async createUser({ user }) {
            console.log("createUser event triggered for user:", user.id, user.email)
            try {
                // Set default role and status for new users
                const updatedUser = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        role: "STUDENT",
                        status: "ACTIVE",
                    },
                })
                console.log("User updated successfully:", updatedUser.id, updatedUser.role, updatedUser.status)
            } catch (error) {
                console.error("Error updating user in createUser event:", error)
            }
        },
    },
}) 