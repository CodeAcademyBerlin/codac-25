import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/logger"


export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        // Find user in database
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                status: true,
                cohortId: true,
                emailVerified: true,
            }
        })

        if (!user || !user.password) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        // Return user object (without password)
        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            cohortId: user.cohortId,
            emailVerified: user.emailVerified,
        }

        return NextResponse.json({ user: userResponse })
    } catch (error) {
        logger.error("Error during credentials authentication", error instanceof Error ? error : new Error(String(error)))
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
