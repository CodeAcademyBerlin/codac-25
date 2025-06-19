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
                        documents: true,
                        achievements: true,
                        favorites: true,
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

        // Calculate study streak (mock for now - in real app you'd track daily activity)
        const daysSinceJoined = Math.floor(
            (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Mock study time calculation (in real app, you'd track actual study sessions)
        const monthlyStudyTime = Math.min(daysSinceJoined * 2, 50)

        const stats = {
            documentsCount: user._count.documents,
            achievementsCount: user._count.achievements,
            studyStreak: Math.min(daysSinceJoined, 30), // Cap at 30 days for demo
            monthlyStudyTime,
            favoritesCount: user._count.favorites,
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