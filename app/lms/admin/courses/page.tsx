import Link from 'next/link';
import { Suspense } from 'react';
import { Plus, BookOpen, Settings } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { prisma } from '@/lib/db';

async function CoursesContent() {
    const courses = await prisma.course.findMany({
        include: {
            projects: {
                include: {
                    _count: {
                        select: { lessons: true }
                    }
                }
            },
            _count: {
                select: {
                    enrollments: true,
                    projects: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Course Management</h1>
                    <p className="text-muted-foreground">Create and manage courses, projects, and lessons</p>
                </div>
                <Link href="/lms/admin/courses/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Course
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {courses.map((course) => (
                    <Card key={course.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <CardTitle className="text-xl">{course.title}</CardTitle>
                                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                                            {course.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                        <Badge variant="outline">
                                            {course.category.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <CardDescription className="max-w-2xl">
                                        {course.description}
                                    </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Link href={`/lms/admin/courses/${course.id}`}>
                                        <Button size="sm">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Manage
                                        </Button>
                                    </Link>
                                    <Link href={`/lms/courses/${course.id}`}>
                                        <Button size="sm" variant="outline">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{course._count.projects}</div>
                                    <div className="text-sm text-muted-foreground">Projects</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {course.projects.reduce((acc, project) => 
                                            acc + project._count.lessons, 0
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Lessons</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{course._count.enrollments}</div>
                                    <div className="text-sm text-muted-foreground">Students</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{course.duration || 0}</div>
                                    <div className="text-sm text-muted-foreground">Hours</div>
                                </div>
                            </div>

                            {course.projects.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Projects</h4>
                                    <div className="grid gap-2">
                                        {course.projects.map((project) => (
                                            <div key={project.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div>
                                                    <div className="font-medium">{project.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {project._count.lessons} lessons
                                                        {project.duration && ` • ${project.duration} hours`}
                                                    </div>
                                                </div>
                                                <Badge variant={project.isPublished ? "default" : "secondary"}>
                                                    {project.isPublished ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {courses.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first course to get started with the LMS.
                            </p>
                            <Link href="/lms/admin/courses/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Course
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function CoursesPage() {
    return (
        <Suspense fallback={<div>Loading courses...</div>}>
            <CoursesContent />
        </Suspense>
    );
} 