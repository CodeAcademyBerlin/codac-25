import { Calendar, Target, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Event {
    title: string
    time: string
    icon: React.ComponentType<{ className?: string }>
    iconColor: string
}

const eventsData: Event[] = [
    {
        title: "React Workshop",
        time: "Today at 2:00 PM",
        icon: Calendar,
        iconColor: "bg-blue-100 text-blue-600"
    },
    {
        title: "Study Group",
        time: "Tomorrow at 10:00 AM",
        icon: Users,
        iconColor: "bg-green-100 text-green-600"
    },
    {
        title: "Project Deadline",
        time: "Friday at 11:59 PM",
        icon: Target,
        iconColor: "bg-purple-100 text-purple-600"
    }
]

export function UpcomingEvents() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                    Your schedule for the next few days
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {eventsData.map((event) => {
                    const IconComponent = event.icon
                    return (
                        <div key={event.title} className="flex items-center space-x-4">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${event.iconColor}`}>
                                <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {event.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {event.time}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
} 