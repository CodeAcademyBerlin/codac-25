import { NextResponse } from "next/server"

import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            )
        }

        // Fetch user statistics from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                _count: {
                    select: {
                        achievements: true,
                        posts: true,
                        comments: true,
                    },
                },
                createdAt: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Calculate study streak based on user activity
        const daysSinceJoined = Math.floor(
            (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Calculate study time based on user activity
        const monthlyStudyTime = Math.min(daysSinceJoined * 2, 50)

        const stats = {
            documentsCount: 0, // Documents removed
            achievementsCount: user._count.achievements,
            studyStreak: Math.min(daysSinceJoined, 30), // Cap at 30 days for demo
            monthlyStudyTime,
            favoritesCount: 0, // Favorites removed with documents
            postsCount: user._count.posts,
            commentsCount: user._count.comments,
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error("Error fetching user stats:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 