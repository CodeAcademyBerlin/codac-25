import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressItem {
    name: string
    progress: number
    track: string
}

// Updated to match the imported LMS content structure
const progressData: ProgressItem[] = [
    { name: "Web Development - Module 2", progress: 75, track: "web" },
    { name: "Data Science - Module 1", progress: 45, track: "data" },
    { name: "Career Services - Step 1", progress: 20, track: "career" },
    { name: "JavaScript Fundamentals", progress: 85, track: "web" }
]

export function LearningProgress() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                    Your progress across different learning tracks
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {progressData.map((item, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Link 
                                href={`/learning/${item.track}`} 
                                className="text-sm font-medium hover:text-primary transition-colors"
                            >
                                {item.name}
                            </Link>
                            <span className="text-sm text-muted-foreground">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                    </div>
                ))}
                
                <div className="pt-4 mt-4 border-t">
                    <Link 
                        href="/learning"
                        className="text-sm text-primary hover:underline"
                    >
                        View all learning tracks →
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
} 