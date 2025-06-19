"use client"

import { Book, Clock, TrendingUp, Trophy } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCard {
    title: string
    value: string
    change: string
    icon: React.ComponentType<{ className?: string }>
}

interface StatsCardsProps {
    userStats?: {
        documentsCount?: number
        achievementsCount?: number
        studyStreak?: number
        monthlyStudyTime?: number
    }
}

export function StatsCards({ userStats }: StatsCardsProps) {
    // Default stats data with personalized values if available
    const statsData: StatCard[] = [
        {
            title: "Current Streak",
            value: userStats?.studyStreak ? `${userStats.studyStreak} days` : "0 days",
            change: "Keep it up!",
            icon: TrendingUp
        },
        {
            title: "Documents Created",
            value: userStats?.documentsCount?.toString() || "0",
            change: "All time",
            icon: Book
        },
        {
            title: "Study Time",
            value: userStats?.monthlyStudyTime ? `${userStats.monthlyStudyTime}h` : "0h",
            change: "This month",
            icon: Clock
        },
        {
            title: "Achievements",
            value: userStats?.achievementsCount?.toString() || "0",
            change: "Unlocked",
            icon: Trophy
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat) => {
                const IconComponent = stat.icon
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
} 