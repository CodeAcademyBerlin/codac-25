import { MessageSquare } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


interface Activity {
    id: string
    avatar: string
    name: string
    action: string
    time: string
    badge?: {
        text: string
        variant: "default" | "secondary" | "destructive" | "outline"
    }
}

const activityData: Activity[] = [


]

export function RecentActivity() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest updates from your cohort and mentors
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activityData.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={activity.avatar} alt={activity.name} />
                                <AvatarFallback>
                                    {activity.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 flex-1">
                                <p className="text-sm font-medium leading-none">
                                    {activity.name} {activity.action.split(' - ')[0]}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.action.includes(' - ') ? activity.action.split(' - ')[1] : ''} - {activity.time}
                                </p>
                            </div>
                            {activity.badge && (
                                <Badge variant={activity.badge.variant}>
                                    {activity.badge.text === "New" && <MessageSquare className="h-3 w-3 mr-1" />}
                                    {activity.badge.text}
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 