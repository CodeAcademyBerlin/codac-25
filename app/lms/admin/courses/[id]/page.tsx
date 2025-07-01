import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, BookOpen, Users, Trash2 } from 'lucide-react';
import { prisma } from '@/lib/db';
import { CourseForm } from '@/components/lms/course-form';
import { CourseProjectsManager } from '@/components/lms/course-projects-manager';
import { CourseEnrollmentsManager } from '@/components/lms/course-enrollments-manager';

async function CourseManagementContent({ id }: { id: string }) {
    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            projects: {
                include: {
                    lessons: {
                        orderBy: { order: 'asc' }
                    },
                    _count: {
                        select: { lessons: true }
                    }
                },
                orderBy: { order: 'asc' }
            },
            enrollments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        }
                    }
                },
                orderBy: { enrolledAt: 'desc' }
            },
            _count: {
                select: {
                    enrollments: true,
                    projects: true
                }
            }
        }
    });

    if (!course) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                            {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">
                            {course.category.replace('_', ' ')}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{course.description}</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/lms/courses/${course.id}`}>
                        <Button variant="outline">
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Course
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Course Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{course._count.projects}</div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lessons</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {course.projects.reduce((acc, project) => acc + project._count.lessons, 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{course._count.enrollments}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duration</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{course.duration || 0}h</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Course Settings */}
                <div className="space-y-6">
                    <CourseForm course={course} mode="edit" />
                </div>

                {/* Course Content Management */}
                <div className="space-y-6">
                    <CourseProjectsManager course={course} />
                </div>
            </div>

            {/* Enrollment Management */}
            <CourseEnrollmentsManager course={course} />
        </div>
    );
}

export default async function CourseManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    return (
        <Suspense fallback={<div>Loading course management...</div>}>
            <CourseManagementContent id={id} />
        </Suspense>
    );
} 