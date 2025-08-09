import { BookCheck, BookOpen, Clock, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserStats } from "@/data/dashboard"

interface StatCard {
    title: string
    value: string
    change: string
    icon: React.ComponentType<{ className?: string }>
}

interface StatsCardsProps {
    userStats?: UserStats
}

export function StatsCards({ userStats }: StatsCardsProps) {
    // Learning-focused stats data with real values
    const statsData: StatCard[] = [
        {
            title: "Courses Enrolled",
            value: userStats?.totalEnrollments?.toString() || "0",
            change: userStats?.coursesInProgress ? `${userStats.coursesInProgress} in progress` : "Start learning",
            icon: BookOpen
        },
        {
            title: "Courses Completed",
            value: userStats?.coursesCompleted?.toString() || "0",
            change: userStats?.totalEnrollments ? `${Math.round((userStats.coursesCompleted / userStats.totalEnrollments) * 100) || 0}% completion rate` : "No completions yet",
            icon: BookCheck
        },
        {
            title: "Study Time",
            value: userStats?.monthlyStudyTime ? `${userStats.monthlyStudyTime}h` : "0h",
            change: "This month",
            icon: Clock
        },
        {
            title: "Average Progress",
            value: userStats?.averageProgress ? `${userStats.averageProgress}%` : "0%",
            change: userStats?.studyStreak ? `${userStats.studyStreak} day streak` : "Start studying",
            icon: TrendingUp
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