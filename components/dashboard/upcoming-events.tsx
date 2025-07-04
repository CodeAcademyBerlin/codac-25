import { Calendar, GraduationCap, Target, Trophy } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth/auth-utils"

interface Event {
    title: string
    time: string
    icon: React.ComponentType<{ className?: string }>
    iconColor: string
}

export async function UpcomingEvents() {
    const user = await getCurrentUser()

    // For Black Owls students (graduating July 4, 2025), show graduation-related events
    const isBlackOwlsStudent = user?.email?.includes('@codac.academy')
    const isGraduationDay = new Date().toDateString() === new Date('2025-07-04').toDateString()

    let eventsData: Event[] = []

    if (isBlackOwlsStudent) {
        if (isGraduationDay) {
            eventsData = [
                {
                    title: "🎓 Graduation Day!",
                    time: "Today - You made it!",
                    icon: GraduationCap,
                    iconColor: "bg-purple-100 text-purple-600"
                },
                {
                    title: "Portfolio Presentations",
                    time: "Today at 2:00 PM",
                    icon: Trophy,
                    iconColor: "bg-gold-100 text-gold-600"
                },
                {
                    title: "Graduation Ceremony",
                    time: "Today at 4:00 PM",
                    icon: Calendar,
                    iconColor: "bg-blue-100 text-blue-600"
                }
            ]
        } else {
            // Pre-graduation events
            eventsData = [
                {
                    title: "Final Project Deadline",
                    time: "July 3rd at 11:59 PM",
                    icon: Target,
                    iconColor: "bg-red-100 text-red-600"
                },
                {
                    title: "Graduation Day",
                    time: "July 4th at 2:00 PM",
                    icon: GraduationCap,
                    iconColor: "bg-purple-100 text-purple-600"
                },
                {
                    title: "Portfolio Review",
                    time: "July 2nd at 10:00 AM",
                    icon: Trophy,
                    iconColor: "bg-green-100 text-green-600"
                }
            ]
        }
    } else {
        // Default events for other users
        eventsData = [
            {
                title: "Study Session",
                time: "Today at 2:00 PM",
                icon: Calendar,
                iconColor: "bg-blue-100 text-blue-600"
            },
            {
                title: "Project Milestone",
                time: "This Friday",
                icon: Target,
                iconColor: "bg-green-100 text-green-600"
            },
            {
                title: "Mentor Check-in",
                time: "Next Monday",
                icon: Trophy,
                iconColor: "bg-purple-100 text-purple-600"
            }
        ]
    }

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>
                    {isBlackOwlsStudent && isGraduationDay ? "🎉 Graduation Events" : "Upcoming Events"}
                </CardTitle>
                <CardDescription>
                    {isBlackOwlsStudent && isGraduationDay
                        ? "Today's graduation schedule"
                        : "Your schedule for the next few days"
                    }
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

                {isBlackOwlsStudent && isGraduationDay && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-800">
                            Congratulations on completing your coding journey! 🎉
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                            You've successfully completed {user?.role === 'STUDENT' ? 'your bootcamp' : 'the program'}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 