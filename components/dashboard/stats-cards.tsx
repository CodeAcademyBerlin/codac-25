import { Book, Clock, TrendingUp, Trophy } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCard {
    title: string
    value: string
    change: string
    icon: React.ComponentType<{ className?: string }>
}

const statsData: StatCard[] = [
    {
        title: "Current Streak",
        value: "12 days",
        change: "+2 from last week",
        icon: TrendingUp
    },
    {
        title: "Completed Lessons",
        value: "87",
        change: "+5 this week",
        icon: Book
    },
    {
        title: "Study Time",
        value: "42h",
        change: "This month",
        icon: Clock
    },
    {
        title: "Achievements",
        value: "23",
        change: "+3 this week",
        icon: Trophy
    }
]

export function StatsCards() {
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