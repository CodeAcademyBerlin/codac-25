import { BookOpen, Clock, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentActivity } from '@/data/dashboard'

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
}

function getActivityIcon(type: string) {
    switch (type) {
        case 'course_enrollment':
            return BookOpen
        case 'lesson_completed':
            return Trophy
        case 'course_completed':
            return Trophy
        default:
            return Clock
    }
}

function getActivityColor(type: string): string {
    switch (type) {
        case 'course_enrollment':
            return 'bg-blue-100 text-blue-600'
        case 'lesson_completed':
            return 'bg-green-100 text-green-600'
        case 'course_completed':
            return 'bg-purple-100 text-purple-600'
        default:
            return 'bg-gray-100 text-gray-600'
    }
}

export async function RecentActivity() {
    const activityData = await getRecentActivity()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Your latest learning progress and milestones
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activityData.length > 0 ? (
                        activityData.map((activity) => {
                            const IconComponent = getActivityIcon(activity.type)
                            const iconColor = getActivityColor(activity.type)

                            return (
                                <div key={activity.id} className="flex items-center space-x-4">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColor}`}>
                                        <IconComponent className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.description} • {formatTimeAgo(activity.timestamp)}
                                        </p>
                                    </div>
                                    {activity.progress !== undefined && activity.progress > 0 && (
                                        <Badge variant="secondary">
                                            {Math.round(activity.progress)}%
                                        </Badge>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-8">
                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-2">No recent activity</p>
                            <p className="text-sm text-muted-foreground">
                                Start a course to see your learning progress here
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 