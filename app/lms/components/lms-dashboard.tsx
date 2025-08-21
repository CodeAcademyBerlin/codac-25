'use client';

import {
    BookOpen,
    Clock,
    CheckCircle2,
    TrendingUp,
    Calendar,
    Award,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

import { PageHeader, Section, StatsGrid } from '@/components/layout';
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

// Map course categories to learning tracks
const categoryToTrack = {
    'WEB_DEVELOPMENT': { name: 'Web Development', slug: 'web' },
    'DATA_SCIENCE': { name: 'Data Science', slug: 'data' },
    'CAREER_DEVELOPMENT': { name: 'Career Services', slug: 'career' }
};

export function LMSDashboard({ user: _user, enrolledCourses, allCourses }: LMSDashboardProps) {
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

    // Group courses by track
    const coursesByTrack = allCourses.reduce((acc, course) => {
        const track = categoryToTrack[course.category as keyof typeof categoryToTrack];
        if (track) {
            if (!acc[track.slug]) acc[track.slug] = { info: track, courses: [] };
            acc[track.slug].courses.push(course);
        }
        return acc;
    }, {} as Record<string, { info: typeof categoryToTrack[keyof typeof categoryToTrack], courses: Course[] }>);

    return (
        <Section>
            {/* Header with Navigation */}
            <div className="flex items-center gap-2 mb-2">
                <Link href="/learning" className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <span className="text-sm text-muted-foreground">Learning / Course Management</span>
            </div>
            
            <PageHeader 
                title="Course Management"
                description="Manage your enrolled courses, track progress, and explore new learning opportunities."
            />

            {/* Stats Overview */}
            <StatsGrid>
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
            </StatsGrid>

            {/* Learning Tracks Organization */}
            {Object.entries(coursesByTrack).map(([trackSlug, { info, courses }]) => {
                const enrolledInTrack = courses.filter(course =>
                    enrolledCourses.some(enrolled => enrolled.id === course.id)
                );
                const availableInTrack = courses.filter(course =>
                    !enrolledCourses.some(enrolled => enrolled.id === course.id)
                );

                if (courses.length === 0) return null;

                return (
                    <Card key={trackSlug}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        {info.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {enrolledInTrack.length} enrolled • {availableInTrack.length} available
                                    </CardDescription>
                                </div>
                                <Link href={`/learning/${trackSlug}`}>
                                    <Button variant="outline" size="sm">
                                        View Track
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Enrolled Courses in Track */}
                            {enrolledInTrack.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-medium mb-3 text-sm text-muted-foreground">YOUR COURSES</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {enrolledInTrack.map((course) => {
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
                                                            <Badge variant="default" className="text-xs">
                                                                Enrolled
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
                                </div>
                            )}

                            {/* Available Courses in Track */}
                            {availableInTrack.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-3 text-sm text-muted-foreground">AVAILABLE COURSES</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {availableInTrack.slice(0, 3).map((course) => (
                                            <Card key={course.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader className="pb-3">
                                                    <Badge variant="secondary" className="text-xs w-fit">
                                                        {course._count.enrollments} students
                                                    </Badge>
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
                                    {availableInTrack.length > 3 && (
                                        <div className="mt-4">
                                            <Link href={`/learning/${trackSlug}`}>
                                                <Button variant="ghost" size="sm">
                                                    View {availableInTrack.length - 3} more courses →
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {/* Getting Started */}
            {enrolledCourses.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Get Started with Structured Learning
                        </CardTitle>
                        <CardDescription>
                            Choose a learning track to begin your educational journey with guided courses and projects.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-medium">Choose a Learning Track</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Start with Web Development, Data Science, or Career Services.
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
                                        Join structured courses with projects and assessments.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-medium">Track Your Progress</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Monitor your advancement and earn certificates.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Link href="/learning">
                                <Button>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Explore Learning Tracks
                                </Button>
                            </Link>
                            <Link href="/lms/courses">
                                <Button variant="outline">
                                    Browse All Courses
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </Section>
    );
} 