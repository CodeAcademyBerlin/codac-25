'use client';

import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    PlayCircle,
    CheckCircle2,
    Clock,
    Plus,
    Search,
    TreePine,
    List,
    Edit3
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import { LMSTreeSidebar } from '@/components/lms/lms-tree-sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LMSTreeNode } from '@/data/lms/lms-hierarchy';
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
    lmsHierarchy: LMSTreeNode[];
}

export function LMSSidebar({ enrolledCourses, allCourses, userRole, lmsHierarchy }: LMSSidebarProps) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [openCourses, setOpenCourses] = useState<Set<string>>(new Set());
    const [isTreeView, setIsTreeView] = useState(false);

    const canEdit = ['ADMIN', 'MENTOR'].includes(userRole);

    // Persist tree view state in localStorage for edit mode
    useEffect(() => {
        if (canEdit) {
            const savedTreeViewState = localStorage.getItem('lms-tree-view-mode');
            if (savedTreeViewState === 'true') {
                setIsTreeView(true);
            }
        }
    }, [canEdit]);

    const toggleTreeView = () => {
        const newTreeView = !isTreeView;
        setIsTreeView(newTreeView);

        // Save state to localStorage when user can edit
        if (canEdit) {
            localStorage.setItem('lms-tree-view-mode', newTreeView.toString());
        }
    };

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
        <aside className="h-full flex flex-col">
            <div className="p-4">
                {/* View Toggle (only for admins/mentors) */}
                {canEdit && (
                    <div className="mb-4">
                        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Edit3 className="h-3 w-3" />
                            Edit Mode
                        </div>
                        <Button
                            variant={isTreeView ? "default" : "outline"}
                            size="sm"
                            onClick={toggleTreeView}
                            className="w-full gap-2"
                        >
                            {isTreeView ? (
                                <>
                                    <TreePine className="h-4 w-4" />
                                    Tree View (Drag & Drop)
                                </>
                            ) : (
                                <>
                                    <List className="h-4 w-4" />
                                    List View
                                </>
                            )}
                        </Button>
                        {isTreeView && (
                            <p className="text-xs text-muted-foreground mt-1 text-center">
                                Drag to reorganize • Mode stays active until exited
                            </p>
                        )}
                    </div>
                )}

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

            <ScrollArea className="flex-1 h-0">
                <div className="p-4 pt-0">
                    {/* Tree View for Editing */}
                    {isTreeView && canEdit ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <TreePine className="h-4 w-4" />
                                        Structure Editor
                                    </h3>
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                        Persistent Mode
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsTreeView(false);
                                        localStorage.setItem('lms-tree-view-mode', 'false');
                                    }}
                                    className="h-6 px-2 text-xs"
                                >
                                    <List className="h-3 w-3 mr-1" />
                                    Exit
                                </Button>
                            </div>
                            <LMSTreeSidebar
                                nodes={lmsHierarchy}
                                onNodesChange={() => { }}
                                canEdit={canEdit}
                            />
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
} 