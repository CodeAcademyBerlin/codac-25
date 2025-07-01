'use client';

import { useState } from 'react';
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    PlayCircle,
    CheckCircle2,
    Clock,
    Plus,
    Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
            type: string;
            progress: Array<{
                status: string;
            }>;
        }>;
    }>;
    enrollments?: Array<{ userId: string; }>;
    _count: {
        enrollments: number;
        projects: number;
    };
}

interface LMSSidebarProps {
    enrolledCourses: Course[];
    allCourses: Course[];
    userRole: string;
}

export function LMSSidebar({ enrolledCourses, allCourses, userRole }: LMSSidebarProps) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [openCourses, setOpenCourses] = useState<Set<string>>(new Set());

    const toggleCourse = (courseId: string) => {
        const newOpenCourses = new Set(openCourses);
        if (newOpenCourses.has(courseId)) {
            newOpenCourses.delete(courseId);
        } else {
            newOpenCourses.add(courseId);
        }
        setOpenCourses(newOpenCourses);
    };

    const calculateCourseProgress = (course: Course) => {
        const totalLessons = course.projects.reduce((acc, project) => acc + project.lessons.length, 0);
        const completedLessons = course.projects.reduce((acc, project) =>
            acc + project.lessons.filter(lesson =>
                lesson.progress.some(p => p.status === 'COMPLETED')
            ).length, 0
        );

        return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    };

    const getLessonIcon = (lesson: { progress: Array<{ status: string; }>; type: string }) => {
        const progress = lesson.progress[0];
        if (progress?.status === 'COMPLETED') {
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        } else if (progress?.status === 'IN_PROGRESS') {
            return <Clock className="h-4 w-4 text-blue-500" />;
        } else {
            return <PlayCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const filteredEnrolledCourses = enrolledCourses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAllCourses = allCourses.filter(course =>
        !enrolledCourses.some(enrolled => enrolled.id === course.id) &&
        (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <aside className="w-80 border-r bg-muted/30">
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 pt-0">
                    {/* Enrolled Courses */}
                    {filteredEnrolledCourses.length > 0 && (
                        <div className="mb-6">
                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                My Enrolled Courses
                            </h3>
                            {filteredEnrolledCourses.map((course) => {
                                const progress = calculateCourseProgress(course);
                                const isOpen = openCourses.has(course.id);

                                return (
                                    <Collapsible key={course.id} open={isOpen} onOpenChange={() => toggleCourse(course.id)}>
                                        <div className="mb-2">
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-sm h-auto p-2"
                                                >
                                                    {isOpen ? (
                                                        <ChevronDown className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 mr-2" />
                                                    )}
                                                    <BookOpen className="h-4 w-4 mr-2" />
                                                    <div className="flex-1 text-left">
                                                        <div className="font-medium">{course.title}</div>
                                                        <div className="flex items-center mt-1">
                                                            <Progress value={progress} className="h-1 flex-1 mr-2" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {progress}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="ml-6 mt-2">
                                                    {course.projects.map((project) => (
                                                        <div key={project.id} className="mb-3">
                                                            <div className="text-xs font-medium text-muted-foreground mb-1">
                                                                {project.title}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {project.lessons.map((lesson) => (
                                                                    <Link
                                                                        key={lesson.id}
                                                                        href={`/lms/lessons/${lesson.id}`}
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={cn(
                                                                                "w-full justify-start h-8 px-2 text-xs",
                                                                                pathname === `/lms/lessons/${lesson.id}` && "bg-accent"
                                                                            )}
                                                                        >
                                                                            {getLessonIcon(lesson)}
                                                                            <span className="ml-2 truncate">{lesson.title}</span>
                                                                        </Button>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                );
                            })}
                        </div>
                    )}

                    {/* Available Courses */}
                    {filteredAllCourses.length > 0 && (
                        <div>
                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                Available Courses
                            </h3>
                            {filteredAllCourses.map((course) => (
                                <Link key={course.id} href={`/lms/courses/${course.id}`}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-sm h-auto p-3 mb-2"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <Plus className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">{course.title}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {course._count.projects} projects • {course._count.enrollments} students
                                                </div>
                                                <Badge variant="secondary" className="mt-1 text-xs">
                                                    {course.category.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Admin/Mentor Tools */}
                    {['ADMIN', 'MENTOR'].includes(userRole) && (
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                Instructor Tools
                            </h3>
                            <div className="space-y-2">
                                <Link href="/lms/admin">
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        Admin Dashboard
                                    </Button>
                                </Link>
                                <Link href="/lms/admin/courses">
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        Manage Courses
                                    </Button>
                                </Link>
                                <Link href="/lms/admin/enrollments">
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        Manage Enrollments
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
} 