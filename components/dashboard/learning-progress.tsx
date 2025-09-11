import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getLearningProgress } from '@/data/dashboard'

export async function LearningProgress() {
    const progressData = await getLearningProgress()

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                    Your progress across different learning tracks
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {progressData.length > 0 ? (
                    progressData.map((item) => (
                        <div key={item.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Link
                                    href={`/lms/courses/${item.courseId}`}
                                    className="text-sm font-medium hover:text-primary transition-colors"
                                >
                                    {item.name}
                                </Link>
                                <span className="text-sm text-muted-foreground">{Math.round(item.progress)}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{item.category.replace('_', ' ')}</span>
                                <Link
                                    href={`/lms/courses/${item.courseId}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    View course →
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No courses enrolled yet</p>
                        <Link
                            href="/learning"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                        >
                            Browse Learning Tracks
                        </Link>
                    </div>
                )}

                {progressData.length > 0 && (
                    <div className="pt-4 mt-4 border-t">
                        <Link
                            href="/learning"
                            className="text-sm text-primary hover:underline"
                        >
                            View all learning tracks →
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 