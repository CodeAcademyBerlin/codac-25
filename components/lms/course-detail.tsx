'use client';

import {
    BookOpen,
    Users,
    Clock,
    CheckCircle2,
    PlayCircle,
    Calendar,
    Award,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { enrollInCourse, unenrollFromCourse } from '@/actions/lms/enroll-course';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    duration?: number | null;
    projects: Array<{
        id: string;
        title: string;
        description?: string | null;
        duration?: number | null;
        lessons: Array<{
            id: string;
            title: string;
            description?: string | null;
            type: string;
            duration?: number | null;
            progress: Array<{
                status: string;
            }>;
        }>;
    }>;
    enrollments: Array<{
        userId: string;
        user: {
            id: string;
            name?: string | null;
            avatar?: string | null;
        };
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

interface CourseDetailProps {
    course: Course;
    user: User;
    canEdit: boolean;
}

export function CourseDetail({ course, user, canEdit }: CourseDetailProps) {
    const router = useRouter();
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isUnenrolling, setIsUnenrolling] = useState(false);

    const isEnrolled = course.enrollments.some(enrollment => enrollment.userId === user.id);

    const calculateCourseProgress = () => {
        const totalLessons = course.projects.reduce((acc, project) => acc + project.lessons.length, 0);
        const completedLessons = course.projects.reduce((acc, project) =>
            acc + project.lessons.filter(lesson =>
                lesson.progress.some(p => p.status === 'COMPLETED')
            ).length, 0
        );

        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    };

    const handleEnroll = async () => {
        setIsEnrolling(true);
        try {
            const result = await enrollInCourse(course.id);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to enroll in course');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleUnenroll = async () => {
        setIsUnenrolling(true);
        try {
            const result = await unenrollFromCourse(course.id);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Failed to unenroll from course');
        } finally {
            setIsUnenrolling(false);
        }
    };

    const progress = isEnrolled ? calculateCourseProgress() : 0;

    return (
        <div className="space-y-6">
            {/* Course Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                            {course.category.replace('_', ' ')}
                        </Badge>
                        {course.duration && (
                            <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                {course.duration}h
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground mt-2">{course.description}</p>

                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course._count.enrollments} students
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course._count.projects} projects
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Course
                        </Button>
                    )}

                    {isEnrolled ? (
                        <Button
                            variant="outline"
                            onClick={handleUnenroll}
                            disabled={isUnenrolling}
                        >
                            {isUnenrolling ? 'Unenrolling...' : 'Unenroll'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleEnroll}
                            disabled={isEnrolling}
                        >
                            {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress Section (for enrolled students) */}
            {isEnrolled && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Your Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Overall Progress</span>
                                    <span className="text-sm text-muted-foreground">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {course.projects.reduce((acc, project) =>
                                            acc + project.lessons.filter(lesson =>
                                                lesson.progress.some(p => p.status === 'COMPLETED')
                                            ).length, 0
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {course.projects.reduce((acc, project) =>
                                            acc + project.lessons.filter(lesson =>
                                                lesson.progress.some(p => p.status === 'IN_PROGRESS')
                                            ).length, 0
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">In Progress</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {course.projects.reduce((acc, project) => acc + project.lessons.length, 0)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Lessons</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Course Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>
                        Explore the structured learning path for this course
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {course.projects.map((project, projectIndex) => (
                            <div key={project.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">
                                            Project {projectIndex + 1}: {project.title}
                                        </h3>
                                        {project.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs">
                                                {project.lessons.length} lessons
                                            </Badge>
                                            {project.duration && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {project.duration}h
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="space-y-2">
                                    {project.lessons.map((lesson, lessonIndex) => {
                                        const lessonProgress = lesson.progress[0];
                                        const isCompleted = lessonProgress?.status === 'COMPLETED';
                                        const isInProgress = lessonProgress?.status === 'IN_PROGRESS';

                                        return (
                                            <div key={lesson.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                                                <div className="flex-shrink-0">
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : isInProgress ? (
                                                        <Clock className="h-4 w-4 text-blue-500" />
                                                    ) : (
                                                        <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-sm">
                                                                {lessonIndex + 1}. {lesson.title}
                                                            </div>
                                                            {lesson.description && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {lesson.description}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {lesson.duration && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {lesson.duration}min
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="text-xs">
                                                                {lesson.type}
                                                            </Badge>
                                                            {isEnrolled && (
                                                                <Link href={`/lms/lessons/${lesson.id}`}>
                                                                    <Button size="sm" variant="ghost">
                                                                        {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Enrollment CTA for non-enrolled users */}
            {!isEnrolled && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Ready to Start Learning?
                        </CardTitle>
                        <CardDescription>
                            Join {course._count.enrollments} other students in this course
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleEnroll}
                            disabled={isEnrolling}
                            size="lg"
                            className="w-full"
                        >
                            {isEnrolling ? 'Enrolling...' : 'Enroll Now - It\'s Free!'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 