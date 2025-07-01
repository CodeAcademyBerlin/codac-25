'use client';

import {
    BookOpen,
    Clock,
    CheckCircle2,
    TrendingUp,
    Calendar,
    Award
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    projects: Array<{
        id: string;
        title: string;
        lessons: Array<{
            id: string;
            title: string;
            progress: Array<{
                status: string;
            }>;
        }>;
    }>;
    _count: {
        enrollments: number;
        projects: number;
    };
}

interface User {
    id: string;
    name?: string | null;
    role: string;
}

interface LMSDashboardProps {
    user: User;
    enrolledCourses: Course[];
    allCourses: Course[];
}

export function LMSDashboard({ user, enrolledCourses, allCourses }: LMSDashboardProps) {
    const calculateCourseProgress = (course: Course) => {
        const totalLessons = course.projects.reduce((acc, project) => acc + project.lessons.length, 0);
        const completedLessons = course.projects.reduce((acc, project) =>
            acc + project.lessons.filter(lesson =>
                lesson.progress.some(p => p.status === 'COMPLETED')
            ).length, 0
        );

        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    };

    const totalLessons = enrolledCourses.reduce((acc, course) =>
        acc + course.projects.reduce((projectAcc, project) => projectAcc + project.lessons.length, 0), 0
    );

    const completedLessons = enrolledCourses.reduce((acc, course) =>
        acc + course.projects.reduce((projectAcc, project) =>
            projectAcc + project.lessons.filter(lesson =>
                lesson.progress.some(p => p.status === 'COMPLETED')
            ).length, 0
        ), 0
    );

    const inProgressLessons = enrolledCourses.reduce((acc, course) =>
        acc + course.projects.reduce((projectAcc, project) =>
            projectAcc + project.lessons.filter(lesson =>
                lesson.progress.some(p => p.status === 'IN_PROGRESS')
            ).length, 0
        ), 0
    );

    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold">Welcome back, {user.name || 'Student'}!</h1>
                <p className="text-muted-foreground">
                    Continue your learning journey and track your progress.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrolledCourses.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {allCourses.length - enrolledCourses.length} more available
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedLessons}</div>
                        <p className="text-xs text-muted-foreground">
                            out of {totalLessons} total lessons
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressLessons}</div>
                        <p className="text-xs text-muted-foreground">
                            lessons currently active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overallProgress}%</div>
                        <Progress value={overallProgress} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Current Courses */}
            {enrolledCourses.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Courses</CardTitle>
                        <CardDescription>
                            Continue learning from where you left off
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {enrolledCourses.map((course) => {
                                const progress = calculateCourseProgress(course);
                                const nextLesson = course.projects
                                    .flatMap(project => project.lessons)
                                    .find(lesson =>
                                        !lesson.progress.some(p => p.status === 'COMPLETED')
                                    );

                                return (
                                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <Badge variant="secondary" className="text-xs">
                                                    {course.category.replace('_', ' ')}
                                                </Badge>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">{progress}%</div>
                                                    <Progress value={progress} className="w-16 h-1 mt-1" />
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg">{course.title}</CardTitle>
                                            <CardDescription className="text-sm line-clamp-2">
                                                {course.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    {course._count.projects} projects
                                                </div>
                                                {nextLesson ? (
                                                    <Link href={`/lms/lessons/${nextLesson.id}`}>
                                                        <Button size="sm">Continue</Button>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/lms/courses/${course.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Award className="h-4 w-4 mr-1" />
                                                            Complete
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Explore New Courses */}
            {allCourses.length > enrolledCourses.length && (
                <Card>
                    <CardHeader>
                        <CardTitle>Explore New Courses</CardTitle>
                        <CardDescription>
                            Discover new skills and expand your knowledge
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allCourses
                                .filter(course => !enrolledCourses.some(enrolled => enrolled.id === course.id))
                                .slice(0, 6)
                                .map((course) => (
                                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <Badge variant="secondary" className="text-xs w-fit">
                                                {course.category.replace('_', ' ')}
                                            </Badge>
                                            <CardTitle className="text-lg">{course.title}</CardTitle>
                                            <CardDescription className="text-sm line-clamp-2">
                                                {course.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    {course._count.projects} projects • {course._count.enrollments} students
                                                </div>
                                                <Link href={`/lms/courses/${course.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        View Course
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                        {allCourses.length - enrolledCourses.length > 6 && (
                            <div className="mt-4 text-center">
                                <Link href="/lms/courses">
                                    <Button variant="outline">
                                        View All Courses ({allCourses.length - enrolledCourses.length} total)
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Getting Started */}
            {enrolledCourses.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Get Started
                        </CardTitle>
                        <CardDescription>
                            Welcome to the Learning Management System! Here's how to begin your journey.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-medium">Browse Available Courses</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Explore our course catalog and find subjects that interest you.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-medium">Enroll in Courses</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Click on any course to view details and enroll.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-medium">Start Learning</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Work through lessons at your own pace and track your progress.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link href="/lms/courses">
                                <Button>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Browse Courses
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 