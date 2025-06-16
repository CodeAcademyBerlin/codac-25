import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressItem {
    name: string
    progress: number
}

const progressData: ProgressItem[] = [
    { name: "React Fundamentals", progress: 85 },
    { name: "Node.js & Express", progress: 65 },
    { name: "Database Design", progress: 40 },
    { name: "Full Stack Project", progress: 20 }
]

export function LearningProgress() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                    Your progress in the current bootcamp modules
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {progressData.map((item) => (
                    <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-sm text-muted-foreground">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
} 